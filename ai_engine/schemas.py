"""
schemas.py — validated output structures for the Career Intelligence Engine
(spec Problem 16). Replaces "trust whatever dict comes back" with an
actual contract: run_career_intelligence()'s final merged result is
validated against CareerIntelligenceReport before being returned/stored.

A validation failure is caught and surfaced as a warning rather than
raised — a partially-malformed LLM section shouldn't take down the
deterministic sections (candidate_profile, evidence_graph, proof_coverage)
that were already computed correctly and don't depend on the LLM at all.
"""
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class Identity(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class CareerLevel(BaseModel):
    level: str = ""
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = "LOW"


class CandidateProfile(BaseModel):
    identity: Identity = Field(default_factory=Identity)
    education: list[dict] = Field(default_factory=list)
    experience: list[dict] = Field(default_factory=list)
    projects: list[dict] = Field(default_factory=list)
    certifications: list[dict] = Field(default_factory=list)
    achievements: list[Any] = Field(default_factory=list)
    career_level: CareerLevel = Field(default_factory=CareerLevel)
    career_level_basis: Optional[str] = None


class EvidenceSource(BaseModel):
    source_type: str
    source_name: str
    text: str


class SkillEvidence(BaseModel):
    skill: str
    canonical_name: str
    category: str
    evidence_level: Literal[
        "DIRECT_IMPLEMENTATION", "STRONG_MENTION", "INDIRECT_EVIDENCE", "WEAK_MENTION", "NO_EVIDENCE"
    ]
    status: Literal["EVIDENCED", "PARTIALLY_EVIDENCED", "UNSUPPORTED"]
    confidence: float
    evidence: list[EvidenceSource] = Field(default_factory=list)


class ProofCoverage(BaseModel):
    proof_coverage_pct: Optional[int] = None
    strongly_evidenced: int = 0
    weakly_evidenced: int = 0
    unsupported: int = 0
    total_skills: int = 0


class ATSReadiness(BaseModel):
    """Renamed from 'Universal ATS Score' (spec Problem 6) — there is no
    single universal ATS scoring system, so this is scoped honestly as
    parsing/structure readiness, separate from job matching."""
    ats_readiness_score: int = 0
    explanation: str = ""
    issues: list[str] = Field(default_factory=list)


class JobMatch(BaseModel):
    """job_match_score is None (not 0) when no JD was supplied — a missing
    input is not the same as a bad score (spec Problem 6)."""
    job_match_score: Optional[int] = None
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    partially_matched: list[str] = Field(default_factory=list)
    not_evidenced: list[str] = Field(default_factory=list)


class PersonaResult(BaseModel):
    score: int = 0
    strengths: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class PersonaAnalysis(BaseModel):
    ats: PersonaResult = Field(default_factory=PersonaResult)
    hr_recruiter: PersonaResult = Field(default_factory=PersonaResult)
    hiring_manager: PersonaResult = Field(default_factory=PersonaResult)


class CareerReadiness(BaseModel):
    resume_ats_readiness: int = 0
    job_match: Optional[int] = None
    skill_readiness: int = 0
    experience_readiness: int = 0
    overall_career_readiness: int = 0
    explanation: str = ""


class PriorityAction(BaseModel):
    priority: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    problem: str = ""
    evidence: str = ""
    why_it_matters: str = ""
    what_to_do: str = ""
    expected_impact: str = ""


class InterviewQuestion(BaseModel):
    question: str
    why_this_question: str = ""
    resume_trigger: str = ""
    high_risk: bool = False
    source_claim: Optional[str] = None


class BulletRewrite(BaseModel):
    current_bullet: str
    problem: str = ""
    missing_element: str = ""
    improved_version: str = ""
    why_better: str = ""


class CareerIntelligenceReport(BaseModel):
    """Top-level validated shape of a full analysis result."""
    candidate_profile: CandidateProfile = Field(default_factory=CandidateProfile)
    evidence_graph: list[SkillEvidence] = Field(default_factory=list)
    proof_coverage: ProofCoverage = Field(default_factory=ProofCoverage)
    claims: list[dict] = Field(default_factory=list)
    resume_analysis: dict = Field(default_factory=dict)
    ats_readiness: ATSReadiness = Field(default_factory=ATSReadiness)
    job_match: JobMatch = Field(default_factory=JobMatch)
    career_positioning: dict = Field(default_factory=dict)
    target_role: dict = Field(default_factory=dict)
    career_readiness: CareerReadiness = Field(default_factory=CareerReadiness)
    skill_gaps: dict = Field(default_factory=dict)
    career_path: dict = Field(default_factory=dict)
    career_roadmap: dict = Field(default_factory=dict)
    bullet_rewrites: list[BulletRewrite] = Field(default_factory=list)
    jd_adapter: dict = Field(default_factory=dict)
    interview_prediction: dict = Field(default_factory=dict)
    benchmark: dict = Field(default_factory=dict)
    career_gap_analysis: dict = Field(default_factory=dict)
    global_employability: dict = Field(default_factory=dict)
    persona_analysis: PersonaAnalysis = Field(default_factory=PersonaAnalysis)
    priority_actions: list[PriorityAction] = Field(default_factory=list)
    confidence: dict = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
