"""
builder.py — resume builder (spec section 7E/7F/13): create a resume from
scratch, autosave edits, and export as PDF/DOCX.

Reuses the existing Resume table (source="builder" distinguishes these
rows from uploaded resumes) and the exact same parsed_json shape the rest
of the platform already works with — a builder resume is analyzable by
the same Career Intelligence Engine pipeline as an uploaded one with zero
extra code, since neither cares how parsed_json was populated.
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user
from app.services.resume_export_service import render_resume_pdf, render_resume_docx, list_templates, TEMPLATES

router = APIRouter()

EMPTY_RESUME_JSON = {
    "contact": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""},
    "summary": "",
    "experience": [],
    "projects": [],
    "skills": [],
    "education": [],
    "certifications": [],
}


class BuilderCreateRequest(BaseModel):
    template: str = "minimal"


class BuilderUpdateRequest(BaseModel):
    parsed_json: dict
    template: str | None = None


def _get_owned_builder_resume(resume_id: str, db: Session, current_user: User) -> Resume:
    """
    Shared ownership check — a builder resume (or any resume) must never be
    readable/writable by anyone other than the user who created it, even
    with a guessed/enumerated ID (spec section 15: "A user must never be
    able to access another user's private resume... through a modified
    ID or API request").
    """
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id, Resume.source == "builder")
        .first()
    )
    if not resume:
        raise HTTPException(404, "Builder resume not found.")
    return resume


@router.get("/templates")
def get_templates():
    return {"templates": list_templates()}


@router.post("", status_code=201)
def create_builder_resume(
    body: BuilderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.template not in TEMPLATES:
        raise HTTPException(400, f"Unknown template '{body.template}'.")

    resume = Resume(
        user_id=current_user.id,
        filename="Untitled resume",
        file_type="builder",
        parsed_json=dict(EMPTY_RESUME_JSON),
        source="builder",
        template=body.template,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize(resume)


@router.get("/{resume_id}")
def get_builder_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_builder_resume(resume_id, db, current_user)
    return _serialize(resume)


@router.patch("/{resume_id}")
def update_builder_resume(
    resume_id: str,
    body: BuilderUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Autosave endpoint — called on every debounced edit from the builder UI.
    Overwrites parsed_json wholesale (the frontend always sends the full,
    current draft state) rather than trying to merge partial patches, which
    keeps this endpoint simple and avoids subtle merge bugs losing content.
    """
    resume = _get_owned_builder_resume(resume_id, db, current_user)

    resume.parsed_json = body.parsed_json
    if body.template:
        if body.template not in TEMPLATES:
            raise HTTPException(400, f"Unknown template '{body.template}'.")
        resume.template = body.template

    contact_name = (body.parsed_json.get("contact") or {}).get("name")
    resume.filename = f"{contact_name} - Resume" if contact_name else "Untitled resume"
    resume.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(resume)
    return _serialize(resume)


@router.delete("/{resume_id}", status_code=204)
def delete_builder_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_builder_resume(resume_id, db, current_user)
    db.delete(resume)
    db.commit()


@router.post("/{resume_id}/export")
def export_builder_resume(
    resume_id: str,
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_builder_resume(resume_id, db, current_user)
    template = resume.template or "minimal"

    if format == "pdf":
        file_bytes = render_resume_pdf(resume.parsed_json, template)
        media_type = "application/pdf"
        ext = "pdf"
    elif format == "docx":
        file_bytes = render_resume_docx(resume.parsed_json, template)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ext = "docx"
    else:
        raise HTTPException(400, "format must be 'pdf' or 'docx'.")

    filename = (resume.filename or "resume").replace(" ", "_")
    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}.{ext}"'},
    )


def _serialize(resume: Resume) -> dict:
    return {
        "id": resume.id,
        "filename": resume.filename,
        "template": resume.template,
        "parsed_json": resume.parsed_json,
        "updated_at": resume.updated_at.isoformat() if resume.updated_at else None,
        "created_at": resume.created_at.isoformat() if resume.created_at else None,
    }
