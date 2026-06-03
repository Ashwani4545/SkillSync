"""
gap_disguiser.py
Detects employment gaps and suggests honest, strategic reframing narratives.
Never fabricates — only reframes truthfully what likely happened.

Phase 2 feature — Pro plan and above.
"""
import json, re
from datetime import datetime
from ai_engine.llm_client import call_claude

GAP_SYSTEM = """You are a career counselor who helps candidates address employment gaps
strategically and honestly. You never suggest lying. You help candidates find the most
truthful, positive framing of their career timeline.

Respond ONLY with valid JSON. Schema:
{
  "gaps_detected": [
    {
      "start": "<month year or year>",
      "end":   "<month year or year>",
      "duration_months": <integer>,
      "severity": "minor" | "moderate" | "significant",
      "context_before": "<role they left>",
      "context_after":  "<role they joined>"
    }
  ],
  "gap_strategies": [
    {
      "gap_index": <0-based index into gaps_detected>,
      "strategies": [
        {
          "label": "<e.g. Freelance reframe>",
          "narrative": "<exact text to use in resume/cover letter>",
          "risk_level": "low" | "medium",
          "use_when": "<when this strategy is appropriate>"
        }
      ]
    }
  ],
  "cover_letter_tip": "<how to address gaps proactively in a cover letter>",
  "interview_answer": "<sample answer to 'What were you doing during your gap?'>"
}"""


def analyze_career_gaps(resume_json: dict) -> dict:
    """
    Detect and advise on employment gaps in the resume.
    """
    experience = resume_json.get("experience", [])
    if not experience:
        return {"gaps_detected": [], "message": "No experience data found."}

    # Build timeline string for Claude
    timeline = _build_timeline(experience)

    user_prompt = f"""Analyze this career timeline for employment gaps.

CAREER TIMELINE:
{timeline}

Detect any gaps of 2+ months between roles, calculate their duration,
and provide honest reframing strategies for each.

Respond with JSON only."""

    response = call_claude(
        system=GAP_SYSTEM,
        user=user_prompt,
        max_tokens=1500,
        temperature=0.3,
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"gaps_detected": [], "error": "Parse failed"}


def _build_timeline(experience: list) -> str:
    lines = []
    for i, exp in enumerate(experience):
        title   = exp.get("title", "Unknown role")
        company = exp.get("company", "Unknown company")
        start   = exp.get("start", "?")
        end     = exp.get("end",   "present")
        lines.append(f"{i+1}. {title} at {company} | {start} – {end}")
    return "\n".join(lines)
