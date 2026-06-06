"""
language.py — Multilingual / cultural adapter router (Phase 4)
POST /api/v1/language/adapt   Adapt resume for a target country
GET  /api/v1/language/countries  List supported countries
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_career
from workers.language_task import run_cultural_adaptation

router = APIRouter()


class AdaptRequest(BaseModel):
    resume_id: str
    target_country: str


@router.post("/adapt")
def adapt_resume(
    body: AdaptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_career),
):
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume must be parsed first.")

    task = run_cultural_adaptation.delay(
        resume_json=resume.parsed_json,
        target_country=body.target_country,
    )
    return {"task_id": task.id, "status": "processing"}


@router.get("/result/{task_id}")
def get_adaptation_result(task_id: str, current_user: User = Depends(get_current_user)):
    from workers.celery_app import celery_app
    from celery.result import AsyncResult
    r = AsyncResult(task_id, app=celery_app)
    if r.state == "SUCCESS": return {"status": "done",   "result": r.result}
    if r.state == "FAILURE": return {"status": "failed", "error":  str(r.result)}
    return {"status": r.state.lower(), "task_id": task_id}


@router.get("/countries")
def list_countries():
    from ai_engine.generators.cultural_adapter import list_supported_countries
    return {"countries": list_supported_countries()}
