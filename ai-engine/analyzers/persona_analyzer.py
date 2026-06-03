"""
persona_analyzer.py
Analyzes the resume from three distinct perspectives simultaneously:
  1. ATS Bot — automated keyword and format scanner
  2. HR Recruiter — initial human screen for red flags
  3. Hiring Manager — evaluates real-world capability

Each persona returns where they'd stop reading and why.
"""
import json
from ai_engine.llm_client import call_claude


PERSONA_SYSTEM = """You are simulating how three different resume reviewers read a resume.
Respond ONLY with valid JSON. No preamble or explanation outside JSON.

Response schema:
{
  "ats_bot": {
    "verdict": "pass" | "fail",
    "score": <0-100>,
    "stop_reading_at": "<section or line where ATS would reject>",
    "issues": ["<specific issue 1>", "<specific issue 2>"],
    "passed_checks": ["<check that passed>"]
  },
  "hr_recruiter": {
    "verdict": "shortlist" | "maybe" | "reject",
    "score": <0-100>,
    "stop_reading_at": "<section where recruiter loses interest or finds red flag>",
    "red_flags": ["<red flag 1>"],
    "green_flags": ["<positive signal 1>"],
    "first_impression": "<1 sentence gut reaction>"
  },
  "hiring_manager": {
    "verdict": "strong" | "consider" | "pass",
    "score": <0-100>,
    "stop_reading_at": "<section where hiring manager questions credibility>",
    "credibility_gaps": ["<claim that seems unsupported>"],
    "strengths": ["<genuine strength>"],
    "probe_questions": ["<question they'd ask in interview about this resume>"]
  }
}"""


def analyze_personas(resume_json: dict) -> dict:
    """Run three-persona analysis on the resume."""
    contact = resume_json.get("contact", {})
    experience = resume_json.get("experience", [])
    skills = resume_json.get("skills", [])

    exp_text = ""
    for exp in experience[:4]:
        exp_text += f"\nROLE: {exp.get('title')} at {exp.get('company')} ({exp.get('start')}–{exp.get('end')})"
        for b in exp.get("bullets", [])[:5]:
            exp_text += f"\n  • {b}"

    user_prompt = f"""Analyze this resume from three perspectives.

CANDIDATE: {contact.get('name', 'Unknown')}
SUMMARY: {resume_json.get('summary', 'No summary provided')[:300]}
SKILLS: {', '.join(skills[:20])}
EXPERIENCE:{exp_text}
EDUCATION: {resume_json.get('education', [{}])[0].get('degree', '') if resume_json.get('education') else 'Not specified'}

Respond with JSON only."""

    response = call_claude(
        system=PERSONA_SYSTEM,
        user=user_prompt,
        max_tokens=1500,
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"error": "Parse failed", "raw": response}
