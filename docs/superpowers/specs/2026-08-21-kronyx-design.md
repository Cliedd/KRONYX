# Kronyx — Design Spec
**Date:** 2026-08-21  
**Status:** Approved for implementation  
**Slogan:** "Anticipez les mouvements du marché"

---

## 1. Purpose

Kronyx is a B2B SaaS competitive intelligence platform that automatically monitors competitor pages (Pricing, Blog, Changelog), detects changes using semantic analysis, generates AI-powered strategic briefings via DeepSeek V3, and delivers daily email digests to decision-makers.

**Success criteria:**
- Competitors monitored: 5–10 per user (MVP)
- Change detection accuracy: >95% (no false positives)
- Daily email delivered at 7:00 AM user's local time
- Scrape latency: <2 min per page
- AI cost per user: <€5/month

---

## 2. Architecture

### 2.1 Components

```
KRONYX/
├── backend/          # FastAPI REST API (Port 8000)
├── scraper/          # Playwright workers via Celery
├── ai_pipeline/      # LangGraph + DeepSeek analysis workers
├── notifications/    # Resend email + Celery Beat scheduler
├── frontend/         # React 18 + Vite dashboard (Port 5173)
├── docs/
├── docker-compose.yml
├── railway.toml
└── .env.example
```

### 2.2 Data Flow

```
[React Dashboard] ←→ [FastAPI :8000]
                           ↕
                    [PostgreSQL/Neon]
                           ↕
              [Redis Queue] ← Celery Beat (CRON)
             /      |      \
    [Scraper   [AI Pipeline  [Notifications
     Worker]    Worker]       Worker]
```

### 2.3 Infrastructure

| Service | Platform | Notes |
|---------|----------|-------|
| API Backend | Railway | FastAPI, auto-scale |
| Scraper Workers | Railway | Celery + Playwright |
| AI Workers | Railway | Celery + DeepSeek |
| Notification Workers | Railway | Celery Beat |
| Frontend | Railway | Vite static build |
| Database | Neon | PostgreSQL + pgvector |
| Redis | Railway | Celery broker + result backend |

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | 18 / 5 / 5 |
| UI Components | ShadCN/ui + Tailwind CSS | latest |
| State | Zustand + TanStack Query | 5 / 5 |
| Router | React Router | v6 |
| Charts | Recharts | 2 |
| Backend | FastAPI + Uvicorn | 0.115 / 0.30 |
| ORM | SQLAlchemy 2.0 (async) + asyncpg | 2.0 |
| Migrations | Alembic | 1.13 |
| Validation | Pydantic v2 | 2.9 |
| Auth | JWT (python-jose) + bcrypt | — |
| Task Queue | Celery + Redis | 5.4 |
| Scraping | Playwright + BeautifulSoup4 | latest |
| AI Orchestration | LangGraph + LangChain | 0.2 / 0.3 |
| LLM | DeepSeek V3 (`deepseek-chat`) | via OpenAI SDK |
| LLM Complex | DeepSeek R1 (`deepseek-reasoner`) | high-impact only |
| Embeddings | `text-embedding-3-small` (OpenAI) or DeepSeek | for semantic diff |
| Email | Resend API + Jinja2 templates | — |
| Database | Neon PostgreSQL + pgvector | — |

---

## 4. Database Schema

### users
```sql
id UUID PK, email UNIQUE, password_hash TEXT,
company_name TEXT, timezone TEXT DEFAULT 'UTC',
notification_emails TEXT[],  -- multiple recipients
synthesis_tone TEXT DEFAULT 'direct',  -- 'formel'|'direct'|'détaillé'
plan TEXT DEFAULT 'starter',
created_at TIMESTAMPTZ
```

### competitors
```sql
id UUID PK, user_id UUID FK→users,
name TEXT, website TEXT, is_active BOOL DEFAULT true,
created_at TIMESTAMPTZ
```

### pages
```sql
id UUID PK, competitor_id UUID FK→competitors,
url TEXT, type TEXT CHECK('pricing','blog','changelog','custom'),
is_active BOOL DEFAULT true, last_scraped_at TIMESTAMPTZ
```

### snapshots
```sql
id UUID PK, page_id UUID FK→pages,
content_hash TEXT, content_text TEXT, content_html TEXT,
embedding VECTOR(1536),  -- pgvector
scraped_at TIMESTAMPTZ
```

### changes
```sql
id UUID PK, page_id UUID FK→pages,
snapshot_id_old UUID FK→snapshots, snapshot_id_new UUID FK→snapshots,
diff_text TEXT, category TEXT,  -- 'Prix'|'Fonctionnalité'|'Positionnement'|'Communication'
impact_level TEXT CHECK('low','medium','high'),
summary TEXT,  -- AI-generated
analyzed_at TIMESTAMPTZ
```

### daily_reports
```sql
id UUID PK, user_id UUID FK→users,
report_date DATE, content JSONB, sent_at TIMESTAMPTZ
```

---

## 5. API Contract

