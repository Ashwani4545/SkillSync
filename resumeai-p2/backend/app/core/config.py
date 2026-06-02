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

    # Pinecone (optional)
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""

    # Monitoring
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
