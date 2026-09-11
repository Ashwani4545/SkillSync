"""
career_intelligence_engine.py

The single, unified entry point that replaces the old fragmented pipeline
(ai_engine/pipeline.py calling 11 independent, narrowly-scoped analyzers
with no shared context). Per the spec: "Do not optimize individual
features independently... all features must use a shared understanding
of the candidate."

One Claude call, one system prompt (career_intelligence_system_prompt.py),
one coherent output covering the candidate profile, evidence graph, ATS
readiness, job match, career positioning, career pathway, target role
analysis, career readiness, skill gaps, roadmap, bullet rewrites, JD
adaptation, interview prediction, persona analysis, benchmarking, career
gap analysis, global employability, and prioritized actions — exactly the
27-section structure in the spec.
"""
import os
import re

from ai_engine.career_intelligence_system_prompt import CAREER_INTELLIGENCE_SYSTEM_PROMPT
from ai_engine.json_utils import safe_parse_llm_json
from ai_engine.llm_client import call_claude_raw

# Every top-level key the spec's output schema requires — used to fill in
# any key the model's response omits, so a genuinely partial LLM response
# degrades to "empty section" rather than a missing key breaking every
# downstream consumer (frontend, tests, other services) that expects it.
REQUIRED_TOP_LEVEL_KEYS = [
    "candidate_profile", "evidence_graph", "resume_analysis", "universal_ats",
    "job_match", "career_positioning", "target_role", "career_readiness",
    "skill_gaps", "career_path", "career_roadmap", "bullet_rewrites",
    "jd_adapter", "interview_prediction", "benchmark", "career_gap_analysis",
    "global_employability", "persona_analysis", "priority_actions",
    "confidence", "warnings",
]


def _empty_default_for(key: str):
    """Section 27's schema uses lists for some top-level keys, dicts for others."""
    list_keys = {"evidence_graph", "bullet_rewrites", "priority_actions", "warnings"}
    return [] if key in list_keys else {}


