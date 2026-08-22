from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    SYNC_DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"

    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "veille@kronyx.app"
    RESEND_FROM_NAME: str = "Kronyx"

    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    SEMANTIC_SIMILARITY_THRESHOLD: float = 0.85

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "https://backend-production-4269b.up.railway.app/api/v1/auth/google/callback"
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO_ID: str = ""


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
