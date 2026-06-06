"""
Clerk JWT verification dependency for FastAPI.
Usage:  current_user: User = Depends(get_current_user)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import httpx
import jwt

from app.db.session import get_db
from app.db.models import User, PlanEnum
from app.core.config import settings

bearer_scheme = HTTPBearer()

CLERK_JWKS_URL = "https://api.clerk.dev/v1/jwks"
_jwks_cache: dict = {}


async def _get_clerk_public_key(kid: str) -> str | None:
    """Fetch Clerk's JWKS and find the key matching kid."""
    global _jwks_cache
    if kid in _jwks_cache:
        return _jwks_cache[kid]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            CLERK_JWKS_URL,
            headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"}
        )
        resp.raise_for_status()
        jwks = resp.json()

    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            from jwt.algorithms import RSAAlgorithm
            public_key = RSAAlgorithm.from_jwk(key)
            _jwks_cache[kid] = public_key
            return public_key
    return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db),
) -> User:
    if settings.ENVIRONMENT == "development":
        dev_clerk_id = "dev_user_clerk_id"
        dev_email = "dev@example.com"
        user = db.query(User).filter(User.clerk_id == dev_clerk_id).first()
        if not user:
            user = User(clerk_id=dev_clerk_id, email=dev_email, plan=PlanEnum.team)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode header to get kid without verifying signature yet
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        public_key = await _get_clerk_public_key(kid)
        if not public_key:
            raise credentials_exception

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

        clerk_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        if not clerk_id:
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    # Get or create user in DB
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        user = User(clerk_id=clerk_id, email=email, plan=PlanEnum.free)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def require_plan(*plans: PlanEnum):
    """Factory: returns a dependency that enforces the user is on one of the given plans."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.plan not in plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires one of: {[p.value for p in plans]}",
            )
        return current_user
    return _check


# Convenience shortcuts
require_pro    = require_plan(PlanEnum.pro, PlanEnum.career, PlanEnum.team)
require_career = require_plan(PlanEnum.career, PlanEnum.team)
require_team   = require_plan(PlanEnum.team)
