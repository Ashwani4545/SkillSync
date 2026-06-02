"""
tone_analyzer.py
Detects passive language, filler phrases, hedging, and weak word choices.
Returns a confidence score per section and rewrite suggestions.
"""
import json, re
from ai_engine.llm_client import call_claude

WEAK_PHRASES = [
    "responsible for", "helped with", "assisted in", "worked on",
    "involved in", "participated in", "contributed to", "tasked with",
    "was part of", "supported", "tried to", "attempted to",
    "basically", "kind of", "sort of", "might have", "could have",
]

TONE_SYSTEM = """You are an expert resume writing coach specializing in confident, 
powerful language. Analyze resume text for weak, passive, and hedging language.

Respond ONLY with valid JSON. Schema:
{
  "confidence_score": <integer 0-100, overall confidence level>,
  "grade": "<A/B/C/D>",
  "passive_phrases": [
    {"phrase": "<original phrase>", "section": "<experience|summary|skills>", "fix": "<stronger version>"}
  ],
  "filler_words": ["<word or phrase that adds no value>"],
  "tone_by_section": {
    "summary": {"score": <0-100>, "notes": "<brief note>"},
    "experience": {"score": <0-100>, "notes": "<brief note>"},
    "skills": {"score": <0-100>, "notes": "<brief note>"}
  },
  "top_improvements": ["<most impactful change 1>", "<change 2>", "<change 3>"]
}"""


def analyze_tone(resume_json: dict) -> dict:
    summary = resume_json.get("summary", "")
    experience = resume_json.get("experience", [])

    all_bullets = []
    for exp in experience[:5]:
        all_bullets.extend(exp.get("bullets", [])[:4])

    # Pre-flag weak phrases (fast, no LLM needed)
    pre_flagged = _pre_flag_weak_phrases(
        summary + " " + " ".join(all_bullets)
    )

    user_prompt = f"""Analyze this resume for tone and confidence level.

SUMMARY:
{summary[:500]}

EXPERIENCE BULLETS (sample):
{chr(10).join(f'• {b}' for b in all_bullets[:15])}

Pre-flagged weak phrases found: {pre_flagged}

Respond with JSON only."""

    response = call_claude(system=TONE_SYSTEM, user=user_prompt, max_tokens=1200)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re as _re
        match = _re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"confidence_score": 0, "error": "Parse failed"}


def _pre_flag_weak_phrases(text: str) -> list[str]:
    """Quick regex scan for known weak phrases before calling LLM."""
    found = []
    text_lower = text.lower()
    for phrase in WEAK_PHRASES:
        if phrase in text_lower:
            found.append(phrase)
    return found
