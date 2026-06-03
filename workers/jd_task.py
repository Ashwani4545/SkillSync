"""
jd_task.py
Async Celery task for JD adaptation — runs in background,
saves result back to jd_matches table.
"""
from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10, name="workers.jd_task.run_jd_adaptation")
def run_jd_adaptation(self, match_id: str, resume_json: dict, jd_text: str):
    from app.db.session import SessionLocal
    from app.db.models import JDMatch
    from ai_engine.generators.jd_adapter import adapt_resume_to_jd

    db = SessionLocal()
    try:
        match = db.query(JDMatch).filter(JDMatch.id == match_id).first()
        if not match:
            return

        adapted = adapt_resume_to_jd(resume_json, jd_text)

        match.adapted_resume_json = adapted
        match.match_score = adapted.get("match_score_after", 0)
        db.commit()

        return {"match_id": match_id, "match_score": match.match_score}

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc)
    finally:
        db.close()
