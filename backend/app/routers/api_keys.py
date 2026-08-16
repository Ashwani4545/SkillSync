"""
api_keys.py — API key generation and management for all plans
POST /api/v1/keys/create       Generate a new API key
GET  /api/v1/keys              List all keys for user
DELETE /api/v1/keys/{key_id}   Revoke a key
"""
import secrets
import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User
from app.middleware.auth import get_current_user

router = APIRouter()


class CreateKeyRequest(BaseModel):
    name: str


def _hash_key(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()

def _ensure_table(db: Session):
    try:
        db.execute(text("SELECT 1 FROM api_keys LIMIT 1"))
    except Exception:
        db.rollback()
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS api_keys (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR NOT NULL,
                key_hash VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_used TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        db.commit()


@router.post("/create")
def create_api_key(
    body: CreateKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new API key. The raw key is only shown once."""
    _ensure_table(db)
    raw_key  = f"rai_{secrets.token_urlsafe(32)}"
    key_hash = _hash_key(raw_key)
    key_id   = str(uuid.uuid4())

    try:
        db.execute(
            text("""
                INSERT INTO api_keys (id, user_id, key_hash, name, is_active, created_at)
                VALUES (:id, :uid, :kh, :name, true, :now)
            """),
            {"id": key_id, "uid": str(current_user.id), "kh": key_hash, "name": body.name, "now": datetime.utcnow()},
        )
        db.commit()
    except Exception as err:
        db.rollback()
        raise HTTPException(500, f"Database error creating key: {err}")

    return {
        "api_key":  raw_key,   # shown only once — user must copy this
        "name":     body.name,
        "warning":  "Store this key securely. It will not be shown again.",
    }


@router.get("")
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_table(db)
    try:
        rows = db.execute(
            text("SELECT id, name, is_active, last_used, created_at FROM api_keys WHERE user_id = :uid ORDER BY created_at DESC"),
            {"uid": str(current_user.id)},
        ).fetchall()

        return {
            "keys": [
                {
                    "id":         str(r[0]),
                    "name":       r[1],
                    "is_active":  bool(r[2]),
                    "last_used":  r[3].isoformat() if r[3] and hasattr(r[3], 'isoformat') else str(r[3]) if r[3] else None,
                    "created_at": r[4].isoformat() if r[4] and hasattr(r[4], 'isoformat') else str(r[4]) if r[4] else datetime.utcnow().isoformat(),
                }
                for r in rows
            ]
        }
    except Exception:
        db.rollback()
        return {"keys": []}


@router.delete("/{key_id}")
def revoke_api_key(
    key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_table(db)
    try:
        db.execute(
            text("UPDATE api_keys SET is_active = false WHERE id = :kid AND user_id = :uid"),
            {"kid": key_id, "uid": str(current_user.id)},
        )
        db.commit()
        return {"revoked": True}
    except Exception as err:
        db.rollback()
        raise HTTPException(500, f"Error revoking key: {err}")
