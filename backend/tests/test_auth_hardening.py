import asyncio

import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.middleware.auth import get_current_user


def test_missing_bearer_token_is_rejected_outside_dev(db_session, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ALLOW_DEV_AUTH", False)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(get_current_user(None, db_session))

    assert exc.value.status_code == 401


def test_development_mode_does_not_bypass_auth_by_default(db_session, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "ALLOW_DEV_AUTH", False)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(get_current_user(None, db_session))

    assert exc.value.status_code == 401


def test_development_bypass_requires_explicit_opt_in(db_session, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "ALLOW_DEV_AUTH", True)

    user = asyncio.run(get_current_user(None, db_session))

    assert user.clerk_id == "dev_user_clerk_id"
    assert user.plan.value == "free"
