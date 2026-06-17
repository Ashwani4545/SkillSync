"""
audit_analyzer.py
Performs a detailed 13-to-15 point audit of the CV:
1. CV Parsing (section extraction)
2. Spelling & grammar checks
3. Quantify impact
4. Word repetition
5. Bullet points formatting & punctuation consistency
6. Essential sections verification
7. Contact info check
8. Section ordering check
9. Design layout check
10. Email address syntax, header links, and file name check
11. Date formats and heading links check
12. Credibility / skill-to-experience verification
13. Risk analysis (interview risk, benchmarking, ageism/date bias, gaps, career progression, leadership signals).
"""
import json
from ai_engine.llm_client import call_claude

AUDIT_SYSTEM_PROMPT = """You are a senior executive resume auditor and career consultant.
You perform a deep, comprehensive audit of a candidate's CV/resume against a target job role and demanded skills, evaluating it across 13 major dimensions.

CRITICAL INSTRUCTIONS FOR ANALYSIS QUALITY:
1. spelling_grammar: Perform a thorough spelling and grammar check of the entire resume. Explicitly call out tech capitalization typos (e.g., lowercase 'react' should be 'React', 'nodejs' should be 'Node.js').
2. quantify_impact: Count the exact number of bullets containing metrics (%, $, scale, users, etc.). Calculate the percentage of quantified bullets. Identify specific bullets that lack numbers/metrics, and provide tailored rephrasing suggestions for those exact bullets in the 'tips' list.
3. repetitions: Perform frequency counts on words to find overused buzzwords or action verbs (e.g. 'developed', 'worked', 'managed'). Also detect consecutive bullets that start with the exact same verb or phrase.
4. credibility_verification: Cross-reference listed technical skills against experience bullets. List any technical skill in the skills block that is not backed up or mentioned anywhere in the work history or projects descriptions as a credibility warning.
5. risk_benchmarking_gaps: Parse employment dates, calculate the gaps between consecutive roles in months, and record them. Check if the resume contains dates or graduation years older than 15 years (age bias risk).

You ALWAYS respond with valid JSON only. No preamble, no markdown, no explanation outside the JSON.

Your response schema MUST be EXACTLY:
{
  "score": <integer 0-100>,
  "parsing": {
    "status": "pass" | "warning" | "fail",
    "details": "<summary of parsed structure>"
  },
  "spelling_grammar": {
    "status": "pass" | "warning" | "fail",
    "error_count": <int>,
    "errors": [<list of spelling/grammar mistakes found, or empty>]
  },
  "quantify_impact": {
    "status": "pass" | "warning" | "fail",
    "quantified_percentage": <int 0-100>,
    "issues": [<list of bullets lacking metrics/numbers, or empty>],
    "tips": [<specific advice on how to quantify bullet achievements>]
  },
  "repetitions": {
    "status": "pass" | "warning" | "fail",
    "repeated_words": [{"word": "<word>", "count": <int>, "severity": "low"|"medium"|"high"}],
    "bullet_start_repetitions": [{"phrase": "<phrase>", "count": <int>}]
  },
  "bullets_consistency": {
    "status": "pass" | "warning" | "fail",
    "punctuation_consistent": <bool>,
    "length_consistent": <bool>,
    "issues": [<list of bullet inconsistency issues, or empty>]
  },
  "essential_sections": {
    "status": "pass" | "warning" | "fail",
    "present": [<list of present sections>],
    "missing": [<list of missing essential sections>],
    "issues": [<list of section issues, or empty>]
  },
  "contact_info": {
    "status": "pass" | "warning" | "fail",
    "email_present": <bool>,
    "phone_present": <bool>,
    "location_present": <bool>,
    "linkedin_present": <bool>,
    "github_present": <bool>,
    "issues": [<list of contact issues, or empty>]
  },
  "section_ordering": {
    "status": "pass" | "warning" | "fail",
    "order": [<list of sections in order>],
    "issues": [<list of ordering issues, or empty>]
  },
  "design_check": {
    "status": "pass" | "warning" | "fail",
    "word_count": <int>,
    "page_length_estimate": <int>,
    "issues": [<list of layout/length/density issues, or empty>]
  },
  "email_header_filename": {
    "status": "pass" | "warning" | "fail",
    "email_valid": <bool>,
    "header_links_clickable": <bool>,
    "filename_valid": <bool>,
    "issues": [<list of email/link/filename issues, or empty>]
  },
  "dates_links_headings": {
    "status": "pass" | "warning" | "fail",
    "date_format_consistent": <bool>,
    "headings_have_links": <bool>,
    "issues": [<list of issues with dates or heading links, or empty>]
  },
  "credibility_verification": {
    "status": "pass" | "warning" | "fail",
    "issues": [<list of credibility gaps between claimed skills and listed experiences, or empty>],
    "matched_skills": [{"skill": "<skill name>", "evidenced_in": "<job or project name>"}]
  },
  "risk_benchmarking_gaps": {
    "interview_risk": "low" | "medium" | "high",
    "peer_benchmarking_percentile": <int 0-100>,
    "linkedin_match_status": "matched" | "unmatched" | "missing",
    "ageism_date_bias_risk": "low" | "medium" | "high",
    "employment_gaps": [{"start": "<start date>", "end": "<end date>", "duration_months": <int>, "severity": "low"|"moderate"|"severe"}],
    "career_progression": "clear_trajectory" | "stagnant" | "unclear",
    "skill_evidence_score": <int 0-100>,
    "leadership_signals": [<list of leadership terms found, e.g., Led, Managed, Spearheaded>],
    "issues": [<list of risk factors/gap issues, or empty>]
  }
}
"""


