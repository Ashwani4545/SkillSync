"""
bullet_rewriter.py
Rewrites weak resume bullets into action-verb + metric + outcome format.
Returns original and rewritten versions for each bullet.
"""
import json
from ai_engine.llm_client import call_claude

BULLET_SYSTEM = """You are a professional resume writer. Rewrite weak resume bullets.

Formula: Strong Action Verb + What You Did + Measurable Result/Impact

Rules:
- Start with a powerful past-tense action verb (Led, Built, Increased, Reduced, etc.)
- Include a metric whenever possible (%, $, time saved, users, scale)
- Keep it under 20 words
- Never use "responsible for", "helped", "assisted", "worked on"

Respond ONLY with valid JSON. Schema:
{
  "rewrites": [
    {
      "original": "<original bullet>",
      "rewritten": "<improved bullet>",
      "improvement_type": "added_metric|stronger_verb|clearer_impact|all",
      "score_before": <0-100>,
      "score_after": <0-100>
    }
  ]
}"""


def rewrite_bullets(resume_json: dict) -> dict:
    """Rewrite up to 10 weakest bullets from the resume."""
    experience = resume_json.get("experience", [])

    all_bullets = []
    for exp in experience:
        for bullet in exp.get("bullets", []):
            all_bullets.append({
                "bullet": bullet,
                "company": exp.get("company", ""),
                "title": exp.get("title", ""),
            })

    # Pick up to 10 bullets to rewrite
    bullets_to_rewrite = all_bullets[:10]

    if not bullets_to_rewrite:
        return {"rewrites": [], "note": "No bullets found to rewrite"}

    bullet_text = "\n".join(
        f"{i+1}. [{b['title']} at {b['company']}] {b['bullet']}"
        for i, b in enumerate(bullets_to_rewrite)
    )

    user_prompt = f"""Rewrite these resume bullets to be more powerful and impactful.

BULLETS TO REWRITE:
{bullet_text}

For each bullet, provide the original and an improved version following the formula.
Respond with JSON only."""

    response = call_claude(system=BULLET_SYSTEM, user=user_prompt, max_tokens=2000)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            return json.loads(match.group(1))
        return {"rewrites": [], "error": "Parse failed"}
