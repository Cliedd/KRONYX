from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://localhost/kronyx"
    REDIS_URL: str = "redis://localhost:6379/0"
    DEEPSEEK_API_KEY: str = ""

    SCRAPING_TIMEOUT_SECONDS: int = 30
    SCRAPING_CONCURRENT_PAGES: int = 5
    SEMANTIC_SIMILARITY_THRESHOLD: float = 0.85


settings = Settings()
