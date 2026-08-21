from celery import Celery
from app.config import settings

celery_app = Celery("kronyx")
celery_app.conf.update(
    broker_url=settings.REDIS_URL,
    result_backend=settings.REDIS_URL,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "kronyx.scrape_*": {"queue": "scraping"},
        "kronyx.analyze_*": {"queue": "ai_analysis"},
        "kronyx.send_*": {"queue": "notifications"},
    },
)
