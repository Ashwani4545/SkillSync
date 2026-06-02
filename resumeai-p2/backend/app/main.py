from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sentry_sdk

from app.routers import resume, analysis, jd, career, benchmark, billing, health, compare, gap, share
from app.db import base  # noqa
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 ResumeAI backend starting — Phase 2")
    yield


if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)

app = FastAPI(
    title="ResumeAI API",
    description="AI-powered resume analyzer and career coach — Phase 2",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.NEXT_PUBLIC_APP_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 1
app.include_router(health.router,    prefix="/api/v1",           tags=["health"])
app.include_router(resume.router,    prefix="/api/v1/resume",    tags=["resume"])
app.include_router(analysis.router,  prefix="/api/v1/analysis",  tags=["analysis"])
app.include_router(billing.router,   prefix="/api/v1/billing",   tags=["billing"])
app.include_router(career.router,    prefix="/api/v1/career",    tags=["career"])

# Phase 2
app.include_router(jd.router,        prefix="/api/v1/jd",        tags=["jd-adapter"])
app.include_router(compare.router,   prefix="/api/v1/compare",   tags=["ab-tester"])
app.include_router(benchmark.router, prefix="/api/v1/benchmark", tags=["benchmark"])
app.include_router(gap.router,       prefix="/api/v1/gap",       tags=["gap-advisor"])
app.include_router(share.router,     prefix="/api/v1/share",     tags=["share"])


@app.get("/")
async def root():
    return {"message": "ResumeAI API v2.0", "phase": 2, "docs": "/docs"}
