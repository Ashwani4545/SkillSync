from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
import uuid


class JDAdaptRequest(BaseModel):
    resume_id: uuid.UUID
    jd_text: str


class JDMatchOut(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    jd_text: str
    adapted_resume_json: Optional[dict[str, Any]] = None
    match_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JDMatchListOut(BaseModel):
    matches: list[JDMatchOut]
    total: int
