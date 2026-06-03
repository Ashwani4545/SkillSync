"""
section_grader.py
Grades each resume section individually with targeted improvement tips.
"""
import json
from ai_engine.llm_client import call_claude

GRADER_SYSTEM = """You are a professional resume reviewer. Grade each section of the resume.

Respond ONLY with valid JSON. Schema:
{
  "summary":    {"score": <0-100>, "grade": "<A-F>", "issues": [], "tips": []},
  "experience": {"score": <0-100>, "grade": "<A-F>", "issues": [], "tips": []},
  "education":  {"score": <0-100>, "grade": "<A-F>", "issues": [], "tips": []},
  "skills":     {"score": <0-100>, "grade": "<A-F>", "issues": [], "tips": []},
  "overall":    {"score": <0-100>, "grade": "<A-F>", "top3_fixes": ["fix1","fix2","fix3"]}
}
Each issues/tips list should have 2-4 items max. Be specific and actionable."""


def grade_sections(resume_json: dict) -> dict:
    summary = resume_json.get("summary", "")
    experience = resume_json.get("experience", [])
    education = resume_json.get("education", [])
    skills = resume_json.get("skills", [])

    exp_text = ""
    for e in experience[:3]:
        exp_text += f"\n{e.get('title')} at {e.get('company')}"
        for b in e.get("bullets", [])[:3]:
            exp_text += f"\n  • {b}"

    edu_text = " | ".join(
        f"{e.get('degree')} from {e.get('institution')}"
        for e in education[:2]
    )

    user_prompt = f"""Grade each section of this resume.

SUMMARY: {summary[:400] or 'MISSING'}
EXPERIENCE:{exp_text or ' MISSING'}
EDUCATION: {edu_text or 'MISSING'}
SKILLS: {', '.join(skills[:25]) or 'MISSING'}

Count of experience entries: {len(experience)}
Count of education entries: {len(education)}
Count of skills: {len(skills)}

Respond with JSON only."""

    response = call_claude(system=GRADER_SYSTEM, user=user_prompt, max_tokens=1000)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"error": "Parse failed", "raw": response}
