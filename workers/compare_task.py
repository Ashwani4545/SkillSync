"""
compare_task.py
Async Celery task for A/B resume comparison.
Returns result directly via Celery result backend (no DB table needed).
"""
from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10, name="workers.compare_task.run_comparison")
def run_comparison(
    self,
    resume_a_json: dict,
    resume_b_json: dict,
    jd_text: str | None,
    resume_a_id: str,
    resume_b_id: str,
):
    from ai_engine.comparators.ab_tester import compare_resumes

    try:
        result = compare_resumes(resume_a_json, resume_b_json, jd_text)
        result["resume_a_id"] = resume_a_id
        result["resume_b_id"] = resume_b_id
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
