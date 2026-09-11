from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
try:
    import sentry_sdk
except ImportError:
    sentry_sdk = None

from app.routers import (
    resume, analysis, jd, career, benchmark, billing,
    health, compare, gap, share, github, recruiter,
    api_keys, bias, language, admin, whitelabel, two_factor
)
from app.db import base  # noqa
from app.core.config import settings
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("ResumeAI backend - Phase 4 complete")
    try:
        from app.db.session import init_db
        init_db()
    except Exception as e:
        print(f"[DB Init Warning] {e}")
    yield


if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)

app = FastAPI(
    title="ResumeAI API",
    description="AI-powered resume analyzer and career coach",
    version="4.0.0",
    lifespan=lifespan,
)

# Rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002", "http://localhost:3003", settings.NEXT_PUBLIC_APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Phase 1 — Foundation ──────────────────────────────────────────────────────
app.include_router(health.router,      prefix="/api/v1",              tags=["health"])
app.include_router(resume.router,      prefix="/api/v1/resume",       tags=["resume"])
app.include_router(analysis.router,    prefix="/api/v1/analysis",     tags=["analysis"])
app.include_router(billing.router,     prefix="/api/v1/billing",      tags=["billing"])

# ── Phase 2 — Differentiators ─────────────────────────────────────────────────
app.include_router(jd.router,          prefix="/api/v1/jd",           tags=["jd-adapter"])
app.include_router(compare.router,     prefix="/api/v1/compare",      tags=["ab-tester"])
app.include_router(benchmark.router,   prefix="/api/v1/benchmark",    tags=["benchmark"])
app.include_router(gap.router,         prefix="/api/v1/gap",          tags=["gap-advisor"])
app.include_router(share.router,       prefix="/api/v1/share",        tags=["share"])

# ── Phase 3 — Career Intelligence ────────────────────────────────────────────
app.include_router(career.router,      prefix="/api/v1/career",       tags=["career"])
app.include_router(github.router,      prefix="/api/v1/github",       tags=["github"])
app.include_router(recruiter.router,   prefix="/api/v1/recruiter",    tags=["recruiter"])
app.include_router(api_keys.router,    prefix="/api/v1/keys",         tags=["api-keys"])

# ── Phase 4 — Enterprise & Global ────────────────────────────────────────────
app.include_router(bias.router,        prefix="/api/v1/bias",         tags=["bias-scanner"])
app.include_router(language.router,    prefix="/api/v1/language",     tags=["language-adapter"])
app.include_router(whitelabel.router,  prefix="/api/v1/whitelabel",   tags=["whitelabel"])
app.include_router(two_factor.router,  prefix="/api/v1/auth/2fa",     tags=["2fa"])
app.include_router(admin.router,       prefix="/api/v1/admin",        tags=["admin"])


@app.get("/")
async def root():
    return {
        "message": "ResumeAI API v4.0 — production ready",
        "phase": 4,
        "docs": "/docs",
    }
