"""
pipeline.py — orchestrator entry point

Rebuilt around the unified Career Intelligence Engine
(ai_engine/career_intelligence_engine.py), per the platform spec: one
shared Candidate Career Profile + Evidence Graph feeding every downstream
section, instead of 11 independent analyzer calls with no shared context.

The old approach (kept in ai_engine/analyzers/*.py and ai_engine/generators/*.py,
still used directly by their own standalone routers — /jd-adapter,
/interview/predict, /gap-advisor, etc.) called ats_analyzer, persona_analyzer,
tone_analyzer, section_grader, and eight others as separate, uncoordinated
Claude calls. This function is the MAIN resume-analysis entry point
(upload -> analyze -> result page) and now makes exactly one call.

Function signature is unchanged from the old pipeline so
workers/analyze_task.py and backend/app/routers/analysis.py need no changes.
"""
from ai_engine.career_intelligence_engine import run_career_intelligence


def run_full_pipeline(resume_json: dict, jd_text=None, user_plan="free", target_role=None, demanded_skills=None) -> dict:
    """
    demanded_skills is accepted for backward-compatible call signatures but
    not used directly — the unified engine reasons over the full JD text
    itself rather than a pre-extracted skill list.
    """
    return run_career_intelligence(
        resume_json,
        target_role=target_role,
        jd_text=jd_text,
    )
