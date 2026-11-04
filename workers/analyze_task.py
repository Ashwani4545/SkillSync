"""
analyze_task.py - the main async Celery task.

Fixes vs the original:
  * It set status=failed and THEN called self.retry(). The UI polls the status
    and stops at "failed", but the retry could still succeed, so users saw a
    failure for an analysis that then completed. Status now stays "processing"
    during retries and becomes "failed" only on the final failure.
  * It retried EVERYTHING (bugs, bad input, schema errors) up to 3 runs of a
    paid LLM call. Only transient errors (network, timeouts, rate limits, 5xx,
    unparseable model output) are retried.
  * `error_msg = str(exc)` was shown to users and could leak internals.
    Users get a generic message; the details go to the logs/Sentry.
  * On final failure the user's monthly quota unit (reserved by /analysis/start)
    is refunded.
  * The resume JSON and JD were passed through Redis (and are visible in Flower
    and Sentry). The task now loads them from the database by analysis_id;
    the old arguments are still accepted so already-queued messages keep working.
  * Idempotent: a duplicate delivery of a finished analysis is a no-op.
  * Soft time limit (set in docker-compose) is handled explicitly: no retry.
"""
import logging
import os
import sys
from datetime import datetime

from celery.exceptions import SoftTimeLimitExceeded
from sqlalchemy import func

from workers.celery_app import celery_app

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = logging.getLogger(__name__)
GENERIC_FAILURE = "The analysis could not be completed. Please try again."


def _transient_errors() -> tuple:
    errs: list = []
    try:
        import anthropic
        errs += [
            anthropic.APIConnectionError, anthropic.APITimeoutError,
            anthropic.RateLimitError, anthropic.InternalServerError,
        ]
    except Exception:  # pragma: no cover
        pass
    try:
        from ai_engine.career_intelligence_engine import LLMOutputError
        errs.append(LLMOutputError)
    except Exception:  # pragma: no cover
        pass
    return tuple(errs)


def _finalize_failure(db, analysis, user_id) -> None:
    """Mark failed and give the user their quota unit back. Never raises."""
    from app.db.models import AnalysisStatusEnum, User
    try:
        db.rollback()
        analysis.status = AnalysisStatusEnum.failed
        analysis.error_msg = GENERIC_FAILURE
        if user_id is not None:
            used = func.coalesce(User.analyses_used_this_month, 0)
            db.query(User).filter(User.id == user_id, used > 0).update(
                {User.analyses_used_this_month: used - 1}, synchronize_session=False
            )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Could not record analysis failure for %s", getattr(analysis, "id", "?"))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=15)
def run_analysis(
    self,
    analysis_id: str,
    resume_json: dict | None = None,       # ignored: loaded from the DB
    jd_text: str | None = None,            # ignored: loaded from the DB
    user_plan: str | None = None,          # ignored: loaded from the DB
    target_role: str | None = None,
    demanded_skills: str | None = None,
):
    from ai_engine.pipeline import run_full_pipeline
    from app.db.models import Analysis, AnalysisStatusEnum, Resume, User
    from app.db.session import SessionLocal

    db = SessionLocal()
    analysis = None
    user_id = None
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis or analysis.status == AnalysisStatusEnum.done:
            return  # unknown id, or duplicate delivery of a finished job

        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        if not resume or not resume.parsed_json:
            _finalize_failure(db, analysis, resume.user_id if resume else None)
            return
        user_id = resume.user_id
        user = db.query(User).filter(User.id == user_id).first()
        plan = user.plan.value if user else "free"

        analysis.status = AnalysisStatusEnum.processing
        db.commit()

        results = run_full_pipeline(
            resume_json=resume.parsed_json,
            jd_text=analysis.jd_text,
            user_plan=plan,
            target_role=target_role,
            demanded_skills=demanded_skills,
        )
        results["metadata"] = {"target_role": target_role, "demanded_skills": demanded_skills}

        analysis.results_json = results
        analysis.status = AnalysisStatusEnum.done
        analysis.completed_at = datetime.utcnow()
        db.commit()

    except SoftTimeLimitExceeded:
        logger.error("Analysis %s hit the soft time limit", analysis_id)
        if analysis is not None:
            _finalize_failure(db, analysis, user_id)

    except Exception as exc:
        db.rollback()
        retriable = isinstance(exc, _transient_errors()) and self.request.retries < self.max_retries
        if retriable:
            logger.warning("Analysis %s transient failure, retrying: %s", analysis_id, exc)
            raise self.retry(exc=exc)          # status stays "processing"
        logger.exception("Analysis %s failed permanently", analysis_id)
        if analysis is not None:
            _finalize_failure(db, analysis, user_id)

    finally:
        db.close()