"""
gap.py  —  Career gap advisor router
POST /api/v1/gap/analyze    Analyze career gaps in a resume
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_pro

router = APIRouter()


class GapRequest(BaseModel):
    resume_id: str


@router.post("/analyze")
def analyze_gaps(
    body: GapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pro),
):
    """Synchronous gap analysis — fast enough to run inline (< 5s)."""
    from ai_engine.generators.gap_disguiser import analyze_career_gaps

    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume must be parsed first.")

    result = analyze_career_gaps(resume.parsed_json)
    return result
