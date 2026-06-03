"""
interview_predictor.py
Generates likely recruiter/interviewer questions based on weak or vague resume spots.
"""
import json
from ai_engine.llm_client import call_claude

INTERVIEW_SYSTEM = """You are a senior technical recruiter with 15 years of experience.
After reading a resume, you generate the probing questions you would ask in a screening call.
You focus on vague claims, missing metrics, unusual career moves, and unsupported skills.

Respond ONLY with valid JSON. Schema:
{
  "questions": [
    {
      "trigger": "<the resume line or claim that prompted this question>",
      "question": "<the exact question you'd ask>",
      "why": "<why this is a red flag or area of interest>",
      "good_answer_tip": "<what a strong candidate answer looks like>"
    }
  ],
  "overall_concern_level": "low|medium|high",
  "top_concern": "<the single biggest thing you'd probe on>"
}
Generate 5-8 questions."""


def predict_interview_questions(resume_json: dict) -> dict:
    experience = resume_json.get("experience", [])
    skills = resume_json.get("skills", [])
    education = resume_json.get("education", [])

    exp_text = ""
    for exp in experience[:4]:
        exp_text += f"\n{exp.get('title')} at {exp.get('company')} ({exp.get('start')}–{exp.get('end')})"
        for b in exp.get("bullets", [])[:4]:
            exp_text += f"\n  • {b}"

    edu_text = ""
    for edu in education[:2]:
        edu_text += f"\n{edu.get('degree')} at {edu.get('institution')} ({edu.get('end', '')})"

    user_prompt = f"""You are about to interview this candidate. Generate your probing questions.

EXPERIENCE:{exp_text}
EDUCATION:{edu_text}
SKILLS: {', '.join(skills[:20])}
SUMMARY: {resume_json.get('summary', '')[:300]}

Focus on vague claims, missing metrics, career gaps, and unverifiable skills.
Respond with JSON only."""

    response = call_claude(system=INTERVIEW_SYSTEM, user=user_prompt, max_tokens=1500)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"questions": [], "error": "Parse failed"}