def build_user_prompt(
    resume_json: dict,
    target_role: str = None,
    jd_text: str = None,
    benchmark_context: dict = None,
) -> str:
    """
    Passes the resume through close to as-is — the spec explicitly says
    "never fabricate," which means the model needs the actual structured
    data, not a lossy summary of it.
    """
    parts = [f"CANDIDATE RESUME (structured, as parsed):\n{resume_json}"]

    if target_role:
        parts.append(f"\nTARGET ROLE: {target_role}")
    else:
        parts.append(
            "\nNo target role was specified. Still populate career_positioning's "
            "best_fit_roles/secondary_roles/stretch_roles from the candidate's evidence. "
            "Leave target_role's fields as MISSING/empty rather than inventing a role."
        )

    if jd_text:
        parts.append(f"\nJOB DESCRIPTION (perform job-specific matching against this):\n{jd_text}")
    else:
        parts.append(
            "\nNo job description was provided. Set job_match.job_match_score to null "
            "and leave its lists empty — only calculate universal_ats in that case."
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


def run_career_intelligence(
    resume_json: dict,
    target_role: str = None,
    jd_text: str = None,
    benchmark_context: dict = None,
) -> dict:
    """
    The single call that replaces the old run_full_pipeline()'s 11 separate
    analyzer calls. Returns the full structure from the spec's section 27,
    with any key the model omitted filled in as an empty default (see
    REQUIRED_TOP_LEVEL_KEYS) so downstream code can rely on every key
    existing even when the model under-delivers on one section.
    """
    user_prompt = build_user_prompt(resume_json, target_role, jd_text, benchmark_context)

    use_mock_llm = (
        os.environ.get("USE_MOCK_LLM", "").lower() == "true"
        or (
            not os.environ.get("ANTHROPIC_API_KEY")
            and os.environ.get("ENVIRONMENT", "development") == "development"
        )
    )
    if use_mock_llm:
        raw_response = _generate_mock_response(resume_json, target_role, jd_text, benchmark_context)
    else:
        raw_response = call_claude_raw(
            system=CAREER_INTELLIGENCE_SYSTEM_PROMPT,
            user=user_prompt,
            max_tokens=8000,
            temperature=0.2,
        )

    result = safe_parse_llm_json(raw_response, fallback={})

    for key in REQUIRED_TOP_LEVEL_KEYS:
        if key not in result:
            result.setdefault("warnings", [])
            if isinstance(result["warnings"], list):
                result["warnings"].append(f"Model response was missing '{key}' — filled with empty default.")
            result[key] = _empty_default_for(key)

    return result


# ── Mock generator (USE_MOCK_LLM=true) ──────────────────────────────────
# Deliberately its own function, NOT routed through llm_client.py's
# _generate_smart_mock_response() keyword-dispatcher — this system prompt
# contains section headers ("BULLET REWRITER", "BENCHMARKING", "PERSONA
# ANALYSIS", "AUDIT"...) that would collide with that dispatcher's
# `"bullet" in system_lower` / `"benchmark" in system_lower` style checks
# and silently return a completely unrelated mock shape. Computes real
# signals from the actual resume (quantification rate, skill evidence via
# keyword matching, career level from experience count) rather than
# returning a static stub, so tests can assert meaningful behavior.

def _generate_mock_response(resume_json, target_role, jd_text, benchmark_context) -> str:
    import json

    identity = resume_json.get("contact", {})
    experience = resume_json.get("experience", [])
    projects = resume_json.get("projects", [])
    skills = resume_json.get("skills", [])
    education = resume_json.get("education", [])
    bullets = [b for e in experience for b in e.get("bullets", [])]
    quantified = sum(1 for b in bullets if any(c.isdigit() for c in b))
    quant_rate = int(100 * quantified / max(len(bullets), 1)) if bullets else 0

    all_text = " ".join(bullets + [p.get("name", "") + " " + " ".join(p.get("bullets", [])) for p in projects]).lower()
    summary_text = resume_json.get("summary", "").lower()
    evidence_graph = []
    for skill in skills:
        skill_l = skill.lower()
        if skill_l in all_text:
            evidence_graph.append({"skill": skill, "status": "EVIDENCED", "evidence_sources": ["experience_or_projects"], "strength": "HIGH"})
        elif skill_l in summary_text:
            evidence_graph.append({"skill": skill, "status": "PARTIALLY_EVIDENCED", "evidence_sources": ["summary"], "strength": "MEDIUM"})
        else:
            evidence_graph.append({"skill": skill, "status": "UNSUPPORTED", "evidence_sources": [], "strength": "LOW"})

    evidenced_count = sum(1 for e in evidence_graph if e["status"] == "EVIDENCED")
    evidence_rate = int(100 * evidenced_count / max(len(skills), 1)) if skills else 0

    years_estimate = len(experience)
    if years_estimate == 0:
        career_level = "Entry-level"
    elif years_estimate <= 1:
        career_level = "Junior"
    elif years_estimate <= 3:
        career_level = "Mid-level"
    else:
        career_level = "Senior"

    universal_ats_score = min(97, max(40, 55 + quant_rate // 4 + (10 if identity.get("linkedin") else 0) + (10 if identity.get("github") else 0)))

    job_match = {"job_match_score": None, "matched": [], "partially_matched": [], "missing": [], "not_evidenced": []}
    if jd_text:
        jd_lower = jd_text.lower()
        matched = [s for s in skills if s.lower() in jd_lower]
        missing_from_resume = [w for w in re.findall(r"\b[A-Z][a-zA-Z0-9+.#]{2,}\b", jd_text) if w.lower() not in [s.lower() for s in skills]][:5]
        job_match = {
            "job_match_score": min(96, max(35, 50 + len(matched) * 6)),
            "matched": matched,
            "partially_matched": [],
            "missing": missing_from_resume,
            "not_evidenced": [],
        }

    target_role_name = target_role or (experience[0]["title"] if experience else "Software Engineer")

    benchmark = {"available": False, "candidate_score": None, "benchmark_score": None, "strongest_areas": [], "weakest_areas": [], "gap_to_benchmark": None, "source_label": None, "limitations": "No benchmark dataset ingested for this role/industry yet."}
    if benchmark_context and benchmark_context.get("matched_against"):
        benchmark = {
            "available": True,
            "candidate_score": quant_rate,
            "benchmark_score": benchmark_context.get("avg_quant_rate", 70),
            "strongest_areas": ["Skills breadth"],
            "weakest_areas": ["Quantification"] if quant_rate < 60 else [],
            "gap_to_benchmark": benchmark_context.get("avg_quant_rate", 70) - quant_rate,
            "source_label": f"{benchmark_context['matched_against']} similar real resumes",
            "limitations": "Structural-statistics comparison, not a full content re-analysis.",
        }

    bullet_rewrites = []
    for b in bullets[:5]:
        if not any(c.isdigit() for c in b):
            bullet_rewrites.append({
                "current_bullet": b,
                "problem": "Describes a responsibility without a measurable outcome.",
                "missing_element": "Quantified result or scale",
                "improved_version": b.rstrip(".") + ", achieving [ADD ACTUAL METRIC].",
                "why_better": "Gives the reader a concrete measure of impact instead of just an activity.",
            })

    response = {
        "candidate_profile": {
            "identity": {
                "name": identity.get("name"), "location": identity.get("location"),
                "email": identity.get("email"), "phone": identity.get("phone"),
                "linkedin": identity.get("linkedin"), "github": identity.get("github"),
                "portfolio": identity.get("portfolio"),
            },
            "education": education,
            "experience": experience,
            "projects": projects,
            "skills": {"languages": skills, "frameworks": [], "databases": [], "cloud": [], "devops": [], "ai_ml": [], "soft_skills": [], "domain_skills": []},
            "certifications": [{"certification": c, "issuer": "NOT EVIDENCED", "date": "NOT EVIDENCED"} for c in resume_json.get("certifications", [])],
            "achievements": [],
            "career_level": {"level": career_level, "confidence": "MEDIUM"},
        },
        "evidence_graph": evidence_graph,
        "resume_analysis": {
            "parsing": "Resume parsed into standard sections without errors.",
            "structure": "Standard reverse-chronological structure detected.",
            "formatting": "No tables, columns, or embedded graphics detected.",
            "readability": "Clear" if bullets else "Limited — few experience bullets to assess.",
            "grammar": "No major issues detected in mock analysis.",
            "bullet_quality": f"{quant_rate}% of bullets are quantified.",
            "quantification": f"{quantified}/{len(bullets)} bullets contain a number or metric.",
            "contact_info_issues": [] if identity.get("email") else ["Email not found in contact section."],
            "date_consistency": "Consistent" if experience else "NOT EVIDENCED — no experience entries to check.",
            "redundancy": [],
            "keyword_discoverability": f"{evidence_rate}% of listed skills have supporting evidence elsewhere in the resume.",
        },
        "universal_ats": {
            "universal_ats_score": universal_ats_score,
            "explanation": f"Base score reflects standard structure; quantification ({quant_rate}%) and "
                            f"presence of LinkedIn/GitHub links adjusted the score.",
            "issues": [] if universal_ats_score > 70 else ["Low quantification rate reduces ATS content scoring."],
        },
        "job_match": job_match,
        "career_positioning": {
            "current_level": career_level,
            "current_role": experience[0]["title"] if experience else "NOT EVIDENCED",
            "strongest_skills": [e["skill"] for e in evidence_graph if e["status"] == "EVIDENCED"][:5],
            "verified_skills": [e["skill"] for e in evidence_graph if e["status"] == "EVIDENCED"],
            "transferable_skills": [e["skill"] for e in evidence_graph if e["status"] == "PARTIALLY_EVIDENCED"],
            "weak_areas": [e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"],
            "experience_gaps": [] if experience else ["No experience entries found on resume."],
            "skill_gaps": [e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"],
            "market_positioning": f"{career_level} candidate with {evidence_rate}% of claimed skills backed by evidence.",
            "best_fit_roles": [{
                "role": target_role_name, "match_score": universal_ats_score,
                "why_it_fits": "Skills and experience overlap with role requirements based on available evidence.",
                "evidence": [e["skill"] for e in evidence_graph if e["status"] == "EVIDENCED"][:3],
                "missing_requirements": [e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"][:3],
                "difficulty": "Moderate", "preparation": "Strengthen evidence for unsupported skills.",
            }],
            "secondary_roles": [], "stretch_roles": [],
        },
        "target_role": {
            "role_profile": {
                "responsibilities": [], "required_skills": [], "preferred_skills": [],
                "seniority": career_level, "technologies": skills[:8], "expected_experience": "NOT EVIDENCED",
                "relevant_projects": [p.get("name") for p in projects], "soft_skills": [],
                "interview_topics": [], "resume_expectations": [],
            },
            "strengths": [e["skill"] for e in evidence_graph if e["status"] == "EVIDENCED"][:5],
            "gaps": [e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"],
            "risks": [] if evidence_rate > 60 else ["Several claimed skills lack supporting evidence."],
            "readiness": "HIGH" if evidence_rate > 70 else "MEDIUM" if evidence_rate > 40 else "LOW",
            "recommended_actions": ["Add project or work evidence for unsupported skills."] if evidence_rate < 100 else [],
        },
        "career_readiness": {
            "resume_ats_readiness": universal_ats_score,
            "job_match": job_match["job_match_score"],
            "skill_readiness": evidence_rate,
            "experience_readiness": min(95, len(experience) * 25 + 20),
            "overall_career_readiness": round((universal_ats_score + evidence_rate + min(95, len(experience) * 25 + 20)) / 3),
            "explanation": "Computed as an average of ATS readiness, skill evidence rate, and experience depth.",
        },
        "skill_gaps": {
            "current_verified_skills": [e["skill"] for e in evidence_graph if e["status"] == "EVIDENCED"],
            "required_skills": skills,
            "missing_skills": [],
            "partially_developed_skills": [e["skill"] for e in evidence_graph if e["status"] == "PARTIALLY_EVIDENCED"],
            "priority_skills": [
                {"skill": e["skill"], "priority": "HIGH", "reason": "Claimed on resume but no supporting evidence found."}
                for e in evidence_graph if e["status"] == "UNSUPPORTED"
            ][:5],
        },
        "career_path": {
            "steps": [
                {"stage": "Current", "role": experience[0]["title"] if experience else career_level,
                 "why_this_step": "Reflects current verified position.", "whats_missing": "N/A", "what_to_do": "N/A"},
                {"stage": "Next", "role": target_role_name,
                 "why_this_step": "Builds directly on current verified skills and experience.",
                 "whats_missing": ", ".join([e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"][:3]) or "None identified",
                 "what_to_do": "Add project/work evidence for gap skills; tailor resume to target role."},
            ]
        },
        "career_roadmap": {
            "0_30_days": {"skills_to_learn": [e["skill"] for e in evidence_graph if e["status"] == "UNSUPPORTED"][:2],
                          "projects_to_build": [], "resume_changes": ["Quantify remaining unquantified bullets."],
                          "interview_prep": [], "certifications": [], "portfolio_improvements": [], "application_strategy": ""},
            "31_60_days": {}, "61_90_days": {}, "3_6_months": {}, "6_12_months": {}, "1_3_years": {},
        },
        "bullet_rewrites": bullet_rewrites,
        "jd_adapter": {
            "keywords_to_incorporate": job_match["missing"] if jd_text else [],
            "relevant_experience": [], "skills_to_emphasize": job_match["matched"] if jd_text else [],
            "bullets_to_rewrite": [], "sections_needing_improvement": [],
            "cannot_truthfully_claim": job_match["missing"] if jd_text else [],
        },
        "interview_prediction": {
            "questions": [
                {"question": f"Can you walk me through your experience with {e['skill']}?",
                 "why_this_question": "Listed as a skill but not clearly backed by a project or role.",
                 "resume_trigger": "Skills section", "high_risk": True}
                for e in evidence_graph if e["status"] == "UNSUPPORTED"
            ][:5],
        },
        "benchmark": benchmark,
        "career_gap_analysis": {"gaps": []},
        "global_employability": {"transferable": None, "considerations": [], "location_specific_notes": []},
        "persona_analysis": {
            "ats": {"score": universal_ats_score, "strengths": ["Standard structure"] if universal_ats_score > 70 else [],
                    "concerns": [] if universal_ats_score > 70 else ["Low quantification"], "evidence": [], "recommendations": []},
            "hr_recruiter": {"score": min(95, evidence_rate + 10), "strengths": [], "concerns": [], "evidence": [], "recommendations": []},
            "hiring_manager": {"score": evidence_rate, "strengths": [], "concerns": [], "evidence": [], "recommendations": []},
        },
        "priority_actions": [
            {"priority": "HIGH", "problem": f"{e['skill']} is listed but not evidenced.",
             "evidence": f"'{e['skill']}' appears in Skills but not in experience or project bullets.",
             "why_it_matters": "Unsupported skills are the first thing a recruiter or interviewer will probe.",
             "what_to_do": f"If you have genuinely used {e['skill']}, add the relevant project or experience evidence.",
             "expected_impact": "Improves hiring manager persona score and reduces interview risk."}
            for e in evidence_graph if e["status"] == "UNSUPPORTED"
        ][:5],
        "confidence": {"overall": "MEDIUM", "notes": ["Generated in mock mode — a real Claude call reasons more deeply over context."]},
        "warnings": [],
    }

    return json.dumps(response)
