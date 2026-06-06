"""
career_predictor.py
Analyzes current resume to infer career level, predict next 2 realistic roles,
and identify exact skill gaps blocking advancement to each role.

Phase 3 feature — Career plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude

CAREER_SYSTEM = """You are a senior career strategist with 20 years of experience
across multiple industries. You analyze resumes to predict career trajectories
based on the candidate's current level, industry patterns, and skill profile.

Respond ONLY with valid JSON. No preamble outside JSON.

Schema:
{
  "current_level": {
    "title": "<inferred current level e.g. Mid-level Software Engineer>",
    "years_experience": <integer>,
    "seniority": "junior|mid|senior|staff|principal|director|vp|c-level",
    "confidence": "high|medium|low"
  },
  "next_roles": [
    {
      "title": "<role title>",
      "timeline": "<e.g. 12-18 months>",
      "probability": <0-100 integer, likelihood given current trajectory>,
      "salary_range": "<e.g. $120k-$150k>",
      "why_realistic": "<why this is attainable>",
      "required_skills": ["<skill currently missing>"],
      "existing_strengths": ["<skills they already have that apply>"],
      "action_plan": ["<concrete step 1>", "<concrete step 2>", "<concrete step 3>"]
    }
  ],
  "stretch_role": {
    "title": "<ambitious but possible 3-5 year target>",
    "timeline": "3-5 years",
    "gap_summary": "<biggest gap between now and this role>",
    "key_milestones": ["<milestone 1>", "<milestone 2>"]
  },
  "career_risks": ["<risk that could derail trajectory>"],
  "unique_advantage": "<what makes this candidate stand out in their field>"
}"""


def predict_career_trajectory(resume_json: dict) -> dict:
    """Predict career trajectory and skill gaps from resume."""
    contact    = resume_json.get("contact", {})
    experience = resume_json.get("experience", [])
    skills     = resume_json.get("skills", [])
    education  = resume_json.get("education", [])
    summary    = resume_json.get("summary", "")

    # Build timeline
    timeline = "\n".join(
        f"- {e.get('title','?')} at {e.get('company','?')} "
        f"({e.get('start','?')} – {e.get('end','present')})"
        for e in experience[:6]
    )
    sample_bullets = []
    for e in experience[:3]:
        sample_bullets.extend(e.get("bullets", [])[:3])

    edu_text = " | ".join(
        f"{e.get('degree','')} from {e.get('institution','')}"
        for e in education[:2]
    )

    user_prompt = f"""Analyze this resume and predict the career trajectory.

CANDIDATE: {contact.get('name', 'Candidate')}
SUMMARY: {summary[:400]}

CAREER TIMELINE:
{timeline}

SAMPLE ACHIEVEMENTS:
{chr(10).join(f'• {b}' for b in sample_bullets[:9])}

SKILLS ({len(skills)} listed): {', '.join(skills[:25])}
EDUCATION: {edu_text or 'Not specified'}

Predict next 2 realistic roles (18-month horizon) and one 3-5 year stretch goal.
Include specific skill gaps and a concrete action plan for each.

Respond with JSON only."""

    response = call_claude(
        system=CAREER_SYSTEM,
        user=user_prompt,
        max_tokens=2000,
        temperature=0.3,
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if m:
            return json.loads(m.group(1))
        return {"error": "Parse failed", "raw": response[:300]}
