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
    resume_id_str = str(body.resume_id)
    user_id_str = str(current_user.id)
    resume = db.query(Resume).filter(
        Resume.id == resume_id_str,
        Resume.user_id == user_id_str,
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

    # Enqueue Celery task with local thread fallback
    try:
        run_analysis.delay(
            analysis_id=str(analysis.id),
            resume_json=resume.parsed_json,
            jd_text=body.jd_text,
            user_plan=current_user.plan.value,
            target_role=body.target_role,
            demanded_skills=body.demanded_skills,
        )
    except Exception as queue_err:
        print(f"[Worker Warning] Could not enqueue to Celery/Redis ({queue_err}). Executing in-process fallback.")
        import threading
        analysis_id_str = str(analysis.id)
        resume_json_val = resume.parsed_json
        jd_text_val = body.jd_text
        user_plan_val = current_user.plan.value
        target_role_val = body.target_role
        demanded_skills_val = body.demanded_skills

        def _run_in_background():
            try:
                from workers.analyze_task import run_analysis as direct_run
                direct_run.run(
                    None,
                    analysis_id=analysis_id_str,
                    resume_json=resume_json_val,
                    jd_text=jd_text_val,
                    user_plan=user_plan_val,
                    target_role=target_role_val,
                    demanded_skills=demanded_skills_val,
                )
            except Exception as direct_err:
                print(f"[Direct Run Error] {direct_err}")

        threading.Thread(target=_run_in_background, daemon=True).start()

    return analysis


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Poll for analysis results. Check status field: pending | processing | done | failed."""
    target_analysis_id = str(analysis_id)
    user_id_str = str(current_user.id)
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(
            Analysis.id == target_analysis_id,
            Resume.user_id == user_id_str,
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
