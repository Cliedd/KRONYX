"""Healthcheck simple pour Railway."""
import sys
from scraper.celery_app import celery_app


def check():
    inspector = celery_app.control.inspect(timeout=3)
    stats = inspector.stats()
    if stats:
        print("Workers actifs:", list(stats.keys()))
        sys.exit(0)
    else:
        print("Aucun worker actif")
        sys.exit(1)


if __name__ == "__main__":
    check()
