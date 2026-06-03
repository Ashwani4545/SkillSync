from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import io

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user
from app.services import parser_service, storage_service
from app.schemas.resume import ResumeOut, ResumeListOut

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a PDF or DOCX resume.
    Parses it immediately and stores the structured JSON.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Upload a PDF or DOCX.",
        )

    file_data = await file.read()

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit.")

    file_type = ALLOWED_TYPES[file.content_type]

    # Parse the resume
    file_io = io.BytesIO(file_data)
    try:
        if file_type == "pdf":
            parsed = parser_service.parse_pdf(file_io)
        else:
            parsed = parser_service.parse_docx(file_io)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse resume: {str(e)}")

    # Upload to S3 (or local)
    s3_key = storage_service.upload_resume(
        file_data=file_data,
        filename=file.filename,
        user_id=str(current_user.id),
    )

    # Save to DB
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        s3_key=s3_key,
        file_type=file_type,
        raw_text=parsed.get("raw_text", ""),
        parsed_json=parsed,
        file_size=len(file_data),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return resume


@router.get("/", response_model=ResumeListOut)
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"resumes": resumes, "total": len(resumes)}


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    db.delete(resume)
    db.commit()
