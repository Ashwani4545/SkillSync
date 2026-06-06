"""
recruiter.py — Recruiter/Team dashboard router (Phase 3 B2B foundation)
POST /api/v1/recruiter/bulk-upload   Upload multiple resumes for bulk screening
GET  /api/v1/recruiter/candidates    List all screened candidates
POST /api/v1/recruiter/screen        Auto-screen a batch of resumes against a JD
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import io

from app.db.session import get_db
from app.db.models import User, Resume, Analysis, AnalysisStatusEnum
from app.middleware.auth import get_current_user, require_team
from app.services import parser_service, storage_service
from workers.analyze_task import run_analysis

router = APIRouter()

TEAM_BULK_LIMIT = 50  # max resumes per batch


class BulkScreenRequest(BaseModel):
    resume_ids: list[str]
    jd_text: str
    role_title: Optional[str] = None


@router.post("/bulk-upload", status_code=status.HTTP_201_CREATED)
async def bulk_upload_resumes(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    """Upload up to 50 resumes at once for bulk screening."""
    if len(files) > TEAM_BULK_LIMIT:
        raise HTTPException(400, f"Maximum {TEAM_BULK_LIMIT} resumes per batch.")

    uploaded = []
    errors   = []

    for f in files:
        try:
            data = await f.read()
            file_type = "pdf" if "pdf" in (f.content_type or "") else "docx"

            parsed = (
                parser_service.parse_pdf(io.BytesIO(data))
                if file_type == "pdf"
                else parser_service.parse_docx(io.BytesIO(data))
            )

            s3_key = storage_service.upload_resume(
                file_data=data,
                filename=f.filename or "resume",
                user_id=str(current_user.id),
            )

            resume = Resume(
                user_id=current_user.id,
                filename=f.filename or "resume",
                s3_key=s3_key,
                file_type=file_type,
                raw_text=parsed.get("raw_text", ""),
                parsed_json=parsed,
                file_size=len(data),
            )
            db.add(resume)
            db.flush()
            uploaded.append({"id": str(resume.id), "filename": f.filename})
        except Exception as e:
            errors.append({"filename": f.filename, "error": str(e)})

    db.commit()
    return {
        "uploaded": uploaded,
        "errors":   errors,
        "count":    len(uploaded),
    }


@router.post("/screen")
def bulk_screen(
    body: BulkScreenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    """Screen multiple resumes against a JD — queues async analysis for each."""
    if len(body.resume_ids) > TEAM_BULK_LIMIT:
        raise HTTPException(400, f"Maximum {TEAM_BULK_LIMIT} resumes per screen.")

    tasks = []
    for rid in body.resume_ids:
        resume = db.query(Resume).filter(
            Resume.id == rid,
            Resume.user_id == current_user.id,
        ).first()
        if not resume or not resume.parsed_json:
            continue

        analysis = Analysis(
            resume_id=resume.id,
            jd_text=body.jd_text,
            status=AnalysisStatusEnum.pending,
        )
        db.add(analysis)
        db.flush()

        task = run_analysis.delay(
            analysis_id=str(analysis.id),
            resume_json=resume.parsed_json,
            jd_text=body.jd_text,
            user_plan="team",
        )
        tasks.append({
            "resume_id":   rid,
            "analysis_id": str(analysis.id),
            "task_id":     task.id,
        })

    db.commit()
    return {
        "screened": len(tasks),
        "tasks":    tasks,
        "message":  "Bulk screening started. Poll /analysis/{id} for each result.",
    }


@router.get("/candidates")
def list_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
    skip: int = 0,
    limit: int = 50,
):
    """List all uploaded candidates with their latest analysis scores."""
    from sqlalchemy import desc

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(desc(Resume.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    candidates = []
    for r in resumes:
        latest = (
            db.query(Analysis)
            .filter(Analysis.resume_id == r.id, Analysis.status == "done")
            .order_by(desc(Analysis.completed_at))
            .first()
        )
        score = None
        if latest and latest.results_json:
            score = latest.results_json.get("overall_score", {}).get("score")

        candidates.append({
            "resume_id":   str(r.id),
            "filename":    r.filename,
            "name":        r.parsed_json.get("contact", {}).get("name") if r.parsed_json else None,
            "score":       score,
            "analysis_id": str(latest.id) if latest else None,
            "uploaded_at": r.created_at.isoformat(),
        })

    return {"candidates": candidates, "total": len(candidates)}
