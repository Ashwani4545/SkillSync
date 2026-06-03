"""
benchmark_task.py
Async Celery task for industry benchmark comparison.
"""
from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10, name="workers.benchmark_task.run_benchmark")
def run_benchmark(self, resume_json: dict, target_role: str, industry: str):
    from ai_engine.comparators.benchmark_engine import benchmark_resume

    try:
        return benchmark_resume(resume_json, target_role, industry)
    except Exception as exc:
        raise self.retry(exc=exc)
