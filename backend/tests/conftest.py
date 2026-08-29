"""
Shared pytest fixtures for the backend test suite.

Design choices:
- Uses SQLite (local file, recreated per test) instead of requiring a real
  Postgres instance, so `pytest` works locally with zero setup. CI still runs
  a real Postgres service (see infra/.github/workflows/deploy.yml).
- Deliberately does NOT override `get_db` with a separate, isolated engine:
  workers/analyze_task.py's Celery-fallback thread (see
  backend/app/routers/analysis.py) opens its own SessionLocal() directly,
  bound to the *module-level* engine in app.db.session. If tests used a
  different, isolated in-memory engine via dependency_overrides, that
  background thread would silently be talking to a different (empty)
  database than the one the test just wrote to — analyses would look
  like they never complete. Instead, DATABASE_URL is pointed at one
  shared local SQLite file before any app modules are imported, and every
  test gets a clean copy of it via create_all/drop_all.
- Forces USE_MOCK_LLM=true so tests never make real, billed Claude/OpenAI
  calls — the mock heuristic engine in ai_engine/llm_client.py is exercised
  and asserted on directly in test_mock_llm_analyzer.py.
- Overrides `get_current_user` only, so tests don't need a real Clerk JWT.
"""
import os

# Must be set before any app modules are imported.
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("USE_MOCK_LLM", "true")
os.environ.setdefault("ANTHROPIC_API_KEY", "test_key")
os.environ.setdefault("CLERK_SECRET_KEY", "test_key")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_resumeai.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
# Deliberately NOT setting AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY — leaving them
# unset makes storage_service.upload_resume() fall back to local disk instead
# of attempting a real S3 call (see storage_service.py's fallback condition).

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import Base, engine, SessionLocal, get_db
from app.db.models import User, PlanEnum
from app.middleware.auth import get_current_user


@pytest.fixture(autouse=True)
def _clean_db():
    """Fresh tables in the shared SQLite file before/after every test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def test_user(db_session):
    user = User(
        email="test@example.com",
        clerk_id="user_test_123",
        plan=PlanEnum.pro,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def client(test_user):
    """FastAPI TestClient with only auth overridden — DB goes through the
    real app engine so background-thread work (the Celery fallback) sees
    the same data the test just created."""

    def _get_current_user_override():
        return test_user

    app.dependency_overrides[get_current_user] = _get_current_user_override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def sample_resume_json():
    """A minimal parsed-resume payload, shaped like ai_engine/pipeline.py expects."""
    return {
        "contact": {
            "name": "Jane Developer",
            "email": "jane@example.com",
            "phone": "+1-555-0199",
            "location": "San Francisco, CA",
            "linkedin": "linkedin.com/in/janedev",
            "github": "github.com/janedev",
        },
        "summary": "Senior Software Engineer with 6 years of experience building "
        "high performance microservices with Python and FastAPI.",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "Git", "CI/CD"],
        "experience": [
            {
                "title": "Senior Backend Engineer",
                "company": "Tech Innovations",
                "start": "2021",
                "end": "Present",
                "bullets": [
                    "Architected high-throughput microservices using Python and FastAPI, "
                    "processing 50k requests/sec.",
                    "Set up CI/CD pipelines and deployed containerized services using "
                    "Docker and PostgreSQL.",
                ],
            }
        ],
        "projects": [
            {
                "name": "Distributed Cache",
                "bullets": ["Optimized memory allocation, reducing latency by 40%."],
            }
        ],
        "education": [
            {
                "degree": "B.S.",
                "field": "Computer Science",
                "institution": "UC Berkeley",
                "start": "2015",
                "end": "2019",
            }
        ],
        "certifications": ["AWS Certified Solutions Architect"],
    }
