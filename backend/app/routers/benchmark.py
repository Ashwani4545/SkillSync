from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_pro
from workers.benchmark_task import run_benchmark

router = APIRouter()

SUPPORTED_ROLES = [
    "Software Engineer","Senior Software Engineer","Product Manager",
    "Data Scientist","Data Analyst","DevOps Engineer","UX Designer",
    "Marketing Manager","Sales Manager","Business Analyst",
    "Project Manager","Full Stack Developer","Backend Engineer",
    "Frontend Engineer","Machine Learning Engineer","Cloud Architect",
]
SUPPORTED_INDUSTRIES = [
    "technology","finance","healthcare","e-commerce","consulting",
    "media","education","government","manufacturing","retail",
]

class BenchmarkRequest(BaseModel):
    resume_id: str
    target_role: str
    industry: Optional[str] = "technology"

@router.post("/run", status_code=202)
def run_benchmark_endpoint(body: BenchmarkRequest, db: Session=Depends(get_db), current_user: User=Depends(require_pro)):
    resume = db.query(Resume).filter(Resume.id==body.resume_id, Resume.user_id==current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json: raise HTTPException(422, "Resume must be parsed first.")
    task = run_benchmark.delay(resume_json=resume.parsed_json, target_role=body.target_role, industry=body.industry or "technology")
    return {"task_id": task.id, "status": "processing"}

@router.get("/result/{task_id}")
def get_benchmark_result(task_id: str, current_user: User=Depends(get_current_user)):
    from workers.celery_app import celery_app
    from celery.result import AsyncResult
    r = AsyncResult(task_id, app=celery_app)
    if r.state=="SUCCESS": return {"status":"done","result":r.result}
    if r.state=="FAILURE": return {"status":"failed","error":str(r.result)}
    return {"status":r.state.lower(),"task_id":task_id}

@router.get("/roles")
def list_roles():
    return {"roles": SUPPORTED_ROLES, "industries": SUPPORTED_INDUSTRIES}
