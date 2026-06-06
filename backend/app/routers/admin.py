"""
admin.py — Internal admin router (Phase 4)
GET /api/v1/admin/spend          Daily & monthly LLM spend
GET /api/v1/admin/spend/breakdown  Spend by feature
GET /api/v1/admin/alerts         Active cost alerts
GET /api/v1/admin/health         Full system health check
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.db.models import User
from app.middleware.auth import get_current_user
from app.core.config import settings

router = APIRouter()


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Simple admin check — in production replace with role-based check."""
    if settings.ENVIRONMENT == "production":
        # Add your admin check here, e.g. check a hardcoded admin email list
        pass
    return current_user


@router.get("/spend")
def get_spend(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    from app.services.cost_tracker import get_daily_spend, get_monthly_spend
    return {
        "daily_usd":   round(get_daily_spend(db),   4),
        "monthly_usd": round(get_monthly_spend(db), 4),
        "daily_limit_usd":   50.0,
        "monthly_limit_usd": 500.0,
    }


@router.get("/spend/breakdown")
def get_spend_breakdown(
    days: int = 7,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    from app.services.cost_tracker import get_spend_by_feature
    return {"days": days, "breakdown": get_spend_by_feature(db, days)}


@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    from app.services.cost_tracker import check_alerts
    alerts = check_alerts(db)
    return {"alerts": alerts, "count": len(alerts)}


@router.get("/health")
def full_health(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    import redis as redis_lib

    # DB check
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False

    # Redis check
    try:
        r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        r.ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    # Celery worker check (ping)
    try:
        from workers.celery_app import celery_app
        inspect = celery_app.control.inspect(timeout=2)
        workers = inspect.ping()
        celery_ok = bool(workers)
        worker_count = len(workers) if workers else 0
    except Exception:
        celery_ok    = False
        worker_count = 0

    return {
        "database":     "ok" if db_ok    else "error",
        "redis":        "ok" if redis_ok else "error",
        "celery":       "ok" if celery_ok else "error",
        "worker_count": worker_count,
        "overall":      "ok" if (db_ok and redis_ok) else "degraded",
    }


@router.get("/users/stats")
def user_stats(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    rows = db.execute(text("""
        SELECT plan, COUNT(*) as count
        FROM users
        GROUP BY plan
        ORDER BY plan
    """)).fetchall()

    total = db.execute(text("SELECT COUNT(*) as c FROM users")).fetchone()
    analyses = db.execute(text("SELECT COUNT(*) as c FROM analyses WHERE status='done'")).fetchone()

    return {
        "total_users":     total.c if total else 0,
        "total_analyses":  analyses.c if analyses else 0,
        "by_plan":         {r.plan: r.count for r in rows},
    }
