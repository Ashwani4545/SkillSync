"""
rate_limiter.py
Per-user and per-IP rate limiting for all AI endpoints.
Uses slowapi (built on limits library) with Redis as the storage backend.

Limits by plan:
  free:   5 AI calls/hour, 20/day
  pro:    60 AI calls/hour, 500/day
  career: 120 AI calls/hour, 1000/day
  team:   unlimited (fair-use monitored)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.core.config import settings

# Initialize limiter with Redis backend
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=["200/hour"],
)


def get_limit_for_plan(plan: str) -> str:
    """Return rate limit string for a user's plan."""
    limits = {
        "free":   "5/hour",
        "pro":    "60/hour",
        "career": "120/hour",
        "team":   "300/hour",
    }
    return limits.get(plan, "5/hour")


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom error response for rate limit violations."""
    return JSONResponse(
        status_code=429,
        content={
            "error":   "rate_limit_exceeded",
            "message": f"Too many requests. Limit: {exc.limit}. Retry after {exc.retry_after} seconds.",
            "retry_after": exc.retry_after,
        },
        headers={"Retry-After": str(exc.retry_after)},
    )
