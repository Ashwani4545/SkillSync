"""
Two-factor authentication is managed by Clerk.

The previous implementation stored TOTP secrets and backup codes in process
memory and trusted client-supplied secrets. It was not durable or safe to use
as an account security control. These endpoints are intentionally disabled
until a persistent, encrypted, single-use implementation is introduced.
Enable MFA (authenticator app / backup codes) in the Clerk Dashboard instead.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.db.models import User
from app.middleware.auth import get_current_user

router = APIRouter()


def _mfa_not_available() -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=(
            "Application-managed TOTP is disabled. Configure multi-factor "
            "authentication in the Clerk Dashboard and use Clerk's account "
            "security flow."
        ),
    )


@router.post("/setup")
def setup_2fa(current_user: User = Depends(get_current_user)):
    _mfa_not_available()


@router.post("/verify")
def verify_2fa(current_user: User = Depends(get_current_user)):
    _mfa_not_available()


@router.post("/disable")
def disable_2fa(current_user: User = Depends(get_current_user)):
    _mfa_not_available()
