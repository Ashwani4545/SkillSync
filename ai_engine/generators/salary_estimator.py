"""
salary_estimator.py
Estimates market salary range based on resume strength, role, location,
years of experience, and skills. Uses Claude + scraped market context.

Phase 3 feature — Career plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude

SALARY_SYSTEM = """You are a compensation specialist with deep knowledge of
tech and professional services salaries across global markets.
Your estimates are based on current market data (2024-2025).

Respond ONLY with valid JSON. Schema:
{
  "base_salary": {
    "low":    <integer USD annual>,
    "mid":    <integer USD annual>,
    "high":   <integer USD annual>,
    "currency": "USD"
  },
  "total_compensation": {
    "low":  <integer — base + typical bonus + equity>,
    "mid":  <integer>,
    "high": <integer>
  },
  "percentile_position": <integer 1-99, where this candidate sits in the market>,
  "location_multipliers": {
    "San Francisco": <float e.g. 1.4>,
    "New York":      <float>,
    "Austin":        <float>,
    "Remote (US)":   <float>,
    "London":        <float>,
    "Bangalore":     <float>
  },
  "factors_boosting_salary":  ["<factor increasing their market value>"],
  "factors_limiting_salary":  ["<gap suppressing their earning potential>"],
  "negotiation_tips": ["<specific tip for this candidate>"],
  "market_trend": "rising|stable|declining",
  "market_trend_reason": "<why the market is moving this way for this role>"
}
Base salary in USD for the primary/default location provided."""


def estimate_salary(
    resume_json: dict,
    target_role: str,
    location: str = "Remote (US)",
) -> dict:
    """Estimate salary range for a candidate targeting a specific role."""
    experience = resume_json.get("experience", [])
    skills     = resume_json.get("skills", [])
    education  = resume_json.get("education", [])

    # Count approximate years of experience
    years = len(experience) * 1.5  # rough heuristic

    # Build bullet highlights
    bullets = []
    for exp in experience[:3]:
        bullets.extend(exp.get("bullets", [])[:2])

    edu_level = "unknown"
    if education:
        deg = education[0].get("degree", "").lower()
        if any(x in deg for x in ["phd", "ph.d", "doctorate"]): edu_level = "PhD"
        elif any(x in deg for x in ["master", "m.s", "mba", "m.a", "m.tech"]): edu_level = "Masters"
        elif any(x in deg for x in ["bachelor", "b.s", "b.a", "b.tech"]): edu_level = "Bachelors"
        else: edu_level = "Other"

    user_prompt = f"""Estimate the salary range for this candidate.

TARGET ROLE: {target_role}
TARGET LOCATION: {location}

CANDIDATE PROFILE:
- Approximate years experience: {years:.0f}
- Education: {edu_level}
- Skills: {', '.join(skills[:20])}
- Notable achievements:
{chr(10).join(f'  • {b}' for b in bullets[:6])}
- Current/most recent title: {experience[0].get('title', 'Unknown') if experience else 'Unknown'}
- Companies worked at: {', '.join(e.get('company','') for e in experience[:3])}

Provide realistic 2025 market salary data. Include location multipliers for major cities.

Respond with JSON only."""

    response = call_claude(
        system=SALARY_SYSTEM,
        user=user_prompt,
        max_tokens=1200,
        temperature=0.2,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if m:
            result = json.loads(m.group(1))
        else:
            return {"error": "Parse failed"}

    result["target_role"]     = target_role
    result["default_location"] = location
    return result
