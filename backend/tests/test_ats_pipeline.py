"""
Exercises ai_engine.pipeline.run_full_pipeline end-to-end using the mock
LLM (USE_MOCK_LLM=true, set in conftest.py). candidate_profile and
evidence_graph are ALWAYS real/deterministic now (never mocked, since they
never touch the LLM at all) — everything else comes from the mock's
reasoning-only response.
"""
from ai_engine.pipeline import run_full_pipeline
from ai_engine.career_intelligence_engine import LLM_SECTION_KEYS

ALL_TOP_LEVEL_KEYS = LLM_SECTION_KEYS + ["candidate_profile", "evidence_graph", "proof_coverage", "claims"]


def test_pipeline_returns_all_required_top_level_sections(sample_resume_json):
    jd_text = (
        "Looking for a Senior Backend Engineer with strong expertise in "
        "Python, FastAPI, Docker, and PostgreSQL."
    )

    result = run_full_pipeline(
        sample_resume_json,
        jd_text=jd_text,
        user_plan="pro",
        target_role="Backend Engineer",
        demanded_skills="Python, FastAPI",
    )

    for key in ALL_TOP_LEVEL_KEYS:
        assert key in result, f"pipeline result is missing '{key}'"


def test_evidence_graph_reflects_actual_resume_content(sample_resume_json):
    """
    sample_resume_json's skills include Python, FastAPI, Docker, PostgreSQL,
    Git, CI/CD — Python/FastAPI/Docker are all mentioned in the experience
    bullets, so they should be EVIDENCED. This is now computed
    deterministically (evidence_engine.py), not by the LLM/mock at all.
    """
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    evidence_by_skill = {e["canonical_name"]: e["status"] for e in result["evidence_graph"]}

    assert evidence_by_skill["Python"] == "EVIDENCED"
    assert evidence_by_skill["FastAPI"] == "EVIDENCED"
    assert evidence_by_skill["Docker"] == "EVIDENCED"


def test_ats_readiness_used_when_no_jd(sample_resume_json):
    """Without a JD, ats_readiness should be populated and job_match should not claim a score."""
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")

    assert "ats_readiness_score" in result["ats_readiness"]
    assert isinstance(result["ats_readiness"]["ats_readiness_score"], int)
    assert result["job_match"]["job_match_score"] is None


def test_job_match_populated_when_jd_given(sample_resume_json):
    jd_text = "We need a Python and FastAPI engineer comfortable with Docker and PostgreSQL."
    result = run_full_pipeline(sample_resume_json, jd_text=jd_text, user_plan="free")

    assert result["job_match"]["job_match_score"] is not None
    assert "Python" in result["job_match"]["matched"]


def test_persona_analysis_has_all_three_personas(sample_resume_json):
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    personas = result["persona_analysis"]

    for persona in ("ats", "hr_recruiter", "hiring_manager"):
        assert persona in personas
        assert "score" in personas[persona]


def test_career_readiness_overall_is_true_average_of_components(sample_resume_json):
    """Spec Problem 23 (score consistency): overall_career_readiness must
    be genuinely derivable from its own components, not a disconnected
    LLM-invented number — this is now enforced deterministically in
    career_intelligence_engine.py, not just hoped for."""
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    cr = result["career_readiness"]

    components = [cr["resume_ats_readiness"], cr["skill_readiness"], cr["experience_readiness"]]
    expected = round(sum(components) / len(components))
    assert cr["overall_career_readiness"] == expected


def test_proof_coverage_present_and_consistent_with_evidence_graph(sample_resume_json):
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    assert result["proof_coverage"]["total_skills"] == len(result["evidence_graph"])


def test_priority_actions_flag_unsupported_skills(sample_resume_json):
    """A skill with no evidence should surface as a priority action, not
    just silently score lower somewhere."""
    resume_with_unsupported_skill = dict(sample_resume_json)
    resume_with_unsupported_skill["skills"] = sample_resume_json["skills"] + ["Kubernetes"]

    result = run_full_pipeline(resume_with_unsupported_skill, jd_text=None, user_plan="free")

    kubernetes_evidence = next(e for e in result["evidence_graph"] if e["canonical_name"] == "Kubernetes")
    assert kubernetes_evidence["status"] == "UNSUPPORTED"

    flagged_skills = [a["problem"] for a in result["priority_actions"]]
    assert any("Kubernetes" in p for p in flagged_skills)
