"""
admin.py - Internal admin router

GET /api/v1/admin/spend            Daily & monthly LLM spend
GET /api/v1/admin/spend/breakdown  Spend by feature
GET /api/v1/admin/alerts           Active cost alerts
GET /api/v1/admin/health           Full system health check
GET /api/v1/admin/users/stats      User counts by plan

Fixes vs the original:
  * CRITICAL: _require_admin() returned the user for ANYONE logged in
    (the production branch was `pass`). Any free account could read revenue
    mix, spend, infrastructure status and user counts. Access now requires the
    caller's Clerk id to be in ADMIN_CLERK_IDS; with an empty list nobody gets
    in (fail closed). Non-admins get 404 so the routes don't advertise
    themselves.
  * `days` is bounded (it fed a query unbounded).
  * "overall" health ignored Celery, so it said "ok" while no worker was
    running and every analysis sat on "pending".
  * Spend limits come from settings, and every admin call is logged.
  * Also block /api/v1/admin/ at nginx (see infra/nginx/nginx.conf).
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User
from app.db.session import get_db
from app.middleware.auth import get_current_user, is_dev_environment

logger = logging.getLogger(__name__)
router = APIRouter()


def _admin_ids() -> set[str]:
    return {i.strip() for i in settings.ADMIN_CLERK_IDS.split(",") if i.strip()}


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    allowed = _admin_ids()
    is_admin = current_user.clerk_id in allowed
    # Local dev convenience only: the dev user is admin when dev auth is on.
    if not is_admin and is_dev_environment() and settings.ALLOW_DEV_AUTH and current_user.clerk_id == "dev_user_clerk_id":
        is_admin = True
    if not is_admin:
        raise HTTPException(status_code=404, detail="Not found")
    logger.info("admin access by clerk_id=%s", current_user.clerk_id)
    return current_user


@router.get("/spend")
def get_spend(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    from app.services.cost_tracker import get_daily_spend, get_monthly_spend
    return {
        "daily_usd": round(get_daily_spend(db), 4),
        "monthly_usd": round(get_monthly_spend(db), 4),
        "daily_limit_usd": settings.LLM_DAILY_LIMIT_USD,
        "monthly_limit_usd": settings.LLM_MONTHLY_LIMIT_USD,
    }


@router.get("/spend/breakdown")
def get_spend_breakdown(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    from app.services.cost_tracker import get_spend_by_feature
    return {"days": days, "breakdown": get_spend_by_feature(db, days)}


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    from app.services.cost_tracker import check_alerts
    alerts = check_alerts(db)
    return {"alerts": alerts, "count": len(alerts)}


@router.get("/health")
def full_health(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    import redis as redis_lib

    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        logger.exception("health: database check failed")
        db_ok = False

    try:
        redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2).ping()
        redis_ok = True
    except Exception:
        logger.exception("health: redis check failed")
        redis_ok = False

    try:
        from workers.celery_app import celery_app
        workers = celery_app.control.inspect(timeout=2).ping()
        celery_ok, worker_count = bool(workers), (len(workers) if workers else 0)
    except Exception:
        logger.exception("health: celery check failed")
        celery_ok, worker_count = False, 0

    return {
        "database": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "error",
        "celery": "ok" if celery_ok else "error",
        "worker_count": worker_count,
        # No worker == analyses never finish, so that is "degraded" too.
        "overall": "ok" if (db_ok and redis_ok and celery_ok) else "degraded",
    }


@router.get("/users/stats")
def user_stats(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    rows = db.execute(text("SELECT plan, COUNT(*) AS count FROM users GROUP BY plan ORDER BY plan")).fetchall()
    total = db.execute(text("SELECT COUNT(*) AS c FROM users")).fetchone()
    analyses = db.execute(text("SELECT COUNT(*) AS c FROM analyses WHERE status = 'done'")).fetchone()
    return {
        "total_users": total.c if total else 0,
        "total_analyses": analyses.c if analyses else 0,
        "by_plan": {str(getattr(r.plan, "value", r.plan)): r.count for r in rows},
    }