"""
bullet_rewriter.py
Rewrites weak resume bullets into action-verb + metric + outcome format.
Returns original and rewritten versions for each bullet.
"""
import json
from ai_engine.llm_client import call_claude
from ai_engine.json_utils import safe_parse_llm_json

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

    return safe_parse_llm_json(response, fallback={"rewrites": [], "error": "Parse failed"})


COMMIT_BULLET_SYSTEM = """You are a professional resume writer. Draft a single resume bullet
point based ONLY on real commit history and repo evidence provided — do not invent
metrics, scale, or outcomes that aren't reasonably inferable from the evidence given.

Formula: Strong Action Verb + What Was Built + Technology Used + Inferred Impact (only if evidence supports it)

Rules:
- Ground every claim in the provided commit messages / repo metadata — if the evidence
  doesn't support a specific number, describe the work qualitatively instead of guessing a metric
- Under 20 words
- Never use "responsible for", "helped", "assisted", "worked on"

Respond ONLY with valid JSON. Schema:
{
  "bullet": "<the drafted bullet>",
  "grounded_in": "<one short phrase citing what evidence it's based on, e.g. '14 commits adding REST endpoints'>",
  "confidence": "high|medium|low"
}"""


def generate_bullet_from_commits(skill: str, repo_name: str, commit_messages: list[str]) -> dict:
    """
    Drafts a resume bullet for `skill` sourced from real commit messages in
    `repo_name`, rather than rewriting resume text the user already wrote.
    Used by the Proof Score flow to offer a replacement for skills flagged
    as "weak" or "unverified" — see backend/app/routers/github.py's
    /proof-score endpoint.
    """
    if not commit_messages:
        return {
            "bullet": None,
            "grounded_in": None,
            "confidence": "low",
            "note": "No commit messages available to draft from.",
        }

    commit_list = "\n".join(f"- {m}" for m in commit_messages[:15])
    user_prompt = f"""Draft one resume bullet demonstrating the skill "{skill}",
based on this real commit history from the repo "{repo_name}":

{commit_list}

Respond with JSON only."""

    response = call_claude(system=COMMIT_BULLET_SYSTEM, user=user_prompt, max_tokens=300)

    return safe_parse_llm_json(response, fallback={"bullet": None, "grounded_in": None, "confidence": "low", "error": "Parse failed"})
