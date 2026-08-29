"""
cultural_adapter.py
Adapts a resume's format, length, tone, and content norms for a specific country.
Covers structural differences (US vs German CV vs Japanese rirekisho vs UK).

Phase 4 feature — Career plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude

# Country-specific resume norms database
COUNTRY_NORMS = {
    "United States": {
        "length":      "1 page for <10 yrs, 2 pages max",
        "photo":       "Never include",
        "dob":         "Never include",
        "objective":   "Replace with professional summary",
        "references":  "Do not list; say 'Available upon request'",
        "tone":        "Achievement-focused, quantified results, active verbs",
        "sections":    ["Contact", "Summary", "Experience", "Education", "Skills"],
        "avoid":       ["Personal details", "Religion", "Marital status", "Nationality"],
    },
    "Germany": {
        "length":      "2 pages standard; include full Lebenslauf",
        "photo":       "Professional headshot expected",
        "dob":         "Include date of birth",
        "objective":   "Not standard; use profile section",
        "references":  "Include names and contact details",
        "tone":        "Formal, comprehensive, chronological",
        "sections":    ["Contact + Photo", "Personal Details", "Education", "Experience", "Skills", "Interests"],
        "avoid":       ["Gaps without explanation", "Omitting personal details"],
        "extra":       "Include Hochschulabschluss (university degree equivalent) details",
    },
    "United Kingdom": {
        "length":      "2 pages max; 1 page for graduates",
        "photo":       "Not included",
        "dob":         "Not included (illegal to ask)",
        "objective":   "Personal statement at top (3-4 lines)",
        "references":  "'References available on request' at bottom",
        "tone":        "Professional but slightly less formal than US; avoid buzzwords",
        "sections":    ["Contact", "Personal Statement", "Experience", "Education", "Skills", "Interests"],
        "avoid":       ["Salary expectations", "Personal details"],
    },
    "Japan": {
        "length":      "Rirekisho: fixed 1-2 page standardized form",
        "photo":       "Formal passport-style photo, top right",
        "dob":         "Required; age is expected",
        "objective":   "Motivation for applying (志望動機) is a separate required section",
        "references":  "Not typically included",
        "tone":        "Formal, humble, emphasize loyalty and dedication",
        "sections":    ["Personal Details + Photo", "Education (oldest first)", "Employment History", "Certifications", "Motivation Letter"],
        "avoid":       ["Self-promotion", "Job-hopping (explain gaps)"],
        "extra":       "Handwritten rirekisho still preferred for many companies; include hanko seal space",
    },
    "Canada": {
        "length":      "1-2 pages",
        "photo":       "Not included",
        "dob":         "Not included",
        "objective":   "Professional summary preferred",
        "references":  "'Available upon request'",
        "tone":        "Similar to US but slightly more conservative",
        "sections":    ["Contact", "Summary", "Experience", "Education", "Skills"],
        "avoid":       ["Personal details", "Religion", "Ethnicity"],
    },
    "Australia": {
        "length":      "2-3 pages acceptable",
        "photo":       "Not included",
        "dob":         "Not required",
        "objective":   "Career objective or summary at top",
        "references":  "Include 2 references with contact details",
        "tone":        "Friendly, achievement-focused, less formal than UK",
        "sections":    ["Contact", "Career Objective", "Experience", "Education", "Skills", "References"],
        "avoid":       ["Overly formal language"],
    },
    "India": {
        "length":      "2-3 pages common",
        "photo":       "Passport photo on right side",
        "dob":         "Include date of birth",
        "objective":   "Career objective at top is standard",
        "references":  "Include 2 references",
        "tone":        "Formal, comprehensive, include projects section",
        "sections":    ["Contact + Photo", "Objective", "Education", "Experience", "Skills", "Projects", "Personal Details"],
        "avoid":       ["Casual language"],
        "extra":       "Include 12th grade marks for fresh graduates; list competitive exams (GATE, CAT etc.)",
    },
    "France": {
        "length":      "1 page ideally",
        "photo":       "Professional photo common",
        "dob":         "Often included",
        "objective":   "Accroche (hook) at top — 2-3 lines",
        "references":  "Not typically on CV; provide on request",
        "tone":        "Formal, concise, elegant presentation",
        "sections":    ["Contact + Photo", "Accroche", "Experience (most recent first)", "Education", "Skills", "Interests"],
        "avoid":       ["Lengthy objective statements"],
    },
}

ADAPTER_SYSTEM = """You are an expert international resume/CV consultant.
Adapt the provided resume for the target country's hiring culture and norms.

Rules:
- Preserve ALL factual information (dates, companies, titles, achievements)
- Restructure and rewrite to match local conventions
- Add required sections for the target country (e.g. personal details for Germany/Japan)
- Remove sections inappropriate for the target country (e.g. photo for US)
- Adjust tone to match local expectations
- Flag anything the candidate needs to add that you cannot fill in (e.g. actual photo)

Respond ONLY with valid JSON. Schema:
{
  "adapted_resume": {
    "contact":        { ...same fields + country-required additions... },
    "summary":        "<adapted to local tone>",
    "experience":     [ ...same format, rewritten to local style... ],
    "education":      [ ...same format... ],
    "skills":         [ ...same list, reordered if needed... ],
    "certifications": [],
    "projects":       [],
    "additional_sections": {
      "<section_name>": "<content>"
    }
  },
  "changes_made": ["<change 1>", "<change 2>"],
  "must_add_manually": ["<item the candidate must provide, e.g. photo, date of birth>"],
  "length_recommendation": "<e.g. This resume should be 2 pages for Germany>",
  "format_tips": ["<tip specific to target country>"]
}"""


def adapt_for_country(resume_json: dict, target_country: str) -> dict:
    """Adapt resume format and tone for a specific country."""
    norms = COUNTRY_NORMS.get(target_country, {})
    norms_text = json.dumps(norms, indent=2) if norms else f"Standard professional norms for {target_country}"

    contact = resume_json.get("contact", {})
    exp_text = "\n".join(
        f"- {e.get('title')} at {e.get('company')} ({e.get('start')}–{e.get('end')})\n"
        + "\n".join(f"  • {b}" for b in e.get("bullets", [])[:4])
        for e in resume_json.get("experience", [])[:5]
    )

    user_prompt = f"""Adapt this resume for the {target_country} job market.

TARGET COUNTRY: {target_country}
COUNTRY NORMS: {norms_text}

CURRENT RESUME:
Name: {contact.get('name', 'Candidate')}
Summary: {resume_json.get('summary', '')[:400]}
Experience:
{exp_text}
Skills: {', '.join(resume_json.get('skills', [])[:20])}
Education: {', '.join(e.get('degree','') + ' at ' + e.get('institution','') for e in resume_json.get('education', [])[:2])}

Restructure and rewrite to match {target_country} hiring conventions.
Respond with JSON only."""

    response = call_claude(
        system=ADAPTER_SYSTEM,
        user=user_prompt,
        max_tokens=2500,
        temperature=0.2,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        result = json.loads(m.group(1)) if m else {"error": "parse_failed", "adapted_resume": {}}

    result["target_country"] = target_country
    result["country_norms"]  = norms
    return result


def list_supported_countries() -> list[str]:
    return sorted(COUNTRY_NORMS.keys())
