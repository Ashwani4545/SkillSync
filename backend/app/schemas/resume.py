from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Union
import uuid


class ResumeOut(BaseModel):
    id: Union[uuid.UUID, str]
    filename: str
    file_type: str
    file_size: Optional[int]
    parsed_json: Optional[dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeListOut(BaseModel):
    resumes: list[ResumeOut]
    total: int
