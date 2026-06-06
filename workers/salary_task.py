from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10, name="workers.salary_task.run_salary_estimation")
def run_salary_estimation(self, resume_json: dict, target_role: str, location: str):
    from ai_engine.generators.salary_estimator import estimate_salary
    try:
        return estimate_salary(resume_json, target_role, location)
    except Exception as exc:
        raise self.retry(exc=exc)
