from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import Analysis, Resume, User, AnalysisStatusEnum, PlanEnum
from app.middleware.auth import get_current_user
from app.schemas.analysis import AnalysisStartRequest, AnalysisOut, AnalysisListOut
from workers.analyze_task import run_analysis

router = APIRouter()

FREE_PLAN_LIMIT = 3  # analyses per month


def _check_usage_limit(user: User, db: Session):
    if user.plan == PlanEnum.free and user.analyses_used_this_month >= FREE_PLAN_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Free plan limit of {FREE_PLAN_LIMIT} analyses/month reached. Upgrade to Pro.",
        )


@router.post("/start", response_model=AnalysisOut, status_code=status.HTTP_202_ACCEPTED)
def start_analysis(
    body: AnalysisStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger a full AI analysis for a resume.
    Returns immediately with a job ID — poll GET /analysis/{id} for results.
    """
    _check_usage_limit(current_user, db)

    # Verify resume ownership
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not resume.parsed_json:
        raise HTTPException(status_code=422, detail="Resume has not been parsed yet.")

    # Create analysis record
    analysis = Analysis(
        resume_id=resume.id,
        jd_text=body.jd_text,
        status=AnalysisStatusEnum.pending,
    )
    db.add(analysis)

    # Increment usage counter
    current_user.analyses_used_this_month += 1
    db.commit()
    db.refresh(analysis)

    # Enqueue Celery task
    run_analysis.delay(
        analysis_id=str(analysis.id),
        resume_json=resume.parsed_json,
        jd_text=body.jd_text,
        user_plan=current_user.plan.value,
        target_role=body.target_role,
        demanded_skills=body.demanded_skills,
    )

    return analysis


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Poll for analysis results. Check status field: pending | processing | done | failed."""
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(
            Analysis.id == analysis_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return analysis


@router.get("/resume/{resume_id}", response_model=AnalysisListOut)
def list_analyses_for_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analyses = (
        db.query(Analysis)
        .filter(Analysis.resume_id == resume_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return {"analyses": analyses, "total": len(analyses)}
