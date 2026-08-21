# Kronyx — Task Board

## Agent Infrastructure (agent-3)
- [ ] docker-compose.yml complet
- [ ] railway.toml multi-services
- [ ] .env.example avec toutes les vars
- [ ] .gitignore Python + Node + Railway
- [ ] README.md avec instructions de démarrage
- [ ] Dockerfiles placeholders pour chaque service

## Agent Backend (agent-4)
- [ ] Structure FastAPI complète (/backend/)
- [ ] Modèles SQLAlchemy (users, competitors, pages, snapshots, changes, daily_reports)
- [ ] Schemas Pydantic v2
- [ ] Auth JWT (register, login, refresh, logout)
- [ ] Routers: auth, users, competitors, pages, changes, reports, dashboard
- [ ] Services métier
- [ ] Alembic migrations (migration initiale)
- [ ] Celery app configuration
- [ ] Requirements.txt + Dockerfile

## Agent Scraper (agent-5)
- [ ] Structure Python package (/scraper/)
- [ ] Playwright scraper avec gestion erreurs
- [ ] Vérification robots.txt
- [ ] Détection hash SHA256
- [ ] Détection sémantique embeddings + pgvector cosine similarity
- [ ] Celery tasks: scrape_page, scrape_all_pages
- [ ] Connexion DB pour stocker snapshots
- [ ] Requirements.txt + Dockerfile

## Agent AI Pipeline (agent-6)
- [ ] Structure Python package (/ai_pipeline/)
- [ ] Client DeepSeek (OpenAI SDK, model: deepseek-chat)
- [ ] Workflow LangGraph: input→analysis→categorization→output
- [ ] Prompts structurés pour analyse des diffs
- [ ] Output JSON: summary, category, impact_level, key_changes, strategic_recommendation
- [ ] Celery task: analyze_change
- [ ] Fallback DeepSeek R1 pour impact=high
- [ ] Requirements.txt + Dockerfile

## Agent Notifications (agent-7)
- [ ] Structure Python package (/notifications/)
- [ ] Client Resend API
- [ ] Template Jinja2 email HTML responsive (dark/light)
- [ ] Compilation rapport quotidien depuis DB
- [ ] Celery Beat schedule: scrape 02:00 UTC, emails 07:00 par timezone
- [ ] Celery task: send_daily_reports
- [ ] Requirements.txt + Dockerfile

## Agent Frontend (agent-8)
- [ ] Projet Vite + React 18 + TypeScript (/frontend/)
- [ ] ShadCN/ui + Tailwind CSS setup
- [ ] Dark/light mode (CSS variables + class="dark")
- [ ] Couleurs: #0A1628 bg-dark, #2563EB accent
- [ ] Pages: Login, Register, Dashboard, Competitors, CompetitorDetail, History, Reports, Settings, Account
- [ ] Layout avec Sidebar + Navbar
- [ ] Service API axios avec intercepteurs auth
- [ ] Zustand auth store + TanStack Query
- [ ] Recharts pour graphiques dashboard
- [ ] Dockerfile nginx
