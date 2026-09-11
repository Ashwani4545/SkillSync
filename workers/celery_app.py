from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "resumeai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["workers.analyze_task"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=86400,  # 24h
    task_always_eager=settings.ENVIRONMENT == "development",
)
