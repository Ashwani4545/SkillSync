"""
benchmark_engine.py
Compares a resume against anonymized top-10% resumes for a specific role
and industry.

Uses REAL vector-similarity comparison (ai_engine/embeddings.py +
backend/app/db/models.BenchmarkResume) when enough ingested benchmark data
exists for the requested role/industry — populated by
backend/scripts/ingest_benchmark_resumes.py. Falls back to LLM simulation
when no real data exists yet for that role (e.g. before you've ingested a
dataset, or for a role with no coverage). The response always includes
`data_source` ("real_benchmark_data" | "simulated") so callers/UI can be
honest about which mode produced the numbers, rather than presenting a
cold-start simulation as if it were measured data.

Phase 2 feature — Career plan and above (also shown in summary to Pro users).
"""
import json, re, os
from ai_engine.json_utils import safe_parse_llm_json
from ai_engine.llm_client import call_claude
from ai_engine.embeddings import embed_resume_text, cosine_similarity, resume_json_to_embeddable_text

MIN_REAL_MATCHES = 5  # below this, real-data percentiles are too noisy to trust — fall back to simulation
TOP_K_NEIGHBORS = 20

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

# Used when real benchmark data IS available — the LLM only writes prose
# (tips/advice), it does not invent the numbers; those come from
# _compute_real_percentiles() below.
BENCHMARK_SYSTEM_GROUNDED = """You are a data-driven career coach. You have been given REAL,
measured statistics comparing this resume against a matched set of top-tier resumes for
this role and industry — do not invent or override any of the numeric values provided.
Your job is only to explain them and give specific, actionable tips.

Respond ONLY with valid JSON. Schema:
{
  "top_gap": "<the single biggest gap vs the matched benchmark set, based on the numbers given>",
  "strengths_vs_benchmark": ["<area where this resume is above the matched benchmark set>"],
  "role_specific_advice": ["<3-5 specific, actionable tips tied to the actual gaps given>"]
}"""


def _percentile_rank(value: int, distribution: list[int]) -> int:
    """% of the distribution that `value` is >= to."""
    if not distribution:
        return 50
    below_or_equal = sum(1 for d in distribution if value >= d)
    return round(100 * below_or_equal / len(distribution))


def _compute_real_percentiles(resume_json: dict, neighbors: list) -> dict:
    """neighbors: list of (BenchmarkResume, similarity) tuples, most similar first."""
    exp = resume_json.get("experience", [])
    skills = resume_json.get("skills", [])
    bullets = [b for e in exp for b in e.get("bullets", [])]
    quantified = sum(1 for b in bullets if any(c.isdigit() for c in b))
    quantification_rate = int(100 * quantified / max(len(bullets), 1)) if bullets else 0

    benchmarks = [n[0] for n in neighbors]
    quant_dist = [b.quantification_rate for b in benchmarks]
    bullet_dist = [b.bullet_count for b in benchmarks]
    skills_dist = [b.skills_count for b in benchmarks]
    exp_dist = [b.experience_entries for b in benchmarks]

    dimensions = {
        "quantification": {
            "user_score": quantification_rate,
            "benchmark_score": round(sum(quant_dist) / len(quant_dist)),
            "gap": round(sum(quant_dist) / len(quant_dist)) - quantification_rate,
            "percentile": _percentile_rank(quantification_rate, quant_dist),
        },
        "bullet_quality": {  # proxy: bullet count (real depth signal from real data)
            "user_score": len(bullets),
            "benchmark_score": round(sum(bullet_dist) / len(bullet_dist)),
            "gap": round(sum(bullet_dist) / len(bullet_dist)) - len(bullets),
            "percentile": _percentile_rank(len(bullets), bullet_dist),
        },
        "skills_relevance": {
            "user_score": len(skills),
            "benchmark_score": round(sum(skills_dist) / len(skills_dist)),
            "gap": round(sum(skills_dist) / len(skills_dist)) - len(skills),
            "percentile": _percentile_rank(len(skills), skills_dist),
        },
        "experience_depth": {
            "user_score": len(exp),
            "benchmark_score": round(sum(exp_dist) / len(exp_dist)),
            "gap": round(sum(exp_dist) / len(exp_dist)) - len(exp),
            "percentile": _percentile_rank(len(exp), exp_dist),
        },
    }

    overall_percentile = round(
        sum(d["percentile"] for d in dimensions.values()) / len(dimensions)
    )

    return {
        "overall_percentile": overall_percentile,
        "dimensions": dimensions,
        "matched_against": len(neighbors),
        "avg_similarity": round(sum(n[1] for n in neighbors) / len(neighbors), 3),
    }


