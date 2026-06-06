"""
bias.py — Bias scanner router (Phase 4)
POST /api/v1/bias/scan    Scan a resume for biased language
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_career

router = APIRouter()


class BiasScanRequest(BaseModel):
    resume_id: str


@router.post("/scan")
def scan_bias(
    body: BiasScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_career),
):
    """Synchronous bias scan — runs in ~5s inline."""
    from ai_engine.analyzers.bias_scanner import scan_for_bias

    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume must be parsed first.")

    result = scan_for_bias(resume.parsed_json)
    return result
