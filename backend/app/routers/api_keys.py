"""
api_keys.py — API key generation and management for Team/B2B plan
POST /api/v1/keys/create       Generate a new API key
GET  /api/v1/keys              List all keys for user
DELETE /api/v1/keys/{key_id}   Revoke a key
"""
import secrets
import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User
from app.middleware.auth import get_current_user, require_team

router = APIRouter()


class CreateKeyRequest(BaseModel):
    name: str


def _hash_key(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


@router.post("/create")
def create_api_key(
    body: CreateKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    """Generate a new API key. The raw key is only shown once."""
    raw_key  = f"rai_{secrets.token_urlsafe(32)}"
    key_hash = _hash_key(raw_key)

    db.execute(
        text("""
            INSERT INTO api_keys (id, user_id, key_hash, name, is_active, created_at)
            VALUES (gen_random_uuid(), :uid, :kh, :name, true, now())
        """),
        {"uid": str(current_user.id), "kh": key_hash, "name": body.name},
    )
    db.commit()

    return {
        "api_key":  raw_key,   # shown only once — user must copy this
        "name":     body.name,
        "warning":  "Store this key securely. It will not be shown again.",
    }


@router.get("")
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    rows = db.execute(
        text("SELECT id, name, is_active, last_used, created_at FROM api_keys WHERE user_id = :uid ORDER BY created_at DESC"),
        {"uid": str(current_user.id)},
    ).fetchall()

    return {
        "keys": [
            {
                "id":         str(r.id),
                "name":       r.name,
                "is_active":  r.is_active,
                "last_used":  r.last_used.isoformat() if r.last_used else None,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
    }


@router.delete("/{key_id}")
def revoke_api_key(
    key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    result = db.execute(
        text("UPDATE api_keys SET is_active = false WHERE id = :kid AND user_id = :uid"),
        {"kid": key_id, "uid": str(current_user.id)},
    )
    if result.rowcount == 0:
        raise HTTPException(404, "Key not found.")
    db.commit()
    return {"revoked": True}
