"""
Clerk JWT authentication for FastAPI.

Production requests must carry a Clerk session JWT in Authorization: Bearer.
The local development identity is available only when both ENVIRONMENT=development
and ALLOW_DEV_AUTH=true are explicitly configured.
"""
from __future__ import annotations

import time
from threading import Lock
from typing import Any

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PlanEnum, User
from app.db.session import get_db

_bearer = HTTPBearer(auto_error=False)
_jwks_cache: dict[str, tuple[Any, float]] = {}
_jwks_lock = Lock()
_JWKS_TTL_SECONDS = 3600
_profile_cache: dict[str, tuple[str, float]] = {}
_PROFILE_TTL_SECONDS = 300


def is_dev_environment() -> bool:
    return settings.ENVIRONMENT.lower() in {"development", "dev", "local"}


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _get_clerk_public_key(kid: str) -> Any | None:
    """Resolve a Clerk signing key from the configured public JWKS endpoint."""
    now = time.monotonic()
    with _jwks_lock:
        cached = _jwks_cache.get(kid)
        if cached and cached[1] > now:
            return cached[0]

    if not settings.CLERK_JWKS_URL:
        raise RuntimeError("CLERK_JWKS_URL must be configured for JWT verification")

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(settings.CLERK_JWKS_URL)
        response.raise_for_status()
        jwks = response.json()

    from jwt.algorithms import RSAAlgorithm

    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            public_key = RSAAlgorithm.from_jwk(jwk)
            with _jwks_lock:
                _jwks_cache[kid] = (public_key, now + _JWKS_TTL_SECONDS)
            return public_key
    return None


async def _get_verified_primary_email(clerk_user_id: str) -> str:
    """Fetch and briefly cache the verified primary email from Clerk's Users API."""
    now = time.monotonic()
    cached = _profile_cache.get(clerk_user_id)
    if cached and cached[1] > now:
        return cached[0]

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
        )
        response.raise_for_status()
        profile = response.json()

    primary_id = profile.get("primary_email_address_id")
    for address in profile.get("email_addresses", []):
        if address.get("id") == primary_id and address.get("verification", {}).get("status") == "verified":
            email = address.get("email_address")
            if isinstance(email, str) and "@" in email:
                _profile_cache[clerk_user_id] = (email, now + _PROFILE_TTL_SECONDS)
                return email
    raise HTTPException(status_code=403, detail="A verified primary email is required")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    # Explicit, opt-in local-only bypass. Never enabled by ENVIRONMENT alone.
    if is_dev_environment() and settings.ALLOW_DEV_AUTH and credentials is None:
        dev_clerk_id = "dev_user_clerk_id"
        user = db.query(User).filter(User.clerk_id == dev_clerk_id).first()
        if user is None:
            user = User(
                clerk_id=dev_clerk_id,
                email="dev@example.com",
                plan=PlanEnum.free,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    try:
        token = credentials.credentials
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid or header.get("alg") != "RS256":
            raise _unauthorized()

        public_key = await _get_clerk_public_key(kid)
        if public_key is None:
            # A key rotation may have invalidated a cached key; refresh once.
            with _jwks_lock:
                _jwks_cache.pop(kid, None)
            public_key = await _get_clerk_public_key(kid)
        if public_key is None:
            raise _unauthorized()

        verify_audience = bool(settings.CLERK_AUDIENCE)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            audience=settings.CLERK_AUDIENCE or None,
            options={
                "require": ["exp", "iat", "sub", "iss", "sid"],
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_aud": verify_audience,
            },
        )
        clerk_id = payload.get("sub")
        if not isinstance(clerk_id, str) or not clerk_id:
            raise _unauthorized()

    except HTTPException:
        raise
    except (jwt.PyJWTError, httpx.HTTPError, ValueError, KeyError):
        raise _unauthorized()

    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    # Sync the verified primary email periodically. A matching email never links
    # two distinct Clerk identities; the unique constraint remains authoritative.
    try:
        email = await _get_verified_primary_email(clerk_id)
    except (httpx.HTTPError, ValueError, KeyError):
        raise _unauthorized()

    if user is None:
        user = User(clerk_id=clerk_id, email=email, plan=PlanEnum.free)
        db.add(user)
    elif user.email != email:
        user.email = email

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        # Concurrent first-login requests may have created this identity.
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if user is None:
            raise
    return userr


def require_plan(*plans: PlanEnum):
    """Dependency factory enforcing plan entitlements after authentication."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.plan not in plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires one of: {[plan.value for plan in plans]}",
            )
        return current_user
    return _check


require_pro = require_plan(PlanEnum.pro, PlanEnum.career, PlanEnum.team)
require_career = require_plan(PlanEnum.career, PlanEnum.team)
require_team = require_plan(PlanEnum.team)
