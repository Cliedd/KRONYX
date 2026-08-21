from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, competitors, pages, changes, reports, dashboard

app = FastAPI(
    title="Kronyx API",
    description="Plateforme de veille concurrentielle automatisée",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])
app.include_router(competitors.router, prefix="/api/v1/competitors", tags=["Concurrents"])
app.include_router(pages.router, prefix="/api/v1", tags=["Pages"])
app.include_router(changes.router, prefix="/api/v1/changes", tags=["Changements"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Rapports"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/health", tags=["Santé"])
async def health():
    return {"status": "ok", "service": "kronyx-backend"}
