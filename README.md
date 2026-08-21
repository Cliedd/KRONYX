# Kronyx — Competitive Intelligence SaaS

Kronyx is a B2B SaaS platform for automated competitive intelligence. It monitors competitors' websites, detects meaningful changes using AI, and delivers structured alerts to your team in real time.

---

## Architecture

```
                          ┌─────────────────────────────────────────────┐
                          │                  KRONYX                      │
                          └─────────────────────────────────────────────┘

  ┌───────────┐     API      ┌────────────┐    Tasks    ┌─────────────┐
  │  Frontend │ ──────────── │  Backend   │ ─────────── │    Redis    │
  │  (React)  │              │ (FastAPI)  │             │   (Queue)   │
  └───────────┘              └────────────┘             └──────┬──────┘
                                   │                           │
                                   │ ORM                  ┌────┴────────────────────┐
                                   ▼                      │                         │
                          ┌────────────────┐        ┌─────┴──────┐   ┌─────────────┴──┐
                          │   PostgreSQL   │        │  Scraper   │   │  AI Pipeline   │
                          │  + pgvector   │        │(Playwright)│   │  (DeepSeek)    │
                          └────────────────┘        └─────┬──────┘   └──────┬─────────┘
                                                          │                  │
                                                          └──────┬───────────┘
                                                                 ▼
                                                      ┌──────────────────────┐
                                                      │    Notifications     │
                                                      │  (Celery Beat +      │
                                                      │   Resend Email)      │
                                                      └──────────────────────┘
```

### Services

| Service        | Technology              | Role                                              |
|----------------|-------------------------|---------------------------------------------------|
| `frontend`     | React + Vite + shadcn   | User dashboard, alert management                  |
| `backend`      | FastAPI + SQLAlchemy    | REST API, auth, business logic                    |
| `scraper`      | Celery + Playwright     | Scheduled page scraping, diff detection           |
| `ai_pipeline`  | Celery + DeepSeek       | Semantic analysis, change classification          |
| `notifications`| Celery Beat + Resend    | Email digest, Slack webhook dispatch              |
| `postgres`     | PostgreSQL 16 + pgvector| Persistent storage, vector embeddings             |
| `redis`        | Redis 7                 | Celery broker, result backend, cache              |

---

## Prerequisites

- **Python** 3.11+
- **Node.js** 20+
- **Docker** 24+ & Docker Compose v2
- **Git**

---

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/kronyx.git
cd kronyx
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in your actual values
```

### 3. Start all services

```bash
docker compose up --build
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 4. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

---

## Neon DB Configuration

1. Create a project at https://console.neon.tech
2. Copy the connection string from the dashboard
3. Update `DATABASE_URL` and `SYNC_DATABASE_URL` in your `.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.us-east-1.aws.neon.tech/kronyx?ssl=require
SYNC_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/kronyx?sslmode=require
```

4. Enable the `pgvector` extension in your Neon database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Railway Deployment

### Prerequisites
- Railway CLI: `npm install -g @railway/cli`
- Logged in: `railway login`

### Deploy steps

```bash
# Link to your Railway project
railway link

# Set environment variables
railway variables set DATABASE_URL=<your_neon_url>
railway variables set REDIS_URL=<your_redis_url>
railway variables set DEEPSEEK_API_KEY=<your_key>
railway variables set RESEND_API_KEY=<your_key>
railway variables set JWT_SECRET_KEY=<your_secret>

# Deploy
railway up
```

Each service (`backend`, `scraper`, `ai_pipeline`, `notifications`, `frontend`) maps to a separate Railway service within the same project. The `railway.toml` at the root applies to each service's build and deploy configuration.

---

## Required Environment Variables

| Variable                         | Description                              | Required |
|----------------------------------|------------------------------------------|----------|
| `DATABASE_URL`                   | Async PostgreSQL connection string       | Yes      |
| `SYNC_DATABASE_URL`              | Sync PostgreSQL connection string        | Yes      |
| `REDIS_URL`                      | Redis connection string                  | Yes      |
| `DEEPSEEK_API_KEY`               | DeepSeek API key for AI analysis         | Yes      |
| `RESEND_API_KEY`                 | Resend API key for email delivery        | Yes      |
| `JWT_SECRET_KEY`                 | 256-bit secret for JWT signing           | Yes      |
| `ENVIRONMENT`                    | `development` or `production`            | Yes      |
| `FRONTEND_URL`                   | Frontend origin for CORS                 | Yes      |
| `DEEPSEEK_MODEL`                 | DeepSeek model name (default: deepseek-chat) | No   |
| `SCRAPING_CONCURRENT_PAGES`      | Parallel Playwright pages (default: 5)   | No       |
| `SEMANTIC_SIMILARITY_THRESHOLD`  | Min cosine similarity for dedup (default: 0.85) | No |

See `.env.example` for the full list.

---

## Useful Commands

### Development

```bash
# Start all services
docker compose up

# Start only infrastructure (DB + Redis)
docker compose up postgres redis

# Rebuild a single service
docker compose up --build backend

# Follow logs for a service
docker compose logs -f scraper
```

### Database Migrations

```bash
# Apply all pending migrations
docker compose exec backend alembic upgrade head

# Create a new migration
docker compose exec backend alembic revision --autogenerate -m "your message"

# Rollback one migration
docker compose exec backend alembic downgrade -1
```

### Celery Workers

```bash
# Monitor all workers (Flower UI)
docker compose exec backend celery -A app.celery_app flower

# Inspect active tasks
docker compose exec scraper celery -A scraper.celery_app inspect active

# Purge a queue
docker compose exec scraper celery -A scraper.celery_app purge -Q scraping
```

### Testing

```bash
# Run backend tests
docker compose exec backend pytest -v

# Run with coverage
docker compose exec backend pytest --cov=app --cov-report=html
```
