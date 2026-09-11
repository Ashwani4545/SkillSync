"""
All database models in one place so Alembic auto-detects them.
Import this module in main.py to register all models.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, DateTime, ForeignKey,
    Enum as SAEnum, Integer, Boolean, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


def generate_uuid():
    return str(uuid.uuid4())


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

    id         = Column(String(36), primary_key=True, default=generate_uuid)
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

    id          = Column(String(36), primary_key=True, default=generate_uuid)
    user_id     = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename    = Column(String(500), nullable=False)
    s3_key      = Column(String(1000), nullable=True)   # null during local dev
    file_type   = Column(String(10), nullable=False)    # "pdf" or "docx"
    raw_text    = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True)           # structured sections
    file_size   = Column(Integer, nullable=True)        # bytes
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    user      = relationship("User", back_populates="resumes")
    analyses  = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")
    jd_matches= relationship("JDMatch", back_populates="resume", cascade="all, delete-orphan")
    proof_scores = relationship("ProofScore", back_populates="resume", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id           = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id    = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    jd_text      = Column(Text, nullable=True)          # optional JD for matching
    status       = Column(SAEnum(AnalysisStatusEnum), default=AnalysisStatusEnum.pending, nullable=False)
    results_json = Column(JSON, nullable=True)          # full analysis output
    error_msg    = Column(Text, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    resume             = relationship("Resume", back_populates="analyses")
    interview_questions= relationship("InterviewQuestion", back_populates="analysis",
                                      cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id          = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    questions   = Column(JSON, nullable=False)   # list of {bullet, questions[]}
    created_at  = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="interview_questions")


class JDMatch(Base):
    __tablename__ = "jd_matches"

    id                   = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id            = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    jd_text              = Column(Text, nullable=False)
    adapted_resume_json  = Column(JSON, nullable=True)
    match_score          = Column(Float, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)

    resume      = relationship("Resume", back_populates="jd_matches")


class ProofScore(Base):
    """One Proof Score run per resume — cross-references claimed skills
    against real GitHub activity (commits, languages, recency)."""
    __tablename__ = "proof_scores"

    id                 = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id          = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    github_username    = Column(String(255), nullable=False)
    overall_score       = Column(Integer, nullable=False)   # 0-100, % of claimed skills with evidence
    verified_count      = Column(Integer, default=0)
    weak_count          = Column(Integer, default=0)
    unverified_count    = Column(Integer, default=0)
    repos_analyzed_json = Column(JSON, nullable=True)       # raw repo metadata used
    is_public           = Column(Boolean, default=False)    # gates the /share/proof/{token} page
    share_token          = Column(String(64), unique=True, nullable=True, index=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)

    resume = relationship("Resume", back_populates="proof_scores")
    skills = relationship("ProofScoreSkill", back_populates="proof_score", cascade="all, delete-orphan")


class ProofScoreSkill(Base):
    """Per-skill breakdown for a ProofScore run."""
    __tablename__ = "proof_score_skills"

    id             = Column(String(36), primary_key=True, default=generate_uuid)
    proof_score_id = Column(String(36), ForeignKey("proof_scores.id", ondelete="CASCADE"), nullable=False)
    skill_name     = Column(String(255), nullable=False)
    status         = Column(String(20), nullable=False)      # "verified" | "weak" | "unverified"
    confidence     = Column(Integer, nullable=False)         # 0-100
    evidence_repo  = Column(String(500), nullable=True)      # repo name backing this skill, if any
    evidence_url   = Column(String(1000), nullable=True)
    reason         = Column(Text, nullable=True)             # human-readable "why" (e.g. "no commits using this language in the last 2 years")
    suggested_bullet = Column(Text, nullable=True)           # AI-drafted bullet from real commit evidence, if generated

    proof_score = relationship("ProofScore", back_populates="skills")


class BenchmarkResume(Base):
    """
    A single anonymized top-tier resume used as ground truth for the
    benchmark engine's real vector-similarity comparison. Populated by
    backend/scripts/ingest_benchmark_resumes.py, never by user upload —
    this table has NO relationship to the `resumes` table on purpose,
    and deliberately stores no raw text, name, email, or phone. Only the
    embedding vector and a handful of structural statistics.
    """
    __tablename__ = "benchmark_resumes"

    id                  = Column(String(36), primary_key=True, default=generate_uuid)
    target_role         = Column(String(255), nullable=False, index=True)
    industry            = Column(String(100), nullable=False, index=True)
    embedding_json       = Column(JSON, nullable=False)   # list[float], 384-dim (all-MiniLM-L6-v2)
    quantification_rate = Column(Integer, nullable=False)  # % of bullets with a number/metric
    bullet_count         = Column(Integer, nullable=False)
    skills_count          = Column(Integer, nullable=False)
    experience_entries    = Column(Integer, nullable=False)
    source_label         = Column(String(255), nullable=True)  # e.g. "dataset_batch_1/resume_042" — never a real name
    created_at            = Column(DateTime, default=datetime.utcnow, nullable=False)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id                 = Column(String(36), primary_key=True, default=generate_uuid)
    user_id            = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"),
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
