"""
Exercises ai_engine.pipeline.run_full_pipeline end-to-end using the built-in
mock LLM (USE_MOCK_LLM=true, set in conftest.py) so this runs with no real
API key and no network access — good for CI.

Adapted from the manual script that used to live at scratch/test_ats_accuracy.py.
"""
from ai_engine.pipeline import run_full_pipeline


def test_pipeline_returns_all_expected_sections(sample_resume_json):
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

    for key in ("ats", "sections", "bullets", "audit", "tone", "personas", "skills", "interview"):
        assert key in result, f"pipeline result is missing '{key}'"


def test_ats_no_false_positive_missing_links(sample_resume_json):
    """
    Regression test: the resume fixture DOES include LinkedIn and GitHub
    links in `contact`, so the ATS analyzer must not flag them as missing.
    """
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    format_issues = result["ats"].get("format_issues", [])

    assert not any("LinkedIn" in issue for issue in format_issues)
    assert not any("GitHub" in issue for issue in format_issues)


def test_ats_works_without_jd(sample_resume_json):
    """The pipeline must not require a job description to run."""
    result = run_full_pipeline(sample_resume_json, jd_text=None, user_plan="free")
    assert "score" in result["ats"]
