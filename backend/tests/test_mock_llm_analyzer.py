"""
Direct unit test on ai_engine.llm_client.call_claude's mock branch.

This is the ~1,600-line heuristic engine that stands in for a real Claude
call when USE_MOCK_LLM=true (see ai_engine/llm_client.py). It's exercised
indirectly by test_ats_pipeline.py too, but this test isolates it and
checks the contract other code relies on: valid JSON with a numeric score.
"""
import json
import os

from ai_engine.llm_client import call_claude


def test_mock_ats_response_is_valid_json():
    assert os.environ.get("USE_MOCK_LLM") == "true"

    system = "You are an ATS compatibility checker."
    user = """Perform ATS compatibility analysis.

TARGET JOB ROLE: Senior Software Engineer
DEMANDED SKILLS: Python, React, FastAPI

CANDIDATE CONTACT DETAILS:
- Name: Jane Doe
- Email: jane@example.com
- Phone: 555-1234
- Location: Austin, TX
- LinkedIn: linkedin.com/in/janedoe
- GitHub: github.com/janedoe

RESUME SUMMARY: Senior engineer with 6 years of backend experience.
RESUME SKILLS: python, react, fastapi, docker
"""

    raw = call_claude(system=system, user=user, max_tokens=1000)
    parsed = json.loads(raw)

    assert "score" in parsed
    assert isinstance(parsed["score"], int)
    assert 0 <= parsed["score"] <= 100


def test_mock_audit_response_flags_known_typo():
    system = "Perform a comprehensive 13-point CV audit."
    user = "RESUME EXPERIENCE:\n- Title: devloper | Company: Old Co | Dates: 2019 - 2020\n  • Worked on the backend."

    raw = call_claude(system=system, user=user, max_tokens=1000)
    parsed = json.loads(raw)

    assert "spelling_grammar" in parsed
    errors = " ".join(parsed["spelling_grammar"].get("errors", []))
    assert "devloper" in errors
