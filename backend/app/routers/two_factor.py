"""
two_factor.py — Real Two-Factor Authentication (2FA) TOTP router
POST /api/v1/auth/2fa/setup    Generate TOTP secret, QR code, and backup codes
POST /api/v1/auth/2fa/verify   Verify 6-digit TOTP code or backup code
POST /api/v1/auth/2fa/disable  Disable 2FA for user account
"""
import secrets
import io
import base64
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.middleware.auth import get_current_user

router = APIRouter()

# In-memory backup codes & secrets store per user
user_2fa_store = {}


class Verify2FARequest(BaseModel):
    secret: str
    code: str
    backup_codes: Optional[List[str]] = []


@router.post("/setup")
def setup_2fa(current_user: User = Depends(get_current_user)):
    """Generate a new TOTP secret, QR code image, and emergency backup codes."""
    import pyotp
    import qrcode

    secret = pyotp.random_base32()
    user_email = current_user.email or "user@resumeai.com"
    totp = pyotp.TOTP(secret)
    otpauth_url = totp.provisioning_uri(name=user_email, issuer_name="ResumeAI")

    # Generate QR Code image as base64 Data URL
    qr = qrcode.QRCode(version=1, box_size=6, border=2)
    qr.add_data(otpauth_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F6E56", back_color="#FFFFFF")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

    # Generate 8 random emergency backup codes
    backup_codes = [
        f"{secrets.randbelow(9000) + 1000}-{secrets.randbelow(9000) + 1000}"
        for _ in range(8)
    ]

    return {
        "secret": secret,
        "otpauth_url": otpauth_url,
        "qr_code_base64": qr_base64,
        "backup_codes": backup_codes,
    }


@router.post("/verify")
def verify_2fa(
    body: Verify2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify 6-digit TOTP code or backup code to activate 2FA."""
    import pyotp

    code_clean = body.code.strip().replace(" ", "").replace("-", "")

    # Check emergency backup code first
    if body.backup_codes and code_clean in [b.replace("-", "") for b in body.backup_codes]:
        user_2fa_store[str(current_user.id)] = {
            "secret": body.secret,
            "backup_codes": body.backup_codes,
            "is_active": True,
        }
        return {
            "verified": True,
            "used_backup_code": True,
            "message": "Backup code accepted! 2FA is now active.",
        }

    # Verify standard 6-digit TOTP code using PyOTP algorithm
    totp = pyotp.TOTP(body.secret)
    if totp.verify(code_clean, valid_window=1):
        user_2fa_store[str(current_user.id)] = {
            "secret": body.secret,
            "backup_codes": body.backup_codes,
            "is_active": True,
        }
        return {
            "verified": True,
            "used_backup_code": False,
            "message": "TOTP code verified successfully! 2FA is now active.",
        }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid 6-digit code or backup code. Please check your authenticator app and try again.",
    )


@router.post("/disable")
def disable_2fa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disable 2FA for user account."""
    uid = str(current_user.id)
    if uid in user_2fa_store:
        del user_2fa_store[uid]
    return {"disabled": True, "message": "Two-Factor Authentication disabled."}