def build_audit_user_prompt(
    resume_json: dict,
    jd_text: str | None,
    target_role: str | None,
    demanded_skills: str | None,
) -> str:
    contact = resume_json.get("contact", {})
    skills = resume_json.get("skills", [])
    experience = resume_json.get("experience", [])
    education = resume_json.get("education", [])
    projects = resume_json.get("projects", [])
    certifications = resume_json.get("certifications", [])

    # Build experience text
    exp_text = ""
    for exp in experience[:6]:
        exp_text += f"\n- Title: {exp.get('title', '')} | Company: {exp.get('company', '')} | Dates: {exp.get('start', '')} - {exp.get('end', '')}"
        for bullet in exp.get("bullets", []):
            exp_text += f"\n  • {bullet}"

    # Build education text
    edu_text = ""
    for edu in education:
        edu_text += f"\n- {edu.get('degree', '')} in {edu.get('field', '')} at {edu.get('institution', '')} (GPA: {edu.get('gpa', '')}, Dates: {edu.get('start', '')}-{edu.get('end', '')})"

    # Build projects text
    proj_text = ""
    for proj in projects:
        proj_text += f"\n- Project: {proj.get('name', '')} | {proj.get('description', '')}"
        for bullet in proj.get("bullets", []):
            proj_text += f"\n  • {bullet}"

    prompt = f"""Perform a complete, detailed 13-point audit of this CV.

TARGET JOB ROLE: {target_role or "General Tech/Software Role"}
DEMANDED SKILLS: {demanded_skills or "Not specified"}

CANDIDATE CONTACT DETAILS:
- Name: {contact.get('name', '')}
- Email: {contact.get('email', '')}
- Phone: {contact.get('phone', '')}
- Location: {contact.get('location', '')}
- LinkedIn: {contact.get('linkedin', '')}
- GitHub: {contact.get('github', '')}

RESUME FILENAME: {resume_json.get('filename', 'Resume.pdf')}

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
{jd_text[:2000]}
"""

    prompt += "\n\nRespond with valid JSON following the schema exactly."
    return prompt


def analyze_audit(
    resume_json: dict,
    jd_text: str | None = None,
    target_role: str | None = None,
    demanded_skills: str | None = None,
) -> dict:
    user_prompt = build_audit_user_prompt(resume_json, jd_text, target_role, demanded_skills)

    response_text = call_claude(
        system=AUDIT_SYSTEM_PROMPT,
        user=user_prompt,
        max_tokens=2500,
    )

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Extract JSON from markdown fences if present
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response_text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        return {"score": 0, "error": "Failed to parse Audit response", "raw": response_text}
