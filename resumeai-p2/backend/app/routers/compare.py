"""
compare.py  —  A/B Resume Tester router
POST /api/v1/compare/start   Start a comparison between two resumes
GET  /api/v1/compare/{id}    Fetch comparison result
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_pro
from workers.compare_task import run_comparison

router = APIRouter()


class CompareRequest(BaseModel):
    resume_a_id: uuid.UUID
    resume_b_id: uuid.UUID
    jd_text: Optional[str] = None


class CompareStartOut(BaseModel):
    task_id: str
    status: str = "processing"
    message: str


@router.post("/start", response_model=CompareStartOut, status_code=status.HTTP_202_ACCEPTED)
def start_comparison(
    body: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pro),
):
    """Start async A/B comparison. Returns a task_id to poll."""
    resume_a = db.query(Resume).filter(
        Resume.id == body.resume_a_id, Resume.user_id == current_user.id
    ).first()
    resume_b = db.query(Resume).filter(
        Resume.id == body.resume_b_id, Resume.user_id == current_user.id
    ).first()

    if not resume_a or not resume_b:
        raise HTTPException(404, "One or both resumes not found.")
    if not resume_a.parsed_json or not resume_b.parsed_json:
        raise HTTPException(422, "Both resumes must be parsed before comparison.")
    if str(body.resume_a_id) == str(body.resume_b_id):
        raise HTTPException(400, "Cannot compare a resume against itself.")

    task = run_comparison.delay(
        resume_a_json=resume_a.parsed_json,
        resume_b_json=resume_b.parsed_json,
        jd_text=body.jd_text,
        resume_a_id=str(body.resume_a_id),
        resume_b_id=str(body.resume_b_id),
    )

    return CompareStartOut(
        task_id=task.id,
        message="Comparison started. Poll /compare/result/{task_id} for results.",
    )


@router.get("/result/{task_id}")
def get_comparison_result(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Poll for A/B comparison result by Celery task ID."""
    from workers.celery_app import celery_app
    from celery.result import AsyncResult

    result = AsyncResult(task_id, app=celery_app)

    if result.state == "PENDING":
        return {"status": "pending", "task_id": task_id}
    if result.state == "STARTED":
        return {"status": "processing", "task_id": task_id}
    if result.state == "SUCCESS":
        return {"status": "done", "task_id": task_id, "result": result.result}
    if result.state == "FAILURE":
        return {"status": "failed", "task_id": task_id, "error": str(result.result)}

    return {"status": result.state.lower(), "task_id": task_id}
