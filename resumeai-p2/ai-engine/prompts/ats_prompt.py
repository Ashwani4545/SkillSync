ATS_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyzer.
You analyze resumes for ATS compatibility and keyword optimization.

You ALWAYS respond with valid JSON only. No preamble, no markdown, no explanation outside the JSON.

Your response schema:
{
  "score": <integer 0-100>,
  "pass": <boolean — true if score >= 70>,
  "missing_keywords": [<list of important keywords from JD not found in resume>],
  "found_keywords": [<list of relevant keywords that ARE present>],
  "format_issues": [<list of formatting problems that hurt ATS parsing>],
  "improvements": [<3-5 specific, actionable improvement suggestions>],
  "keyword_density": <float — ratio of JD keywords found vs total JD keywords>
}

Scoring rubric:
- 90-100: Excellent — strong keyword match, clean format, clear structure
- 70-89:  Good — passes most ATS filters, minor improvements needed
- 50-69:  Fair — will be filtered by many ATS systems, needs work
- 0-49:   Poor — major issues, likely filtered before human review
"""


def build_ats_user_prompt(resume_json: dict, jd_text: str | None) -> str:
    contact = resume_json.get("contact", {})
    skills = resume_json.get("skills", [])
    experience = resume_json.get("experience", [])

    # Build condensed experience text
    exp_text = ""
    for exp in experience[:5]:  # limit to avoid token overflow
        exp_text += f"\n- {exp.get('title', '')} at {exp.get('company', '')}"
        for bullet in exp.get("bullets", [])[:4]:
            exp_text += f"\n  • {bullet}"

    prompt = f"""Analyze this resume for ATS compatibility.

RESUME SKILLS: {", ".join(skills[:30])}

RESUME EXPERIENCE:{exp_text}

RESUME SECTIONS PRESENT: {list(resume_json.keys())}
"""

    if jd_text:
        prompt += f"""
JOB DESCRIPTION:
{jd_text[:2000]}

Compare the resume against this job description and identify missing keywords.
"""
    else:
        prompt += "\nNo job description provided. Analyze for general ATS best practices."

    prompt += "\n\nRespond with JSON only."
    return prompt
