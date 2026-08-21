# Kronyx — Architecture Notes
**Generated:** 2026-08-21  
**Source:** `docs/superpowers/specs/2026-08-21-kronyx-design.md`  
**Status:** Reference for all agents

---

## 1. Key Architecture Decisions

### Async-first backend
FastAPI is configured with **SQLAlchemy 2.0 async** (`asyncpg` driver). Every database query must use `async with session` patterns. Mixing sync and async sessions will cause runtime deadlocks. A separate `SYNC_DATABASE_URL` (plain `postgresql://` scheme, no `+asyncpg`) is provided exclusively for Alembic migrations, which cannot run in async context.

### Dual database URL requirement
Two environment variables are required for the same Neon database:
- `DATABASE_URL` — uses `postgresql+asyncpg://` scheme, for the FastAPI application runtime.
- `SYNC_DATABASE_URL` — uses `postgresql://` scheme with `sslmode=require`, for Alembic CLI and any Celery tasks that require synchronous DB access.

### Celery with Redis as both broker and result backend
Redis serves a dual role: task broker (job queue) and result backend (stores task return values). Both roles use the same `REDIS_URL`. This simplifies ops but means Redis is a single point of failure for the entire task pipeline.

### Three worker pools, one Beat scheduler
The `notifications` service runs both a Celery worker **and** Celery Beat. Beat must run as a **single instance** — deploying multiple `notifications` replicas will cause duplicate email sends. The `scraper` and `ai-pipeline` workers are safe to scale horizontally.

### LLM cost control via tiered model usage
- **DeepSeek V3** (`deepseek-chat`): default for all AI analysis — low cost.
- **DeepSeek R1** (`deepseek-reasoner`): only invoked when `impact_level` is predicted `high`. This is a deliberate cost gate. The AI pipeline must pre-classify impact before routing to R1.

### pgvector for semantic deduplication
Embeddings (`VECTOR(1536)`) are stored on the `snapshots` table. The cosine similarity threshold of **0.85** acts as the gate between "minor change, skip AI" and "significant change, trigger analysis." This threshold is critical — too low causes false positives; too high misses real changes.

### Embedding provider flexibility
The spec lists `text-embedding-3-small` (OpenAI) **or** DeepSeek as embedding sources. A concrete choice must be made at implementation time and must remain consistent — mixing embedding models across snapshots will make cosine similarity comparisons invalid.

---

## 2. Inter-Service Dependencies (Who Calls Who)

```
React Frontend (Port 5173)
    └── HTTP/REST ──► FastAPI Backend (Port 8000)
                          ├── READ/WRITE ──► Neon PostgreSQL (pgvector)
                          └── ENQUEUE ──────► Redis (Celery broker)

Redis (Celery broker)
    ├── DISPATCH ──► Scraper Worker (Celery)
    │                   ├── READ/WRITE ──► Neon PostgreSQL (snapshots, pages)
    │                   └── ENQUEUE ──────► Redis (triggers analyze_change task)
    │
    ├── DISPATCH ──► AI Pipeline Worker (Celery)
    │                   ├── READ/WRITE ──► Neon PostgreSQL (changes table)
    │                   └── HTTP ─────────► DeepSeek API (deepseek-chat / deepseek-reasoner)
    │                   └── HTTP ─────────► OpenAI/DeepSeek Embeddings API
    │
    └── DISPATCH ──► Notifications Worker + Beat (Celery)
                        ├── READ ─────────► Neon PostgreSQL (daily_reports, changes, users)
                        ├── WRITE ────────► Neon PostgreSQL (daily_reports.sent_at)
                        └── HTTP ─────────► Resend API (email delivery)

Celery Beat (inside Notifications service)
    ├── CRON 02:00 AM UTC ──► Enqueues `kronyx.scrape_all_pages` → Redis
    └── CRON 07:00 AM per-TZ ──► Enqueues `kronyx.send_daily_reports` → Redis
```

**Key chaining:** `scrape_all_pages` → `scrape_page` (per page) → `analyze_change` (on diff) → data is ready for `send_daily_reports`. This is a sequential dependency across three workers. If the scraping window (02:00 AM) does not complete before the email send window (07:00 AM), reports will be incomplete.

---

## 3. Environment Variables — Shared Usage

All five Railway services share the same environment variable set.

| Variable | Used By | Purpose |
|---|---|---|
| `DATABASE_URL` | backend, scraper, ai-pipeline, notifications | Async SQLAlchemy connection to Neon (`+asyncpg` scheme) |
| `SYNC_DATABASE_URL` | alembic (migrations only) | Sync connection for Alembic CLI (`postgresql://` scheme, `sslmode=require`) |
| `REDIS_URL` | backend, scraper, ai-pipeline, notifications | Celery broker + result backend; also used for any caching |
| `DEEPSEEK_API_KEY` | ai-pipeline | Authenticates calls to DeepSeek V3 and R1 via OpenAI-compatible SDK |
| `RESEND_API_KEY` | notifications | Authenticates email delivery via Resend API |
| `JWT_SECRET_KEY` | backend | Signs and verifies JWT access tokens; must be 256-bit random, never rotated without invalidating all sessions |
| `FRONTEND_URL` | backend | Used in CORS `allow_origins` and in email links ("View in dashboard") |
| `ENVIRONMENT` | all | Controls debug logging, error verbosity; must be `production` on Railway |

