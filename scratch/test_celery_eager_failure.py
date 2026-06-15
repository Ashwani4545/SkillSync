import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set environment
os.environ["ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = "postgresql://postgres:Ashwani%404545@localhost:5432/resumeai"

from app.core.config import settings
from workers.celery_app import celery_app

@celery_app.task(bind=True)
def fail_task(self):
    print("Running fail_task...")
    raise RuntimeError("Expected task failure")

if __name__ == "__main__":
    print("Settings ENVIRONMENT:", settings.ENVIRONMENT)
    print("Celery eager mode:", celery_app.conf.task_always_eager)
    print("Celery backend:", celery_app.backend)
    try:
        fail_task.delay()
    except Exception as e:
        print("Caught expected exception:", type(e), e)
