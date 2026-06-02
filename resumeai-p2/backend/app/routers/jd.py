"""
jd.py  —  JD Adapter router
POST /api/v1/jd/adapt   Tailor resume to a job description (async)
GET  /api/v1/jd/{id}    Fetch a saved JD match result
GET  /api/v1/jd/resume/{resume_id}  List all JD adaptations for a resume
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from app.db.session import get_db
from app.db.models import Resume, JDMatch, User
from app.middleware.auth import get_current_user, require_pro
from app.schemas.jd import JDAdaptRequest, JDMatchOut, JDMatchListOut
from workers.jd_task import run_jd_adaptation

router = APIRouter()


@router.post("/adapt", response_model=JDMatchOut, status_code=status.HTTP_202_ACCEPTED)
def adapt_resume(
    body: JDAdaptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pro),
):
    """Trigger async JD adaptation. Returns job record — poll GET /jd/{id} for results."""
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume not yet parsed.")

    match = JDMatch(
        resume_id=resume.id,
        jd_text=body.jd_text,
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    run_jd_adaptation.delay(
        match_id=str(match.id),
        resume_json=resume.parsed_json,
        jd_text=body.jd_text,
    )
    return match


@router.get("/{match_id}", response_model=JDMatchOut)
def get_jd_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    match = (
        db.query(JDMatch)
        .join(Resume)
        .filter(JDMatch.id == match_id, Resume.user_id == current_user.id)
        .first()
    )
    if not match:
        raise HTTPException(404, "JD match not found.")
    return match


@router.get("/resume/{resume_id}", response_model=JDMatchListOut)
def list_jd_matches(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")

    matches = (
        db.query(JDMatch)
        .filter(JDMatch.resume_id == resume_id)
        .order_by(JDMatch.created_at.desc())
        .all()
    )
    return {"matches": matches, "total": len(matches)}
