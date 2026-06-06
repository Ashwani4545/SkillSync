"""
bias_scanner.py
Scans resume text for language that may trigger unconscious bias in human reviewers:
  - Gendered words and phrases
  - Age-signalling language
  - Ability-normative phrases
  - Cultural / geographic markers that may disadvantage candidates
  - Class / prestige signifiers

Phase 4 feature — Career plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude

BIAS_SYSTEM = """You are a diversity and inclusion expert who reviews resumes for
language that may trigger unconscious bias in human reviewers.

You NEVER fabricate findings. Only flag things actually present in the resume text.
You are not censoring — you are helping candidates present themselves to the widest
possible audience of reviewers.

Respond ONLY with valid JSON. Schema:
{
  "overall_bias_score": <integer 0-100, where 100 = zero bias, 0 = heavily biased>,
  "bias_categories": {
    "gendered":     { "found": <bool>, "count": <int>, "severity": "none|low|medium|high" },
    "age_signalling":{ "found": <bool>, "count": <int>, "severity": "none|low|medium|high" },
    "ability":      { "found": <bool>, "count": <int>, "severity": "none|low|medium|high" },
    "prestige":     { "found": <bool>, "count": <int>, "severity": "none|low|medium|high" }
  },
  "flagged_phrases": [
    {
      "phrase":    "<exact phrase from resume>",
      "category":  "gendered|age_signalling|ability|prestige|cultural",
      "severity":  "low|medium|high",
      "why":       "<brief explanation of why this may trigger bias>",
      "neutral_alternative": "<suggested replacement>",
      "section":   "summary|experience|skills|education|other"
    }
  ],
  "positive_signals": ["<inclusive language or phrasing the resume already uses well>"],
  "summary": "<2-3 sentence overall assessment>",
  "priority_fixes": ["<most impactful change 1>", "<change 2>", "<change 3>"]
}

Scoring: 90-100 = excellent, 70-89 = good, 50-69 = needs attention, below 50 = significant issues."""


# Pre-built phrase dictionaries for fast pre-scan before LLM
GENDERED_WORDS = [
    "manpower", "man-hours", "mankind", "chairman", "manmade",
    "salesman", "saleswoman", "businessman", "businesswoman",
    "he is", "she is", "his role", "her role", "guys",
    "ninja", "rockstar", "guru", "wizard", "superhero",
    "dominant", "aggressive", "nurturing", "collaborative spirit",
]

AGE_SIGNALS = [
    "over 20 years", "over 25 years", "over 30 years",
    "since 1990", "since 1995", "since 1985", "since 1980",
    "veteran of", "seasoned professional", "long career",
    "digital native", "millennial", "gen z", "gen x",
    "young professional", "recent graduate",
]

ABILITY_PHRASES = [
    "able-bodied", "stand for long periods",
    "normal", "healthy", "physically fit",
]


def scan_for_bias(resume_json: dict) -> dict:
    """Scan resume for biased language and return detailed findings."""
    # Build full text corpus
    parts = []
    if resume_json.get("summary"):
        parts.append(f"SUMMARY: {resume_json['summary']}")

    for exp in resume_json.get("experience", []):
        parts.append(f"ROLE: {exp.get('title', '')} at {exp.get('company', '')}")
        parts.extend(exp.get("bullets", []))

    skills_text = ", ".join(resume_json.get("skills", []))
    if skills_text:
        parts.append(f"SKILLS: {skills_text}")

    for edu in resume_json.get("education", []):
        parts.append(f"EDUCATION: {edu.get('degree', '')} at {edu.get('institution', '')}")

    full_text = "\n".join(parts)

    # Pre-scan for known phrases (fast, no LLM)
    pre_findings = _pre_scan(full_text)

    user_prompt = f"""Scan this resume text for potentially biased language.

RESUME TEXT:
{full_text[:3000]}

Pre-scan detected these potential issues: {pre_findings}

Identify ALL instances of gendered language, age-signalling, ability-normative phrases,
and prestige markers. Provide neutral alternatives for each.

Respond with JSON only."""

    response = call_claude(
        system=BIAS_SYSTEM,
        user=user_prompt,
        max_tokens=1500,
        temperature=0.2,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        result = json.loads(m.group(1)) if m else {
            "overall_bias_score": 75,
            "flagged_phrases": [],
            "error": "parse_failed",
        }

    result["pre_scan_findings"] = pre_findings
    return result


def _pre_scan(text: str) -> dict:
    """Fast regex pre-scan — no LLM needed."""
    text_lower = text.lower()
    return {
        "gendered":      [w for w in GENDERED_WORDS    if w in text_lower],
        "age_signalling":[w for w in AGE_SIGNALS       if w in text_lower],
        "ability":       [w for w in ABILITY_PHRASES   if w in text_lower],
    }
