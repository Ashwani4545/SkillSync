"""
All database models in one place so Alembic auto-detects them.
Import this module in main.py to register all models.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, DateTime, ForeignKey,
    Enum as SAEnum, Integer, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


# ── Enums ────────────────────────────────────────────────────────────────────

class PlanEnum(str, enum.Enum):
    free   = "free"
    pro    = "pro"
    career = "career"
    team   = "team"


class AnalysisStatusEnum(str, enum.Enum):
    pending    = "pending"
    processing = "processing"
    done       = "done"
    failed     = "failed"


class SubscriptionStatusEnum(str, enum.Enum):
    active   = "active"
    inactive = "inactive"
    canceled = "canceled"
    past_due = "past_due"


# ── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    clerk_id   = Column(String(255), unique=True, nullable=False, index=True)
    full_name  = Column(String(255), nullable=True)
    plan       = Column(SAEnum(PlanEnum), default=PlanEnum.free, nullable=False)
    analyses_used_this_month = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes      = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)


class Resume(Base):
    __tablename__ = "resumes"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename    = Column(String(500), nullable=False)
    s3_key      = Column(String(1000), nullable=True)   # null during local dev
    file_type   = Column(String(10), nullable=False)    # "pdf" or "docx"
    raw_text    = Column(Text, nullable=True)
    parsed_json = Column(JSONB, nullable=True)          # structured sections
    file_size   = Column(Integer, nullable=True)        # bytes
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    user      = relationship("User", back_populates="resumes")
    analyses  = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")
    jd_matches= relationship("JDMatch", back_populates="resume", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id    = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    jd_text      = Column(Text, nullable=True)          # optional JD for matching
    status       = Column(SAEnum(AnalysisStatusEnum), default=AnalysisStatusEnum.pending, nullable=False)
    results_json = Column(JSONB, nullable=True)         # full analysis output
    error_msg    = Column(Text, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    resume             = relationship("Resume", back_populates="analyses")
    interview_questions= relationship("InterviewQuestion", back_populates="analysis",
                                      cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    questions   = Column(JSONB, nullable=False)   # list of {bullet, questions[]}
    created_at  = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="interview_questions")


class JDMatch(Base):
    __tablename__ = "jd_matches"

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id            = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    jd_text              = Column(Text, nullable=False)
    adapted_resume_json  = Column(JSONB, nullable=True)
    match_score          = Column(Float, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="jd_matches")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id            = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
                                nullable=False, unique=True)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_sub_id      = Column(String(255), nullable=True, index=True)
    plan               = Column(SAEnum(PlanEnum), default=PlanEnum.free, nullable=False)
    status             = Column(SAEnum(SubscriptionStatusEnum),
                                default=SubscriptionStatusEnum.inactive, nullable=False)
    current_period_end = Column(DateTime, nullable=True)
    created_at         = Column(DateTime, default=datetime.utcnow)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscription")
