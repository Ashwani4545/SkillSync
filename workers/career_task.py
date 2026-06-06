from workers.celery_app import celery_app
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10, name="workers.career_task.run_career_prediction")
def run_career_prediction(self, resume_json: dict):
    from ai_engine.generators.career_predictor import predict_career_trajectory
    try:
        return predict_career_trajectory(resume_json)
    except Exception as exc:
        raise self.retry(exc=exc)
