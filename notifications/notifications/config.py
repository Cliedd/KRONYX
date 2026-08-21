from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://localhost/kronyx"
    REDIS_URL: str = "redis://localhost:6379/0"

    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "veille@kronyx.app"
    RESEND_FROM_NAME: str = "Kronyx"

    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()
