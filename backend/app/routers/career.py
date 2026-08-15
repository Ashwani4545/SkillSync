"""
career.py — Career trajectory & salary routers (Phase 3)
"""
import uuid
import threading
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user

router = APIRouter()

career_tasks_store = {}
salary_tasks_store = {}

class TrajectoryRequest(BaseModel):
    resume_id: str

class SalaryRequest(BaseModel):
    resume_id: str
    target_role: str
    location: Optional[str] = "Remote (US)"

@router.post("/trajectory")
def start_trajectory(body: TrajectoryRequest, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id==body.resume_id, Resume.user_id==current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json: raise HTTPException(422, "Resume must be parsed first.")
    
    task_id = str(uuid.uuid4())
    career_tasks_store[task_id] = {"status": "processing"}

    # Attempt Celery task enqueue, fallback to background thread
    try:
        from workers.career_task import run_career_prediction
        celery_task = run_career_prediction.delay(resume_json=resume.parsed_json)
        return {"task_id": celery_task.id, "status": "processing"}
    except Exception as err:
        print(f"[Career Warning] Celery not reachable ({err}). Executing thread fallback.")
        
        def _execute_career():
            try:
                from ai_engine.generators.career_predictor import predict_career_trajectory
                res = predict_career_trajectory(resume.parsed_json)
                career_tasks_store[task_id] = {"status": "done", "result": res}
            except Exception as ex:
                career_tasks_store[task_id] = {"status": "failed", "error": str(ex)}

        threading.Thread(target=_execute_career, daemon=True).start()
        return {"task_id": task_id, "status": "processing"}

@router.get("/result/{task_id}")
def get_career_result(task_id: str, current_user: User=Depends(get_current_user)):
    if task_id in career_tasks_store:
        return career_tasks_store[task_id]

    try:
        from workers.celery_app import celery_app
        from celery.result import AsyncResult
        r = AsyncResult(task_id, app=celery_app)
        if r.state == "SUCCESS": return {"status": "done", "result": r.result}
        if r.state == "FAILURE": return {"status": "failed", "error": str(r.result)}
        return {"status": r.state.lower(), "task_id": task_id}
    except Exception:
        return {"status": "failed", "error": "Task not found"}

@router.post("/salary")
def estimate_salary(body: SalaryRequest, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id==body.resume_id, Resume.user_id==current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json: raise HTTPException(422, "Resume must be parsed first.")
    
    task_id = str(uuid.uuid4())
    salary_tasks_store[task_id] = {"status": "processing"}

    try:
        from workers.salary_task import run_salary_estimation
        celery_task = run_salary_estimation.delay(
            resume_json=resume.parsed_json,
            target_role=body.target_role,
            location=body.location or "Remote (US)"
        )
        return {"task_id": celery_task.id, "status": "processing"}
    except Exception as err:
        print(f"[Salary Warning] Celery not reachable ({err}). Executing thread fallback.")
        
        def _execute_salary():
            try:
                from ai_engine.generators.salary_estimator import estimate_salary as calc_salary
                res = calc_salary(resume.parsed_json, body.target_role, body.location or "Remote (US)")
                salary_tasks_store[task_id] = {"status": "done", "result": res}
            except Exception as ex:
                salary_tasks_store[task_id] = {"status": "failed", "error": str(ex)}

        threading.Thread(target=_execute_salary, daemon=True).start()
        return {"task_id": task_id, "status": "processing"}

@router.get("/salary/result/{task_id}")
def get_salary_result(task_id: str, current_user: User=Depends(get_current_user)):
    if task_id in salary_tasks_store:
        return salary_tasks_store[task_id]

    try:
        from workers.celery_app import celery_app
        from celery.result import AsyncResult
        r = AsyncResult(task_id, app=celery_app)
        if r.state == "SUCCESS": return {"status": "done", "result": r.result}
        if r.state == "FAILURE": return {"status": "failed", "error": str(r.result)}
        return {"status": r.state.lower(), "task_id": task_id}
    except Exception:
        return {"status": "failed", "error": "Task not found"}
