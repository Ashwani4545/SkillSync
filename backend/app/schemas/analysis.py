from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Union
import uuid


class AnalysisStartRequest(BaseModel):
    resume_id: Union[uuid.UUID, str]
    jd_text: Optional[str] = None
    target_role: Optional[str] = None
    demanded_skills: Optional[str] = None


class AnalysisOut(BaseModel):
    id: Union[uuid.UUID, str]
    resume_id: Union[uuid.UUID, str]
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
