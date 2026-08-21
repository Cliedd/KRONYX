from celery import Celery
from celery.schedules import crontab
from notifications.config import settings

celery_app = Celery("kronyx_notifications")
celery_app.conf.update(
    broker_url=settings.REDIS_URL,
    result_backend=settings.REDIS_URL,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        # Scraping quotidien à 2h UTC
        "scrape-all-pages-daily": {
            "task": "kronyx.scrape_all_pages",
            "schedule": crontab(hour=2, minute=0),
            "options": {"queue": "scraping"},
        },
        # Envoi des rapports à 7h UTC
        "send-daily-reports": {
            "task": "kronyx.send_daily_reports",
            "schedule": crontab(hour=7, minute=0),
            "options": {"queue": "notifications"},
        },
    },
)
celery_app.autodiscover_tasks(["notifications.tasks"])
