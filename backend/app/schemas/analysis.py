from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
import uuid


class AnalysisStartRequest(BaseModel):
    resume_id: uuid.UUID
    jd_text: Optional[str] = None


class AnalysisOut(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    status: str
    results_json: Optional[dict[str, Any]] = None
    error_msg: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisListOut(BaseModel):
    analyses: list[AnalysisOut]
    total: int
