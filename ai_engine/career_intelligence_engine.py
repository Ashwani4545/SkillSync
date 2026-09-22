"""
career_intelligence_engine.py

The single, unified entry point for resume analysis. Rebuilt (round 2) to
follow the spec's actual architecture principle:

    Facts -> algorithms -> evidence -> LLM reasoning -> explanation

NOT:

    Resume -> LLM -> everything

candidate_profile, evidence_graph, proof_coverage, and claims are now
computed deterministically in Python (candidate_profile.py,
evidence_engine.py) BEFORE any LLM call, and passed to the model as
established ground truth rather than something it has to (re)produce. This
fixes two real problems at once:

1. The LLM's JSON response no longer needs to echo the entire resume back
   (candidate_profile) on top of doing 20 sections of reasoning — on a
   dense resume (12 jobs, 12 projects, 31 skills) that combined output
   could exceed max_tokens, truncate, fail to parse, and silently fall
   back to an empty result (the "Experience: 0" bug). The facts that
   matter most now can't be lost to LLM truncation, because they were
   never the LLM's job to produce.
2. Evidence classification (EVIDENCED / PARTIALLY_EVIDENCED / UNSUPPORTED)
   is now a deterministic pattern-match against real resume text, not an
   LLM opinion — same resume in, same evidence graph out, every time.
"""
import os

from ai_engine.career_intelligence_system_prompt import CAREER_INTELLIGENCE_SYSTEM_PROMPT
from ai_engine.json_utils import safe_parse_llm_json
from ai_engine.llm_client import call_claude_raw
from ai_engine.candidate_profile import build_candidate_profile
from ai_engine.evidence_engine import build_evidence_graph, compute_proof_coverage, extract_claims
from ai_engine.schemas import CareerIntelligenceReport

# Sections the LLM is actually responsible for generating. candidate_profile,
# evidence_graph, proof_coverage, and claims are deliberately NOT in this
# list — they're computed deterministically and merged in afterward.
LLM_SECTION_KEYS = [
    "resume_analysis", "ats_readiness", "job_match", "career_positioning",
    "target_role", "career_readiness", "skill_gaps", "career_path",
    "career_roadmap", "bullet_rewrites", "jd_adapter", "interview_prediction",
    "benchmark", "career_gap_analysis", "global_employability",
    "persona_analysis", "priority_actions", "confidence", "warnings",
]


def _empty_default_for(key: str):
    list_keys = {"bullet_rewrites", "priority_actions", "warnings"}
    return [] if key in list_keys else {}


def build_user_prompt(
    candidate_profile: dict,
    evidence_graph: list,
    proof_coverage: dict,
    claims: list,
    target_role: str = None,
    jd_text: str = None,
    benchmark_context: dict = None,
) -> str:
    parts = [
        f"CANDIDATE PROFILE (already extracted — do not regenerate):\n{candidate_profile}",
        f"\nEVIDENCE GRAPH (already computed — treat as ground truth):\n{evidence_graph}",
        f"\nPROOF COVERAGE:\n{proof_coverage}",
        f"\nCLAIMS (every experience/project bullet, already extracted):\n{claims}",
    ]

    if target_role:
        parts.append(f"\nTARGET ROLE: {target_role}")
    else:
        parts.append(
            "\nNo target role was specified. Still populate career_positioning's "
            "best_fit_roles/secondary_roles/stretch_roles from the evidence graph given. "
            "Leave target_role's fields as MISSING/empty rather than inventing a role."
        )

    if jd_text:
        parts.append(f"\nJOB DESCRIPTION (perform job-specific matching against this):\n{jd_text}")
    else:
        parts.append(
            "\nNo job description was provided. Set job_match.job_match_score to null "
            "and leave its lists empty — only calculate ats_readiness in that case."
        )

    if benchmark_context and benchmark_context.get("matched_against"):
        parts.append(
            f"\nBENCHMARK DATA: measured against {benchmark_context['matched_against']} "
            f"similar real resumes for this role/industry (not simulated). "
            f"{benchmark_context.get('summary', '')}"
        )
    else:
        parts.append(
            "\nNo real benchmark dataset is available for this role/industry. "
            "Set benchmark.available to false and do not fabricate a percentile claim."
        )

    return "\n".join(parts)


def _deterministic_experience_readiness(candidate_profile: dict) -> int:
    years = candidate_profile.get("career_level", {})
    # career_level_basis carries years_estimated implicitly via estimate_career_level;
    # recompute the bound here directly from experience count/duration for a stable score.
    experience = candidate_profile.get("experience", [])
    if not experience:
        return 20
    return min(95, 20 + len(experience) * 15)


