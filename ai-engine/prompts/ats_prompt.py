ATS_SYSTEM_PROMPT = """You are an enterprise-grade AI Applicant Tracking System (ATS) and Senior Technical Recruiter.
You analyze resumes for general ATS compatibility, parsing quality, structural completeness, and formatting standards without requiring a specific job role or job description.

You ALWAYS respond with valid JSON only. No preamble, no markdown, no explanation outside the JSON.

Your response schema:
{
  "mode": "universal_ats",
  "score": <integer 0-100, overall ATS readiness score>,
  "pass": <boolean — true if score >= 70>,
  "parsing_accuracy": <integer 0-100>,
  "file_compatibility": {
    "status": "compatible|risk",
    "parsing_confidence": <integer 0-100>,
    "risks": [<list of potential file/layout risks>]
  },
  "contact_validation": {
    "score": <integer 0-100>,
    "present_fields": [<list of contact fields found>],
    "missing_fields": [<list of missing contact fields>],
    "issues": [<list of link/format issues>]
  },
  "structure_ratings": {
    "summary": "excellent|good|average|weak|missing",
    "experience": "excellent|good|average|weak|missing",
    "skills": "excellent|good|average|weak|missing",
    "education": "excellent|good|average|weak|missing",
    "projects": "excellent|good|average|weak|missing"
  },
  "missing_keywords": [<list of general industry-standard keywords missing>],
  "found_keywords": [<list of technical and professional keywords found>],
  "format_issues": [<list of formatting or structural problems that hurt ATS parsing>],
  "improvements": [<3-5 specific, actionable improvement suggestions>],
  "keyword_density": <float — ratio of industry keywords found>
}
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

    prompt = f"""Perform a Universal AI ATS Resume Analysis (No Job Role Required).

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
TARGET JOB ROLE: {target_role or "Software Engineer / Tech Professional"}
DEMANDED SKILLS: {demanded_skills or "Not specified"}

JOB DESCRIPTION:
{jd_text[:3000]}

Compare the resume against this job description and identify missing keywords, match density, formatting risks, and actionable ATS score improvements.
"""
    else:
        prompt += "\nMODE: Universal ATS Assessment (No Job Description). Evaluate overall ATS parseability, contact completeness, formatting risks, structure ratings, and general keyword density."

    prompt += "\n\nRespond with valid JSON following the schema exactly."
    return prompt

