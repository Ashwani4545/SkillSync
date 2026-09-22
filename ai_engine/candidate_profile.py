"""
candidate_profile.py

Builds the candidate_profile section deterministically from the already-
parsed resume JSON — no LLM call. This is the fix for the root cause
behind the "Experience: 0 / Projects: 0" inconsistency: the previous
design asked the LLM to re-generate/echo the entire candidate profile as
part of an already-large JSON response, so on a dense resume (12 jobs, 12
projects, 31 skills) the response could exceed max_tokens, truncate, fail
to parse, and fall back to an empty structure — even though the actual
parsed data was sitting in the database the whole time. Since this data
already exists in resume_json, there was never a reason to ask the LLM to
produce it again.
"""
import re
from datetime import datetime

MONTH_TO_NUM = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _extract_year(date_str: str) -> int | None:
    if not date_str:
        return None
    if re.match(r"present|current", date_str, re.IGNORECASE):
        return datetime.utcnow().year
    match = re.search(r"\d{4}", date_str)
    return int(match.group(0)) if match else None


def estimate_career_level(experience: list[dict]) -> dict:
    """
    Deterministic career-level estimate. Prefers actual parsed dates; falls
    back to counting entries only when no usable dates exist, and says so
    via `confidence` — spec Problem 11 explicitly warns against confident-
    sounding career-level claims the evidence doesn't support.
    """
    if not experience:
        return {"level": "Entry-level", "confidence": "LOW", "years_estimated": 0, "basis": "No experience entries found on resume."}

    year_spans = []
    for exp in experience:
        start_year = _extract_year(exp.get("start", ""))
        end_year = _extract_year(exp.get("end", ""))
        if start_year and end_year and end_year >= start_year:
            year_spans.append(end_year - start_year)

    if year_spans:
        total_years = sum(year_spans)
        confidence = "HIGH"
        basis = f"Computed from parsed employment dates across {len(year_spans)} of {len(experience)} entries."
    else:
        # No parseable dates — fall back to a crude per-entry estimate, but
        # say plainly that this is a weaker inference, not a measurement.
        total_years = len(experience) * 1.5
        confidence = "LOW"
        basis = "No parseable employment dates found — estimated from entry count only."

    if total_years < 1:
        level = "Entry-level"
    elif total_years < 2:
        level = "Junior"
    elif total_years < 5:
        level = "Mid-level"
    elif total_years < 9:
        level = "Senior"
    else:
        level = "Lead"

    return {"level": level, "confidence": confidence, "years_estimated": round(total_years, 1), "basis": basis}


def build_candidate_profile(resume_json: dict) -> dict:
    """Pure transformation of resume_json into the candidate_profile schema
    shape — every field traceable directly back to parsed resume content,
    nothing inferred or generated."""
    identity = resume_json.get("contact", {})
    experience = resume_json.get("experience", [])
    projects = resume_json.get("projects", [])
    education = resume_json.get("education", [])
    certifications = resume_json.get("certifications", [])
    career_level = estimate_career_level(experience)

    return {
        "identity": {
            "name": identity.get("name"),
            "location": identity.get("location"),
            "email": identity.get("email"),
            "phone": identity.get("phone"),
            "linkedin": identity.get("linkedin"),
            "github": identity.get("github"),
            "portfolio": identity.get("portfolio"),
        },
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": [
            {"certification": c, "issuer": "NOT EVIDENCED", "date": "NOT EVIDENCED"} if isinstance(c, str) else c
            for c in certifications
        ],
        "achievements": resume_json.get("achievements", []),
        "career_level": {"level": career_level["level"], "confidence": career_level["confidence"]},
        "career_level_basis": career_level["basis"],  # extra transparency beyond the spec's minimum schema
    }