def run_career_intelligence(
    resume_json: dict,
    target_role: str = None,
    jd_text: str = None,
    benchmark_context: dict = None,
) -> dict:
    # ── Step 1: deterministic facts, computed once, no LLM involved ──
    candidate_profile = build_candidate_profile(resume_json)
    evidence_graph = build_evidence_graph(resume_json)
    proof_coverage = compute_proof_coverage(evidence_graph)
    claims = extract_claims(resume_json)

    # ── Step 2: LLM call — reasoning sections only ──
    user_prompt = build_user_prompt(
        candidate_profile, evidence_graph, proof_coverage, claims,
        target_role, jd_text, benchmark_context,
    )

    if os.environ.get("USE_MOCK_LLM", "").lower() == "true":
        raw_response = _generate_mock_response(
            candidate_profile, evidence_graph, proof_coverage, claims, target_role, jd_text, benchmark_context,
        )
    else:
        raw_response = call_claude_raw(
            system=CAREER_INTELLIGENCE_SYSTEM_PROMPT,
            user=user_prompt,
            max_tokens=6000,  # lower than before — no longer echoing the whole resume back
            temperature=0.2,
        )

    llm_result = safe_parse_llm_json(raw_response, fallback={})

    warnings = []
    for key in LLM_SECTION_KEYS:
        if key not in llm_result:
            warnings.append(f"Model response was missing '{key}' — filled with empty default.")
            llm_result[key] = _empty_default_for(key)

    # ── Step 3: merge — deterministic facts always win, can't be
    # overwritten by a truncated/malformed LLM response ──
    result = {
        "candidate_profile": candidate_profile,
        "evidence_graph": evidence_graph,
        "proof_coverage": proof_coverage,
        "claims": claims,
        **llm_result,
    }
    if warnings:
        result.setdefault("warnings", [])
        result["warnings"] = list(result.get("warnings") or []) + warnings

    # ── Step 4: deterministic scoring override — skill_readiness and
    # experience_readiness are arithmetic, not LLM judgment calls (spec
    # Problem 21). overall_career_readiness is recomputed as their actual
    # average so it can never silently disagree with its own components
    # (spec Problem 23: score consistency). ──
    cr = result.get("career_readiness") or {}
    skill_readiness = proof_coverage.get("proof_coverage_pct") if proof_coverage.get("proof_coverage_pct") is not None else 0
    experience_readiness = _deterministic_experience_readiness(candidate_profile)
    resume_ats_readiness = (result.get("ats_readiness") or {}).get("ats_readiness_score", 0)
    job_match_score = (result.get("job_match") or {}).get("job_match_score")

    components = [resume_ats_readiness, skill_readiness, experience_readiness]
    overall = round(sum(components) / len(components))

    result["career_readiness"] = {
        **cr,
        "resume_ats_readiness": resume_ats_readiness,
        "job_match": job_match_score,
        "skill_readiness": skill_readiness,
        "experience_readiness": experience_readiness,
        "overall_career_readiness": overall,
        "explanation": cr.get("explanation") or (
            f"Average of ATS readiness ({resume_ats_readiness}), skill evidence coverage "
            f"({skill_readiness}%, from the evidence graph), and experience depth ({experience_readiness})."
        ),
    }

    # ── Step 5: validate against the schema; a validation failure degrades
    # to a warning, never a crash — the deterministic sections are correct
    # regardless of whether the LLM's reasoning sections validate cleanly ──
    try:
        CareerIntelligenceReport.model_validate(result)
    except Exception as validation_error:
        result.setdefault("warnings", [])
        result["warnings"].append(f"Output failed schema validation: {validation_error}")

    return result


# ── Mock generator (USE_MOCK_LLM=true) ──────────────────────────────────
# Only needs to produce the LLM's reasoning sections now — candidate_profile
# and evidence_graph are ALWAYS real (computed deterministically above),
# even in mock mode. Still self-contained, not routed through
# llm_client.py's keyword-dispatch mock, for the same collision reasons as
# before (this prompt's section headers overlap old dispatcher keywords).

