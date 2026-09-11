"""
share.py — Shareable score card router
POST /api/v1/share/generate/{analysis_id}   Create a public share token
GET  /api/v1/share/{token}                  Fetch public result by token
"""
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.db.models import Analysis, Resume, User, ProofScore
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/generate/{analysis_id}")
def generate_share_link(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(404, "Analysis not found.")
    if analysis.status != "done":
        raise HTTPException(400, "Analysis must be complete to share.")

    # Generate or reuse existing token
    if not hasattr(analysis, "share_token") or not analysis.share_token:
        token = secrets.token_urlsafe(32)
        db.execute(
            text("UPDATE analyses SET share_token = :token WHERE id = :id"),
            {"token": token, "id": str(analysis_id)},
        )
        db.commit()
    else:
        token = analysis.share_token

    return {"share_token": token, "share_url": f"/share/{token}"}


@router.get("/{token}")
def get_shared_result(token: str, db: Session = Depends(get_db)):
    """Public endpoint — no auth required."""
    result = db.execute(
        text("SELECT results_json, completed_at FROM analyses WHERE share_token = :t"),
        {"t": token},
    ).fetchone()

    if not result:
        raise HTTPException(404, "Shared result not found.")

    return {
        "career_readiness": result.results_json.get("career_readiness") if result.results_json else None,
        "universal_ats": result.results_json.get("universal_ats") if result.results_json else None,
        "completed_at": result.completed_at,
    }


@router.get("/proof/{token}")
def get_shared_proof_score(token: str, db: Session = Depends(get_db)):
    """
    Public endpoint — no auth required. Backs the Proof Score credibility
    report page (frontend/src/app/share/[token]/page.tsx), showing resume
    claims side-by-side with their GitHub evidence. Created via
    POST /api/v1/github/proof-score/{id}/share.
    """
    proof_score = (
        db.query(ProofScore)
        .filter(ProofScore.share_token == token, ProofScore.is_public == True)  # noqa: E712
        .first()
    )
    if not proof_score:
        raise HTTPException(404, "Shared Proof Score not found.")

    return {
        "github_username": proof_score.github_username,
        "overall_score": proof_score.overall_score,
        "verified_count": proof_score.verified_count,
        "weak_count": proof_score.weak_count,
        "unverified_count": proof_score.unverified_count,
        "created_at": proof_score.created_at,
        "skills": [
            {
                "skill": s.skill_name,
                "status": s.status,
                "confidence": s.confidence,
                "evidence_repo": s.evidence_repo,
                "evidence_url": s.evidence_url,
                "reason": s.reason,
                "suggested_bullet": s.suggested_bullet,
            }
            for s in proof_score.skills
        ],
    }
