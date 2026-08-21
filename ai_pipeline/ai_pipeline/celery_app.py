from celery import Celery
from ai_pipeline.config import settings

celery_app = Celery("kronyx_ai")
celery_app.conf.update(
    broker_url=settings.REDIS_URL,
    result_backend=settings.REDIS_URL,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)
celery_app.autodiscover_tasks(["ai_pipeline.tasks"])
