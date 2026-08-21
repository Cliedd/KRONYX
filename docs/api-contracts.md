# Kronyx — API Contracts
**Generated:** 2026-08-21  
**Source:** `docs/superpowers/specs/2026-08-21-kronyx-design.md`  
**Status:** Reference for frontend and integration agents

---

## Base Configuration

```
Base URL (dev):  http://localhost:8000/api/v1
Base URL (prod): https://<backend>.up.railway.app/api/v1
Content-Type:    application/json
Authorization:   Bearer <access_token>   (all endpoints except /auth/register and /auth/login)
```

---

## Authentication

### POST /auth/register

Create a new user account.

**Request**
```json
{
  "email": "alice@acme.com",
  "password": "s3cur3P@ss!",
  "company_name": "Acme Corp",
  "timezone": "Europe/Paris"
}
```

**Response 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@acme.com",
  "company_name": "Acme Corp",
  "timezone": "Europe/Paris",
  "plan": "starter",
  "created_at": "2026-08-21T08:00:00Z"
}
```

**Errors**
- `400` — email already registered, weak password
- `422` — validation error (missing fields, invalid email format)

---

### POST /auth/login

Authenticate and receive a JWT access token.

**Request**
```json
{
  "email": "alice@acme.com",
  "password": "s3cur3P@ss!"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors**
- `401` — invalid credentials
- `422` — missing fields

---

### POST /auth/logout

Invalidate the current session (server-side token blacklist or client-side discard).

**Request** — No body. Pass `Authorization: Bearer <token>` header.

**Response 200**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Return the authenticated user's profile.

**Response 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@acme.com",
  "company_name": "Acme Corp",
  "timezone": "Europe/Paris",
  "notification_emails": ["alice@acme.com", "bob@acme.com"],
  "synthesis_tone": "direct",
  "plan": "starter",
  "created_at": "2026-08-21T08:00:00Z"
}
```

---

## Users

### GET /users/me

Alias of `GET /auth/me`. Returns the full user profile.

**Response 200** — Same schema as `GET /auth/me`.

---

### PUT /users/me

Update user profile settings.

**Request** — All fields optional; only send what changes.
```json
{
  "company_name": "Acme Corp International",
  "timezone": "America/New_York",
  "notification_emails": ["alice@acme.com", "cto@acme.com"],
  "synthesis_tone": "détaillé"
}
```

Valid `synthesis_tone` values: `"formel"` | `"direct"` | `"détaillé"`

**Response 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@acme.com",
  "company_name": "Acme Corp International",
  "timezone": "America/New_York",
  "notification_emails": ["alice@acme.com", "cto@acme.com"],
  "synthesis_tone": "détaillé",
  "plan": "starter",
  "created_at": "2026-08-21T08:00:00Z"
}
```

**Errors**
- `422` — invalid `synthesis_tone` value, invalid timezone string

---

## Competitors

### GET /competitors

List all competitors for the authenticated user.

**Response 200**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Rival",
    "website": "https://rivalcorp.com",
    "is_active": true,
    "created_at": "2026-08-20T10:00:00Z"
  }
]
```

---

### POST /competitors

Add a new competitor to monitor.

**Request**
```json
{
  "name": "Rival Corp",
  "website": "https://rivalcorp.com"
}
```

**Response 201**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Rival Corp",
  "website": "https://rivalcorp.com",
  "is_active": true,
  "created_at": "2026-08-21T09:00:00Z"
}
```

**Errors**
- `400` — MVP limit exceeded (max 10 competitors per user)
- `422` — missing `name` or `website`, invalid URL format

---

### GET /competitors/{id}

Get a single competitor with its pages.

**Path params:** `id` — UUID of the competitor

