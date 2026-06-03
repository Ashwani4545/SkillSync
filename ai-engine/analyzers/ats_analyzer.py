"""
ats_analyzer.py
Scores the resume for ATS (Applicant Tracking System) compatibility.
Checks keyword density vs JD, formatting issues, and parseable structure.
"""
import json
from ai_engine.llm_client import call_claude
from ai_engine.prompts.ats_prompt import ATS_SYSTEM_PROMPT, build_ats_user_prompt


def analyze_ats(resume_json: dict, jd_text: str | None = None) -> dict:
    """
    Returns:
    {
      "score": 78,
      "pass": false,
      "missing_keywords": ["agile", "docker", "kubernetes"],
      "found_keywords": ["python", "react", "sql"],
      "format_issues": ["Uses tables which may break ATS", "Missing LinkedIn URL"],
      "improvements": ["Add 3–5 missing keywords naturally into experience bullets"]
    }
    """
    user_prompt = build_ats_user_prompt(resume_json, jd_text)

    response_text = call_claude(
        system=ATS_SYSTEM_PROMPT,
        user=user_prompt,
        max_tokens=1000,
    )

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Extract JSON from markdown fences if present
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response_text)
        if match:
            return json.loads(match.group(1))
        return {"score": 0, "error": "Failed to parse ATS response", "raw": response_text}