**Base:** `http://localhost:8000/api/v1`  
**Auth:** Bearer JWT token in `Authorization` header

### Authentication
```
POST /auth/register    {email, password, company_name, timezone}
POST /auth/login       {email, password} → {access_token, token_type}
POST /auth/logout
GET  /auth/me
```

### Users
```
GET  /users/me
PUT  /users/me         {company_name, timezone, notification_emails, synthesis_tone}
```

### Competitors
```
GET    /competitors
POST   /competitors    {name, website}
GET    /competitors/{id}
PUT    /competitors/{id}
DELETE /competitors/{id}
```

### Pages
```
GET    /competitors/{id}/pages
POST   /competitors/{id}/pages  {url, type}
PUT    /pages/{id}              {is_active}
DELETE /pages/{id}
```

### Changes
```
GET /changes?competitor_id=&category=&impact_level=&from=&to=&limit=&offset=
GET /changes/{id}
```

### Reports
```
GET /reports
GET /reports/{date}
```

### Dashboard
```
GET /dashboard/stats           → {total_competitors, total_pages, changes_today, changes_week}
GET /dashboard/recent-changes  → last 10 changes with competitor info
```

---

## 6. Celery Tasks

| Task Name | Triggered By | Description |
|-----------|-------------|-------------|
| `kronyx.scrape_all_pages` | Celery Beat (daily 2:00 AM) | Enqueues scrape for all active pages |
| `kronyx.scrape_page` | `scrape_all_pages` or manual | Scrapes one page, stores snapshot |
| `kronyx.analyze_change` | `scrape_page` on diff detected | LangGraph analysis → note |
| `kronyx.send_daily_reports` | Celery Beat (7:00 AM per TZ) | Compiles and sends email digests |

---

## 7. Change Detection Logic

1. **Hash check** (fast): SHA256 of cleaned text content. If identical → skip.
2. **Semantic check** (on hash change): cosine similarity of pgvector embeddings. Threshold: 0.85. If similarity > 0.85 → minor change, skip AI analysis.
3. **AI analysis** (on significant change): diff sent to DeepSeek V3. DeepSeek R1 used when `impact_level` prediction is `high`.

---

## 8. AI Analysis Prompt Strategy

**Input to LLM:**
- Old content (truncated to 2000 chars)
- New content (truncated to 2000 chars)
- Diff text
- Competitor name + page type

**Output (structured JSON):**
```json
{
  "summary": "Le concurrent X a baissé son prix sur le plan Pro de 20 %...",
  "category": "Prix",
  "impact_level": "high",
  "key_changes": ["Prix Pro: 99€ → 79€", "Ajout fonctionnalité IA"],
  "strategic_recommendation": "Revoir notre positionnement tarifaire..."
}
```

---

## 9. Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Auth form |
| `/register` | Register | Signup + onboarding step |
| `/` | Dashboard | Stats, recent changes, chart 7/30/90j |
| `/competitors` | Competitors | List, add, edit, delete |
| `/competitors/:id` | Competitor Detail | Pages list, change history |
| `/history` | History | Filterable change log |
| `/reports` | Reports | Daily email previews |
| `/settings` | Settings | Tone, recipients, frequency |
| `/account` | Account | Profile, plan, billing |

**Design system:** ShadCN/ui components, Tailwind CSS, dark/light mode via CSS variables + `class="dark"` on `<html>`. Primary colors: `#0A1628` (dark bg) / `#2563EB` (accent). Font: Inter.

---

## 10. Email Template Structure

```
Subject: [Kronyx] Votre veille du {date} — {N} changements détectés

Header: Logo + "Veille concurrentielle du {date}"
Body:   Per-competitor sections:
          - Competitor name + favicon
          - Per-change: category badge, impact badge, summary, link
Footer: "Se désabonner" | "Voir dans le dashboard" | Legal
```

---

## 11. Deployment (Railway)

**Services in `railway.toml`:**
- `backend`: FastAPI, Dockerfile, `PORT=8000`
- `scraper`: Celery worker, Playwright installed
- `ai-pipeline`: Celery worker
- `notifications`: Celery worker + Beat
- `frontend`: Vite build → nginx static

**Environment variables (all services share):**
```
DATABASE_URL=postgresql+asyncpg://...neon.tech/kronyx?ssl=require
SYNC_DATABASE_URL=postgresql://...neon.tech/kronyx?sslmode=require
REDIS_URL=redis://...railway.internal:6379
DEEPSEEK_API_KEY=sk-...
RESEND_API_KEY=re_...
JWT_SECRET_KEY=<random-256-bit>
FRONTEND_URL=https://kronyx.up.railway.app
ENVIRONMENT=production
```

---

## 12. MVP Scope (6 weeks)

**In scope:**
- Auth, competitor/page management, scraping, AI analysis, daily email, dashboard, history, settings

**Out of scope (post-MVP):**
- Slack alerts, PDF export, real-time scraping (Enterprise), Bright Data proxies, mobile app

---

*Spec written by Claude Code — 2026-08-21*
