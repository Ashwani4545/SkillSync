from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    NEXT_PUBLIC_APP_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"

    # AI
    ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: str = ""

    # Auth (Clerk)
    CLERK_SECRET_KEY: str
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_ISSUER: str = ""
    CLERK_JWKS_URL: str = ""
    CLERK_AUDIENCE: str = ""
    # Must be explicitly true AND ENVIRONMENT=development to enable local bypass.
    ALLOW_DEV_AUTH: bool = False
    ADMIN_CLERK_IDS: str = ""
    LLM_DAILY_LIMIT_USD: float = 20.0
    LLM_MONTHLY_LIMIT_USD: float = 300.0

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "resumeai-uploads"
    AWS_REGION: str = "us-east-1"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_CAREER_PRICE_ID: str = ""
    STRIPE_TEAM_PRICE_ID: str = ""
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: str = ""

    # Mock LLM (dev/testing — skips real Claude/OpenAI calls)
    USE_MOCK_LLM: bool = False

    # Monitoring
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