**Response 200**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Rival Corp",
  "website": "https://rivalcorp.com",
  "is_active": true,
  "created_at": "2026-08-21T09:00:00Z",
  "pages": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "url": "https://rivalcorp.com/pricing",
      "type": "pricing",
      "is_active": true,
      "last_scraped_at": "2026-08-21T02:05:00Z"
    }
  ]
}
```

**Errors**
- `404` — competitor not found or belongs to another user

---

### PUT /competitors/{id}

Update a competitor's details.

**Request** — All fields optional.
```json
{
  "name": "Rival Corp (Rebranded)",
  "website": "https://newrivalcorp.com",
  "is_active": false
}
```

**Response 200** — Updated competitor object (same schema as GET /competitors/{id}, without `pages`).

**Errors**
- `404` — not found

---

### DELETE /competitors/{id}

Delete a competitor and cascade-delete its pages and snapshots.

**Response 204** — No content.

**Errors**
- `404` — not found

---

## Pages

### GET /competitors/{id}/pages

List all monitored pages for a competitor.

**Path params:** `id` — UUID of the competitor

**Response 200**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://rivalcorp.com/pricing",
    "type": "pricing",
    "is_active": true,
    "last_scraped_at": "2026-08-21T02:05:00Z"
  },
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://rivalcorp.com/blog",
    "type": "blog",
    "is_active": true,
    "last_scraped_at": "2026-08-21T02:07:00Z"
  }
]
```

---

### POST /competitors/{id}/pages

Add a page to monitor for a competitor.

**Path params:** `id` — UUID of the competitor

**Request**
```json
{
  "url": "https://rivalcorp.com/changelog",
  "type": "changelog"
}
```

Valid `type` values: `"pricing"` | `"blog"` | `"changelog"` | `"custom"`

**Response 201**
```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://rivalcorp.com/changelog",
  "type": "changelog",
  "is_active": true,
  "last_scraped_at": null
}
```

**Errors**
- `404` — competitor not found
- `422` — invalid `type` value, invalid URL, missing fields

---

### PUT /pages/{id}

Enable or disable a monitored page.

**Path params:** `id` — UUID of the page

**Request**
```json
{
  "is_active": false
}
```

**Response 200**
```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://rivalcorp.com/changelog",
  "type": "changelog",
  "is_active": false,
  "last_scraped_at": "2026-08-21T02:07:00Z"
}
```

**Errors**
- `404` — page not found

---

### DELETE /pages/{id}

Remove a page from monitoring.

**Response 204** — No content.

**Errors**
- `404` — page not found

---

## Changes

### GET /changes

List detected changes with optional filters. Supports pagination.

**Query parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `competitor_id` | UUID | No | Filter by competitor |
| `category` | string | No | `"Prix"` \| `"Fonctionnalité"` \| `"Positionnement"` \| `"Communication"` |
| `impact_level` | string | No | `"low"` \| `"medium"` \| `"high"` |
| `from` | ISO 8601 date | No | Start of date range (e.g. `2026-08-01`) |
| `to` | ISO 8601 date | No | End of date range (e.g. `2026-08-21`) |
| `limit` | integer | No | Page size, default `20`, max `100` |
| `offset` | integer | No | Pagination offset, default `0` |

**Response 200**
```json
{
  "total": 42,
  "limit": 20,
  "offset": 0,
  "items": [
    {
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "page_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "snapshot_id_old": "f6a7b8c9-d0e1-2345-fabc-456789012345",
      "snapshot_id_new": "a7b8c9d0-e1f2-3456-abcd-567890123456",
      "diff_text": "- Prix Pro: 99€/mois\n+ Prix Pro: 79€/mois",
      "category": "Prix",
      "impact_level": "high",
      "summary": "Rival Corp a baissé son prix Pro de 99€ à 79€, soit une réduction de 20%.",
      "analyzed_at": "2026-08-21T02:15:00Z",
      "competitor": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Rival Corp",
        "website": "https://rivalcorp.com"
      },
      "page": {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "url": "https://rivalcorp.com/pricing",
        "type": "pricing"
      }
    }
  ]
}
```

---

### GET /changes/{id}

Get a single change with full AI analysis output.

**Path params:** `id` — UUID of the change

**Response 200**
```json
{
  "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "page_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "snapshot_id_old": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "snapshot_id_new": "a7b8c9d0-e1f2-3456-abcd-567890123456",
  "diff_text": "- Prix Pro: 99€/mois\n+ Prix Pro: 79€/mois",
  "category": "Prix",
  "impact_level": "high",
  "summary": "Rival Corp a baissé son prix Pro de 99€ à 79€, soit une réduction de 20%.",
  "analyzed_at": "2026-08-21T02:15:00Z",
  "ai_analysis": {
    "key_changes": ["Prix Pro: 99€ → 79€", "Ajout fonctionnalité IA"],
    "strategic_recommendation": "Revoir notre positionnement tarifaire face à cette baisse agressive."
  },
  "competitor": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Rival Corp",
    "website": "https://rivalcorp.com"
  },
  "page": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "url": "https://rivalcorp.com/pricing",
    "type": "pricing"
  }
}
```

