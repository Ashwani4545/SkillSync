"""
career.py — Career trajectory & salary routers (Phase 3)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_career
from workers.career_task import run_career_prediction
from workers.salary_task import run_salary_estimation

router = APIRouter()

class TrajectoryRequest(BaseModel):
    resume_id: str

class SalaryRequest(BaseModel):
    resume_id: str
    target_role: str
    location: Optional[str] = "Remote (US)"

@router.post("/trajectory")
def start_trajectory(body: TrajectoryRequest, db: Session=Depends(get_db), current_user: User=Depends(require_career)):
    resume = db.query(Resume).filter(Resume.id==body.resume_id, Resume.user_id==current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json: raise HTTPException(422, "Resume must be parsed first.")
    task = run_career_prediction.delay(resume_json=resume.parsed_json)
    return {"task_id": task.id, "status": "processing"}

@router.get("/result/{task_id}")
def get_career_result(task_id: str, current_user: User=Depends(get_current_user)):
    from workers.celery_app import celery_app
    from celery.result import AsyncResult
    r = AsyncResult(task_id, app=celery_app)
    if r.state=="SUCCESS": return {"status":"done","result":r.result}
    if r.state=="FAILURE": return {"status":"failed","error":str(r.result)}
    return {"status":r.state.lower(),"task_id":task_id}

@router.post("/salary")
def estimate_salary(body: SalaryRequest, db: Session=Depends(get_db), current_user: User=Depends(require_career)):
    resume = db.query(Resume).filter(Resume.id==body.resume_id, Resume.user_id==current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json: raise HTTPException(422, "Resume must be parsed first.")
    task = run_salary_estimation.delay(resume_json=resume.parsed_json, target_role=body.target_role, location=body.location or "Remote (US)")
    return {"task_id": task.id, "status": "processing"}

@router.get("/salary/result/{task_id}")
def get_salary_result(task_id: str, current_user: User=Depends(get_current_user)):
    from workers.celery_app import celery_app
    from celery.result import AsyncResult
    r = AsyncResult(task_id, app=celery_app)
    if r.state=="SUCCESS": return {"status":"done","result":r.result}
    if r.state=="FAILURE": return {"status":"failed","error":str(r.result)}
    return {"status":r.state.lower(),"task_id":task_id}
