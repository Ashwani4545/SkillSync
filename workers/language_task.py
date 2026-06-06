from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10,
                 name="workers.language_task.run_cultural_adaptation")
def run_cultural_adaptation(self, resume_json: dict, target_country: str):
    from ai_engine.generators.cultural_adapter import adapt_for_country
    try:
        return adapt_for_country(resume_json, target_country)
    except Exception as exc:
        raise self.retry(exc=exc)
