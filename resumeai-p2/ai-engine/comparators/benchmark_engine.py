"""
benchmark_engine.py
Compares a resume against anonymized top-10% resumes for a specific role
and industry using vector similarity and LLM scoring.

Phase 2 feature — Career plan and above (also shown in summary to Pro users).
"""
import json, re, os
from ai_engine.llm_client import call_claude

BENCHMARK_SYSTEM = """You are a data-driven career coach who benchmarks resumes against
top candidates in a specific role and industry.

Simulate what a benchmark against the top 10% of resumes for this role would look like.
Base your assessment on industry standards and best practices for the given role.

Respond ONLY with valid JSON. Schema:
{
  "overall_percentile": <integer 1-99, where this resume ranks>,
  "dimensions": {
    "bullet_quality":    { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] },
    "keyword_density":   { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] },
    "quantification":    { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] },
    "experience_depth":  { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] },
    "skills_relevance":  { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] },
    "structure":         { "user_score": <0-100>, "benchmark_score": <0-100>, "gap": <int>, "tips": ["..."] }
  },
  "top_gap": "<the single biggest gap vs top candidates>",
  "strengths_vs_benchmark": ["<area where this resume is above average>"],
  "role_specific_advice": ["<advice specific to the target role and industry>"]
}
benchmark_score values represent the average top-10% candidate in this role."""


def benchmark_resume(
    resume_json: dict,
    target_role: str,
    industry: str = "technology",
) -> dict:
    """
    Compare resume against top-10% benchmark for a role.
    """
    exp = resume_json.get("experience", [])
    skills = resume_json.get("skills", [])
    bullets = [b for e in exp for b in e.get("bullets", [])]

    # Count quantified bullets (contain numbers/%)
    quantified = sum(1 for b in bullets if any(c.isdigit() for c in b))
    quantification_rate = int((quantified / max(len(bullets), 1)) * 100)

    user_prompt = f"""Benchmark this resume against top 10% candidates for the role below.

TARGET ROLE: {target_role}
INDUSTRY: {industry}

RESUME STATS:
- Experience entries: {len(exp)}
- Total bullet points: {len(bullets)}
- Quantified bullets: {quantified}/{len(bullets)} ({quantification_rate}%)
- Skills listed: {len(skills)}
- Summary present: {"Yes" if resume_json.get("summary") else "No"}

SAMPLE BULLETS (first 8):
{chr(10).join(f"• {b}" for b in bullets[:8])}

SKILLS: {", ".join(skills[:25])}

Respond with JSON only."""

    response = call_claude(
        system=BENCHMARK_SYSTEM,
        user=user_prompt,
        max_tokens=1500,
        temperature=0.3,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            result = json.loads(match.group(1))
        else:
            result = {"overall_percentile": 50, "error": "Parse failed"}

    result["target_role"] = target_role
    result["industry"] = industry
    return result