**Errors**
- `404` — change not found

---

## Reports

### GET /reports

List all daily report metadata for the authenticated user, most recent first.

**Response 200**
```json
[
  {
    "id": "b8c9d0e1-f2a3-4567-bcde-678901234567",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "report_date": "2026-08-21",
    "sent_at": "2026-08-21T06:00:00Z"
  },
  {
    "id": "c9d0e1f2-a3b4-5678-cdef-789012345678",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "report_date": "2026-08-20",
    "sent_at": "2026-08-20T06:00:00Z"
  }
]
```

---

### GET /reports/{date}

Get the full report for a specific date.

**Path params:** `date` — ISO 8601 date string, e.g. `2026-08-21`

**Response 200**
```json
{
  "id": "b8c9d0e1-f2a3-4567-bcde-678901234567",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "report_date": "2026-08-21",
  "sent_at": "2026-08-21T06:00:00Z",
  "content": {
    "total_changes": 5,
    "competitors": [
      {
        "competitor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "competitor_name": "Rival Corp",
        "changes": [
          {
            "change_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
            "page_url": "https://rivalcorp.com/pricing",
            "page_type": "pricing",
            "category": "Prix",
            "impact_level": "high",
            "summary": "Rival Corp a baissé son prix Pro de 99€ à 79€.",
            "key_changes": ["Prix Pro: 99€ → 79€"]
          }
        ]
      }
    ]
  }
}
```

**Errors**
- `404` — no report found for that date

---

## Dashboard

### GET /dashboard/stats

Aggregate statistics for the authenticated user's dashboard header cards.

**Response 200**
```json
{
  "total_competitors": 4,
  "total_pages": 11,
  "changes_today": 3,
  "changes_week": 14
}
```

---

### GET /dashboard/recent-changes

The 10 most recent detected changes, with competitor context, for the dashboard feed.

**Response 200**
```json
[
  {
    "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "category": "Prix",
    "impact_level": "high",
    "summary": "Rival Corp a baissé son prix Pro de 99€ à 79€.",
    "analyzed_at": "2026-08-21T02:15:00Z",
    "competitor": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Rival Corp",
      "website": "https://rivalcorp.com"
    },
    "page": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "url": "https://rivalcorp.com/pricing",
      "type": "pricing"
    }
  }
]
```

---

## Common Error Response Schema

All error responses follow this shape:

```json
{
  "detail": "Human-readable error message or validation error list"
}
```

For FastAPI validation errors (422), `detail` is an array:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Enum Reference

| Field | Valid Values |
|---|---|
| `page.type` | `"pricing"` \| `"blog"` \| `"changelog"` \| `"custom"` |
| `change.category` | `"Prix"` \| `"Fonctionnalité"` \| `"Positionnement"` \| `"Communication"` |
| `change.impact_level` | `"low"` \| `"medium"` \| `"high"` |
| `user.synthesis_tone` | `"formel"` \| `"direct"` \| `"détaillé"` |
| `user.plan` | `"starter"` (MVP only) |

---

## AI Analysis Output Schema (Internal — AI Pipeline → DB)

This is the structured JSON the LLM must return. It is stored in the `changes` table and partially surfaced in `GET /changes/{id}`.

```json
{
  "summary": "string — one-sentence French summary of the change",
  "category": "Prix | Fonctionnalité | Positionnement | Communication",
  "impact_level": "low | medium | high",
  "key_changes": ["string", "string"],
  "strategic_recommendation": "string — actionable advice in French"
}
```

---

## Frontend Route → API Endpoint Mapping

| Frontend Route | API Calls Required |
|---|---|
| `/login` | `POST /auth/login` |
| `/register` | `POST /auth/register` |
| `/` (Dashboard) | `GET /dashboard/stats`, `GET /dashboard/recent-changes` |
| `/competitors` | `GET /competitors` |
| `/competitors` (add) | `POST /competitors` |
| `/competitors/:id` | `GET /competitors/{id}`, `GET /competitors/{id}/pages`, `GET /changes?competitor_id={id}` |
| `/history` | `GET /changes` (with filter params) |
| `/reports` | `GET /reports` |
| `/reports/:date` | `GET /reports/{date}` |
| `/settings` | `GET /users/me`, `PUT /users/me` |
| `/account` | `GET /users/me`, `PUT /users/me` |