**Not in the shared set but implied:**
- `PORT=8000` — set per-service in `railway.toml` for the backend service only.
- `OPENAI_API_KEY` — required if `text-embedding-3-small` is chosen as the embedding provider.

---

## 4. Implementation Pitfalls

### Celery Beat singleton
Celery Beat must run as exactly **one instance**. Railway auto-scaling or accidental duplicate deploys of the `notifications` service will result in duplicate task enqueues and multiple emails sent to users. Mitigation: set `notifications` service replica count to `1` explicitly in `railway.toml` and never enable auto-scaling for it.

### Timezone-aware email scheduling
The spec states emails are delivered at "7:00 AM user's local time." The `users.timezone` column stores the user's timezone. `send_daily_reports` must iterate over distinct timezones, calculate the UTC equivalent, and either:
- Run a Beat schedule that fires every hour and filters users whose local time is 07:00, or
- Dynamically create per-timezone Beat schedules at startup.
The naive implementation (one fixed 07:00 AM cron) delivers at 07:00 UTC only, which is wrong for users in other timezones.

### pgvector extension must be enabled on Neon
Neon does not enable `pgvector` by default on all plans. The Alembic migration that creates the `snapshots` table must first run `CREATE EXTENSION IF NOT EXISTS vector;`. Failing to do so will cause the migration to fail silently or error on the `VECTOR(1536)` column type.

### Embedding model consistency
Once an embedding model is chosen (OpenAI `text-embedding-3-small` vs. DeepSeek), it must never be swapped without re-embedding all existing snapshots. Cosine similarity between vectors from different models is meaningless. Consider storing the embedding model name in the `snapshots` table for future-proofing.

### Content truncation at 2000 chars
The AI prompt truncates old and new content to 2000 characters each. For pricing pages with long tables or changelogs with many entries, this may cut off critical information. The `diff_text` field (not truncated) should carry the structural diff; the 2000-char limit applies to the raw content context only.

### Hash-based deduplication on dynamic content
Playwright renders JavaScript. Pages with dynamic elements (timestamps, ad banners, random testimonials) will produce a different SHA256 hash on every scrape even when the meaningful content is unchanged. The "clean text" extraction step (BeautifulSoup4) must aggressively strip noise elements before hashing, or false positives will flood the AI pipeline.

### JWT has no refresh token
The spec defines `POST /auth/login → {access_token, token_type}` with no refresh token. The frontend must handle 401 responses and redirect to `/login`. Decide on token expiry duration before implementation — too short causes poor UX; too long is a security risk.

### DeepSeek via OpenAI SDK
DeepSeek is accessed via the OpenAI-compatible SDK (`base_url` pointed at DeepSeek's API). Ensure the `openai` Python package version supports custom `base_url` (>=1.0). Model names must be `deepseek-chat` and `deepseek-reasoner` exactly — not OpenAI model names.

### Neon SSL requirement
Both `DATABASE_URL` and `SYNC_DATABASE_URL` require SSL. The async URL uses `?ssl=require` as a query param (asyncpg syntax). The sync URL uses `?sslmode=require` (psycopg2 syntax). Using the wrong SSL param format for each driver causes a connection failure at startup.

---

## 5. Production Startup Order

Services must come online in this order to avoid failed health checks and task processing errors:

```
1. Neon PostgreSQL        — External managed service; verify connectivity first.
                            Run Alembic migrations: `alembic upgrade head`
                            (requires SYNC_DATABASE_URL, pgvector extension enabled)

2. Redis                  — Must be healthy before any Celery service starts.
                            Celery workers and Beat cannot connect without it.

3. FastAPI Backend        — Depends on PostgreSQL (connection pool on startup)
                            and Redis (for any task enqueuing from API endpoints).
                            Health check: GET /api/v1/health (implement this endpoint)

4. Scraper Worker         — Celery worker; depends on Redis (broker) and PostgreSQL.
                            Playwright browsers must be installed in the Docker image.

5. AI Pipeline Worker     — Celery worker; depends on Redis and PostgreSQL.
                            Also depends on DeepSeek API being reachable (external).

6. Notifications Worker   — Celery worker + Beat; depends on Redis and PostgreSQL.
                            MUST be last to start — Beat will immediately enqueue
                            any overdue tasks upon startup.

7. Frontend               — Static build served by nginx; depends only on Backend
                            being reachable for API calls (checked at runtime, not startup).
```

**Migration gate:** Alembic migrations (`alembic upgrade head`) must complete successfully before steps 3–7. In Railway, use a `deploy` command or a release phase command to run migrations before the backend process starts.
