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


def build_ats_user_prompt(
    resume_json: dict,
    jd_text: str | None = None,
    target_role: str | None = None,
    demanded_skills: str | None = None,
) -> str:
    contact = resume_json.get("contact", {})
    summary = resume_json.get("summary", "")
    skills = resume_json.get("skills", [])
    experience = resume_json.get("experience", [])
    projects = resume_json.get("projects", [])
    education = resume_json.get("education", [])
    certifications = resume_json.get("certifications", [])

    # Build detailed experience text
    exp_text = ""
    for exp in experience[:8]:
        title = exp.get("title", "")
        company = exp.get("company", "")
        start = exp.get("start", "")
        end = exp.get("end", "")
        exp_text += f"\n- Title: {title} | Company: {company} | Dates: {start} - {end}"
        for bullet in exp.get("bullets", [])[:8]:
            exp_text += f"\n  • {bullet}"

    # Build projects text
    proj_text = ""
    for proj in projects[:5]:
        name = proj.get("name", "")
        desc = proj.get("description", "")
        proj_text += f"\n- Project: {name} | {desc}"
        for bullet in proj.get("bullets", [])[:5]:
            proj_text += f"\n  • {bullet}"

    # Build education text
    edu_text = ""
    for edu in education:
        degree = edu.get("degree", "")
        field = edu.get("field", "")
        inst = edu.get("institution", "") or edu.get("school", "")
        gpa = edu.get("gpa", "")
        start = edu.get("start", "")
        end = edu.get("end", "")
        edu_text += f"\n- Degree: {degree} {field} | Institution: {inst} | GPA: {gpa} | Dates: {start}-{end}"

    prompt = f"""Analyze this resume for ATS (Applicant Tracking System) compatibility.

TARGET JOB ROLE: {target_role or "Software Engineer / Tech Professional"}
DEMANDED SKILLS: {demanded_skills or "Not specified"}

CANDIDATE CONTACT DETAILS:
- Name: {contact.get('name', '')}
- Email: {contact.get('email', '')}
- Phone: {contact.get('phone', '')}
- Location: {contact.get('location', '')}
- LinkedIn: {contact.get('linkedin', '')}
- GitHub: {contact.get('github', '')}

RESUME SUMMARY: {summary}

RESUME SKILLS: {", ".join(skills)}

RESUME CERTIFICATIONS: {", ".join(certifications)}

RESUME EXPERIENCE:{exp_text}

RESUME PROJECTS:{proj_text}

RESUME EDUCATION:{edu_text}

RESUME SECTIONS PRESENT: {list(resume_json.keys())}
"""

    if jd_text:
        prompt += f"""
JOB DESCRIPTION:
{jd_text[:3000]}

Compare the resume against this job description and identify missing keywords, match density, formatting risks, and actionable ATS score improvements.
"""
    else:
        prompt += "\nNo job description provided. Analyze for general ATS best practices, section formatting, contact detail completeness, and keyword density for the target role."

    prompt += "\n\nRespond with valid JSON following the schema exactly."
    return prompt

