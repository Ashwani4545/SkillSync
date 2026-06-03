"""
skill_checker.py
Cross-references claimed skills against experience bullets.
Flags skills listed without any supporting evidence in the resume.
"""
import json
from ai_engine.llm_client import call_claude

SKILL_SYSTEM = """You are a skeptical technical recruiter who verifies skill claims.
Cross-reference the skills list against the experience and project descriptions.

Respond ONLY with valid JSON. Schema:
{
  "evidenced_skills": [{"skill": "<name>", "evidence": "<where it appears in experience>"}],
  "unsupported_skills": [{"skill": "<name>", "risk": "<why this is a red flag>"}],
  "missing_skills": ["<skill implied by experience but not listed>"],
  "authenticity_score": <0-100>,
  "recommendation": "<1-2 sentence advice>"
}"""


def check_skills(resume_json: dict) -> dict:
    skills = resume_json.get("skills", [])
    experience = resume_json.get("experience", [])
    projects = resume_json.get("projects", [])

    all_bullets = []
    for exp in experience:
        all_bullets.extend(exp.get("bullets", []))
    for proj in projects:
        all_bullets.extend(proj.get("bullets", []))

    context = " ".join(all_bullets)

    user_prompt = f"""Check skill authenticity for this resume.

CLAIMED SKILLS: {', '.join(skills[:30])}

EXPERIENCE CONTEXT:
{context[:2000]}

Identify which skills have supporting evidence in the experience, which are unsupported,
and which skills are implied by the experience but NOT listed.

Respond with JSON only."""

    response = call_claude(system=SKILL_SYSTEM, user=user_prompt, max_tokens=1000)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"authenticity_score": 0, "error": "Parse failed"}
