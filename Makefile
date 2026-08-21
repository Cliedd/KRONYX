.PHONY: help dev backend frontend migrate workers install build

help:
	@echo "Kronyx — Commandes disponibles:"
	@echo "  make dev              - Lance tout avec Docker Compose"
	@echo "  make backend          - Lance le backend FastAPI en local"
	@echo "  make frontend         - Lance le frontend Vite en local"
	@echo "  make migrate          - Lance les migrations Alembic"
	@echo "  make install          - Installe toutes les dépendances"
	@echo "  make build            - Build le frontend pour production"
	@echo "  make scraper-worker   - Lance le worker Celery de scraping"
	@echo "  make ai-worker        - Lance le worker Celery IA"
	@echo "  make notif-worker     - Lance le worker Celery notifications + Beat"
	@echo "  make logs-backend     - Logs du service backend Docker"
	@echo "  make clean            - Supprime les containers Docker"

dev:
	docker-compose up --build

dev-bg:
	docker-compose up --build -d

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

migrate:
	cd backend && alembic upgrade head

migrate-down:
	cd backend && alembic downgrade -1

migrate-history:
	cd backend && alembic history

scraper-worker:
	cd scraper && celery -A scraper.celery_app worker -Q scraping -l info -c 3

ai-worker:
	cd ai_pipeline && celery -A ai_pipeline.celery_app worker -Q ai_analysis -l info -c 2

notif-worker:
	cd notifications && celery -A notifications.celery_app worker -B -Q notifications -l info

install:
	pip install -r backend/requirements.txt
	pip install -r scraper/requirements.txt
	pip install -r ai_pipeline/requirements.txt
	pip install -r notifications/requirements.txt
	cd frontend && npm install

install-playwright:
	playwright install chromium
	playwright install-deps chromium

build:
	cd frontend && npm run build

logs-backend:
	docker-compose logs -f backend

logs-scraper:
	docker-compose logs -f scraper

logs-ai:
	docker-compose logs -f ai_pipeline

logs-notif:
	docker-compose logs -f notifications

clean:
	docker-compose down -v --remove-orphans

ps:
	docker-compose ps
