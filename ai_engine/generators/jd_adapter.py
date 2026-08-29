"""
jd_adapter.py
Takes a resume JSON and a job description, returns a fully tailored
resume JSON that maximizes keyword match while preserving authentic voice.

Phase 2 feature — Pro plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude

JD_ADAPTER_SYSTEM = """You are a professional resume writer who specializes in tailoring
resumes to specific job descriptions. Your goal is to maximize ATS keyword matching
while keeping the candidate's authentic voice and never fabricating experience.

Rules:
- Only rewrite/reorder existing content. NEVER invent new experience or skills.
- Naturally weave missing JD keywords into existing bullets where truthful.
- Reorder bullet points to put the most relevant ones first.
- Adjust the summary to mirror the JD's language and priorities.
- Add any genuinely applicable skills from JD that the candidate clearly has but didn't list.
- Keep all dates, company names, titles, and metrics exactly as they are.

Respond ONLY with valid JSON. No preamble, no explanation outside JSON.

Output schema (mirrors the input resume_json schema):
{
  "contact": { ...same as input... },
  "summary": "<rewritten summary targeting this role>",
  "experience": [
    {
      "company": "...", "title": "...", "start": "...", "end": "...",
      "bullets": ["<reordered/rewritten bullets prioritizing JD relevance>"]
    }
  ],
  "education": [ ...same as input... ],
  "skills": ["<reordered skills list — JD keywords first>"],
  "certifications": [...],
  "projects": [...],
  "changes_made": ["<list of specific changes made and why>"],
  "keywords_added": ["<keywords from JD that were woven in>"],
  "match_score_before": <estimated ATS score before>,
  "match_score_after":  <estimated ATS score after>
}"""


def adapt_resume_to_jd(resume_json: dict, jd_text: str) -> dict:
    """
    Adapt a resume to a specific job description.
    Returns the modified resume JSON plus metadata about changes.
    """
    # Build a compact resume representation to fit in context
    exp_text = _format_experience(resume_json.get("experience", []))
    skills_text = ", ".join(resume_json.get("skills", [])[:40])

    user_prompt = f"""Tailor this resume to the job description below.

=== CURRENT RESUME ===
NAME: {resume_json.get("contact", {}).get("name", "Candidate")}

SUMMARY:
{resume_json.get("summary", "No summary provided")[:500]}

EXPERIENCE:
{exp_text}

SKILLS: {skills_text}

EDUCATION:
{_format_education(resume_json.get("education", []))}

=== JOB DESCRIPTION ===
{jd_text[:3000]}

Return the fully tailored resume as JSON. Do not fabricate anything."""

    response = call_claude(
        system=JD_ADAPTER_SYSTEM,
        user=user_prompt,
        max_tokens=3000,
        temperature=0.2,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            result = json.loads(match.group(1))
        else:
            result = {"error": "Parse failed", "raw": response[:500]}

    # Always preserve original contact info
    result["contact"] = resume_json.get("contact", {})
    return result


def _format_experience(experience: list) -> str:
    lines = []
    for exp in experience[:5]:
        lines.append(f"\n{exp.get('title', '')} at {exp.get('company', '')} "
                     f"({exp.get('start', '')} – {exp.get('end', '')})")
        for b in exp.get("bullets", [])[:5]:
            lines.append(f"  • {b}")
    return "\n".join(lines)


def _format_education(education: list) -> str:
    return " | ".join(
        f"{e.get('degree', '')} from {e.get('institution', '')} ({e.get('end', '')})"
        for e in education[:2]
    )