def _generate_mock_response(candidate_profile, evidence_graph, proof_coverage, claims, target_role, jd_text, benchmark_context) -> str:
    import json

    experience = candidate_profile.get("experience", [])
    projects = candidate_profile.get("projects", [])
    skills_evidenced = [e["canonical_name"] for e in evidence_graph if e["status"] == "EVIDENCED"]
    skills_unsupported = [e["canonical_name"] for e in evidence_graph if e["status"] == "UNSUPPORTED"]
    quant_claims = [c for c in claims if c["claim_type"] == "quantified_achievement"]
    unquant_claims = [c for c in claims if c["claim_type"] == "unquantified_statement"]

    # proof_coverage_pct is explicitly None (not just missing) when there are
    # no skills at all — dict.get(key, default) does NOT apply the default
    # when the key exists with value None, so every use below must guard
    # against None explicitly rather than relying on .get()'s default.
    proof_pct = proof_coverage.get("proof_coverage_pct")
    proof_pct = proof_pct if proof_pct is not None else 0

    ats_score = min(97, max(40, 55 + proof_pct // 4
                             + (10 if candidate_profile["identity"].get("linkedin") else 0)
                             + (10 if candidate_profile["identity"].get("github") else 0)))

    job_match = {"job_match_score": None, "matched": [], "partially_matched": [], "missing": [], "not_evidenced": []}
    if jd_text:
        jd_lower = jd_text.lower()
        matched = [s for s in skills_evidenced if s.lower() in jd_lower]
        job_match = {
            "job_match_score": min(96, max(35, 50 + len(matched) * 6)),
            "matched": matched, "partially_matched": [], "missing": [], "not_evidenced": [],
        }

    target_role_name = target_role or (experience[0]["title"] if experience else "Software Engineer")

    bullet_rewrites = [
        {
            "current_bullet": c["claim"],
            "problem": "Describes a responsibility without a measurable outcome.",
            "missing_element": "Quantified result or scale",
            "improved_version": c["claim"].rstrip(".") + ", achieving [ADD ACTUAL METRIC].",
            "why_better": "Gives the reader a concrete measure of impact instead of just an activity.",
        }
        for c in unquant_claims[:5]
    ]

    interview_questions = [
        {
            "question": f"Can you walk me through your experience with {skill}?",
            "why_this_question": "Listed as a skill but the evidence graph shows no supporting project or experience bullet.",
            "resume_trigger": "Skills section",
            "high_risk": True,
            "source_claim": None,
        }
        for skill in skills_unsupported[:5]
    ]

    response = {
        "resume_analysis": {
            "parsing": "Resume parsed into standard sections without errors.",
            "structure": "Standard reverse-chronological structure detected.",
            "formatting": "No tables, columns, or embedded graphics detected.",
            "readability": "Clear" if claims else "Limited — few bullets to assess.",
            "grammar": "No major issues detected in mock analysis.",
            "bullet_quality": f"{len(quant_claims)}/{len(claims)} bullets are quantified." if claims else "No bullets found.",
            "quantification": f"{len(quant_claims)} of {len(claims)} claims include a specific metric.",
            "contact_info_issues": [] if candidate_profile["identity"].get("email") else ["Email not found in contact section."],
            "date_consistency": "Consistent" if experience else "NOT EVIDENCED — no experience entries to check.",
            "redundancy": [],
            "keyword_discoverability": f"{proof_pct}% proof coverage across claimed skills.",
        },
        "ats_readiness": {
            "ats_readiness_score": ats_score,
            "explanation": f"Base score reflects standard structure; proof coverage "
                            f"({proof_pct}%) and presence of LinkedIn/GitHub links adjusted the score.",
            "issues": [] if ats_score > 70 else ["Low proof coverage reduces ATS content scoring."],
        },
        "job_match": job_match,
        "career_positioning": {
            "current_level": candidate_profile["career_level"]["level"],
            "current_role": experience[0]["title"] if experience else "NOT EVIDENCED",
            "strongest_skills": skills_evidenced[:5],
            "verified_skills": skills_evidenced,
            "transferable_skills": [e["canonical_name"] for e in evidence_graph if e["status"] == "PARTIALLY_EVIDENCED"],
            "weak_areas": skills_unsupported,
            "experience_gaps": [] if experience else ["No experience entries found on resume."],
            "skill_gaps": skills_unsupported,
            "market_positioning": f"{candidate_profile['career_level']['level']} candidate with "
                                   f"{proof_pct}% proof coverage.",
            "best_fit_roles": [{
                "role": target_role_name, "match_score": ats_score,
                "why_it_fits": "Skills and experience overlap with role requirements based on the evidence graph.",
                "evidence": skills_evidenced[:3], "missing_requirements": skills_unsupported[:3],
                "difficulty": "Moderate", "preparation": "Strengthen evidence for unsupported skills.",
            }],
            "secondary_roles": [], "stretch_roles": [],
        },
        "target_role": {
            "role_profile": {
                "responsibilities": [], "required_skills": [], "preferred_skills": [],
                "seniority": candidate_profile["career_level"]["level"],
                "technologies": skills_evidenced[:8], "expected_experience": "NOT EVIDENCED",
                "relevant_projects": [p.get("name") for p in projects], "soft_skills": [],
                "interview_topics": [], "resume_expectations": [],
            },
            "strengths": skills_evidenced[:5], "gaps": skills_unsupported,
            "risks": [] if proof_pct > 60 else ["Several claimed skills lack supporting evidence."],
            "readiness": "HIGH" if proof_pct > 70 else "MEDIUM" if proof_pct > 40 else "LOW",
            "recommended_actions": ["Add project or work evidence for unsupported skills."] if skills_unsupported else [],
        },
        "career_readiness": {  # overridden deterministically afterward, but keep a plausible value here too
            "resume_ats_readiness": ats_score, "job_match": job_match["job_match_score"],
            "skill_readiness": proof_pct,
            "experience_readiness": min(95, len(experience) * 15 + 20),
            "overall_career_readiness": 0, "explanation": "",
        },
        "skill_gaps": {
            "current_verified_skills": skills_evidenced, "required_skills": [e["canonical_name"] for e in evidence_graph],
            "missing_skills": [], "partially_developed_skills": [e["canonical_name"] for e in evidence_graph if e["status"] == "PARTIALLY_EVIDENCED"],
            "priority_skills": [{"skill": s, "priority": "HIGH", "reason": "Claimed on resume but no supporting evidence found."} for s in skills_unsupported[:5]],
        },
        "career_path": {
            "steps": [
                {"stage": "Current", "role": experience[0]["title"] if experience else candidate_profile["career_level"]["level"],
                 "why_this_step": "Reflects current verified position.", "whats_missing": "N/A", "what_to_do": "N/A"},
                {"stage": "Next", "role": target_role_name,
                 "why_this_step": "Builds directly on current verified skills and experience.",
                 "whats_missing": ", ".join(skills_unsupported[:3]) or "None identified",
                 "what_to_do": "Add project/work evidence for gap skills; tailor resume to target role."},
            ]
        },
        "career_roadmap": {
            "0_30_days": {"skills_to_learn": skills_unsupported[:2], "projects_to_build": [],
                          "resume_changes": ["Quantify remaining unquantified bullets."],
                          "interview_prep": [], "certifications": [], "portfolio_improvements": [], "application_strategy": ""},
            "31_60_days": {}, "61_90_days": {}, "3_6_months": {}, "6_12_months": {}, "1_3_years": {},
        },
        "bullet_rewrites": bullet_rewrites,
        "jd_adapter": {
            "keywords_to_incorporate": [], "relevant_experience": [], "skills_to_emphasize": job_match["matched"] if jd_text else [],
            "bullets_to_rewrite": [], "sections_needing_improvement": [], "cannot_truthfully_claim": [],
        },
        "interview_prediction": {"questions": interview_questions},
        "benchmark": {"available": False, "candidate_score": None, "benchmark_score": None, "strongest_areas": [], "weakest_areas": [],
                      "gap_to_benchmark": None, "source_label": None, "limitations": "No benchmark dataset ingested for this role/industry yet."},
        "career_gap_analysis": {"gaps": []},
        "global_employability": {"transferable": None, "considerations": [], "location_specific_notes": []},
        "persona_analysis": {
            "ats": {"score": ats_score, "strengths": ["Standard structure"] if ats_score > 70 else [],
                    "concerns": [] if ats_score > 70 else ["Low proof coverage"], "evidence": [], "recommendations": []},
            "hr_recruiter": {"score": min(95, len(skills_evidenced) * 10 + 10), "strengths": [], "concerns": [], "evidence": [], "recommendations": []},
            "hiring_manager": {"score": proof_pct, "strengths": [], "concerns": [], "evidence": [], "recommendations": []},
        },
        "priority_actions": [
            {"priority": "HIGH", "problem": f"{s} is listed but not evidenced.",
             "evidence": f"'{s}' appears in Skills but not in any project or experience bullet.",
             "why_it_matters": "Unsupported skills are the first thing a recruiter or interviewer will probe.",
             "what_to_do": f"If you have genuinely used {s}, add the relevant project or experience evidence.",
             "expected_impact": "Improves hiring manager persona score and reduces interview risk."}
            for s in skills_unsupported[:5]
        ],
        "confidence": {"overall": "MEDIUM", "notes": ["Generated in mock mode — a real Claude call reasons more deeply over context."]},
        "warnings": [],
    }

    return json.dumps(response)