def _find_similar_benchmarks(resume_json: dict, target_role: str, industry: str, db) -> list:
    """Returns [(BenchmarkResume, similarity_score), ...] sorted by similarity desc."""
    from app.db.models import BenchmarkResume

    candidates = (
        db.query(BenchmarkResume)
        .filter(BenchmarkResume.target_role == target_role, BenchmarkResume.industry == industry)
        .all()
    )
    if len(candidates) < MIN_REAL_MATCHES:
        return []

    embeddable_text = resume_json_to_embeddable_text(resume_json)
    user_embedding = embed_resume_text(embeddable_text)

    scored = [(c, cosine_similarity(user_embedding, c.embedding_json)) for c in candidates]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:TOP_K_NEIGHBORS]


def benchmark_resume(
    resume_json: dict,
    target_role: str,
    industry: str = "technology",
    db=None,
) -> dict:
    """
    Compare resume against top-10% benchmark for a role.

    `db`: optional SQLAlchemy session. When provided and enough ingested
    benchmark data exists for (target_role, industry), returns real,
    measured percentiles. Otherwise falls back to the previous LLM-simulated
    behavior. Callers that don't pass `db` always get the simulated path
    (kept for backward compatibility with any code not yet updated to pass it).
    """
    exp = resume_json.get("experience", [])
    skills = resume_json.get("skills", [])
    bullets = [b for e in exp for b in e.get("bullets", [])]
    quantified = sum(1 for b in bullets if any(c.isdigit() for c in b))
    quantification_rate = int((quantified / max(len(bullets), 1)) * 100)

    neighbors = _find_similar_benchmarks(resume_json, target_role, industry, db) if db is not None else []

    if neighbors:
        real_stats = _compute_real_percentiles(resume_json, neighbors)

        grounding_prompt = f"""TARGET ROLE: {target_role}
INDUSTRY: {industry}

MEASURED COMPARISON AGAINST {real_stats['matched_against']} SIMILAR TOP-TIER RESUMES
(avg similarity: {real_stats['avg_similarity']}):
- Overall percentile: {real_stats['overall_percentile']}
- Quantification: you {real_stats['dimensions']['quantification']['user_score']}% vs benchmark avg {real_stats['dimensions']['quantification']['benchmark_score']}%
- Bullet count: you {real_stats['dimensions']['bullet_quality']['user_score']} vs benchmark avg {real_stats['dimensions']['bullet_quality']['benchmark_score']}
- Skills listed: you {real_stats['dimensions']['skills_relevance']['user_score']} vs benchmark avg {real_stats['dimensions']['skills_relevance']['benchmark_score']}
- Experience entries: you {real_stats['dimensions']['experience_depth']['user_score']} vs benchmark avg {real_stats['dimensions']['experience_depth']['benchmark_score']}

SAMPLE BULLETS (first 8):
{chr(10).join(f"• {b}" for b in bullets[:8])}

Respond with JSON only — explain the gaps above, do not restate the numbers as your own invention."""

        response = call_claude(system=BENCHMARK_SYSTEM_GROUNDED, user=grounding_prompt, max_tokens=800, temperature=0.3)
        prose = safe_parse_llm_json(response, fallback={})

        result = {
            "overall_percentile": real_stats["overall_percentile"],
            "dimensions": real_stats["dimensions"],
            "top_gap": prose.get("top_gap"),
            "strengths_vs_benchmark": prose.get("strengths_vs_benchmark", []),
            "role_specific_advice": prose.get("role_specific_advice", []),
            "data_source": "real_benchmark_data",
            "matched_against": real_stats["matched_against"],
        }
        result["target_role"] = target_role
        result["industry"] = industry
        return result

    # ── Fallback: no (or too little) real benchmark data for this role/industry ──
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

    result = safe_parse_llm_json(response, fallback={"overall_percentile": 50, "error": "Parse failed"})

    result["target_role"] = target_role
    result["industry"] = industry
    result["data_source"] = "simulated"
    return result
