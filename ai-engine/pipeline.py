"""
pipeline.py - Phase 1 + Phase 2 orchestrator
"""
from ai_engine.analyzers.ats_analyzer import analyze_ats
from ai_engine.analyzers.section_grader import grade_sections
from ai_engine.analyzers.tone_analyzer import analyze_tone
from ai_engine.analyzers.persona_analyzer import analyze_personas
from ai_engine.analyzers.skill_checker import check_skills
from ai_engine.analyzers.audit_analyzer import analyze_audit
from ai_engine.generators.bullet_rewriter import rewrite_bullets
from ai_engine.generators.interview_predictor import predict_interview_questions
from ai_engine.generators.career_predictor import predict_career_trajectory
from ai_engine.generators.salary_estimator import estimate_salary
from ai_engine.generators.cultural_adapter import adapt_for_country


def run_full_pipeline(resume_json: dict, jd_text=None, user_plan="free", target_role=None, demanded_skills=None) -> dict:
    role = target_role or "Software Engineer"

    results: dict = {}
    results["ats"]       = analyze_ats(resume_json, jd_text, role, demanded_skills)
    results["sections"]  = grade_sections(resume_json)
    results["bullets"]   = rewrite_bullets(resume_json)
    results["audit"]     = analyze_audit(resume_json, jd_text, role, demanded_skills)
    results["tone"]      = analyze_tone(resume_json)
    results["personas"]  = analyze_personas(resume_json)
    results["skills"]    = check_skills(resume_json)
    results["interview"] = predict_interview_questions(resume_json)
    
    # Career, Salary, and Global Employability Forecasts
    results["career"]    = predict_career_trajectory(resume_json)
    results["salary"]    = estimate_salary(resume_json, role, "Remote (US)")
    results["global_employability"] = adapt_for_country(resume_json, "United States")

    results["overall_score"] = _compute_overall_score(results)
    return results


def _compute_overall_score(results: dict) -> dict:
    scores = []
    ats_score = results.get("ats", {}).get("score", 0)
    if ats_score: scores.append(ats_score)
    
    audit_score = results.get("audit", {}).get("score", 0)
    if audit_score: scores.append(audit_score)
    
    sec_scores = results.get("sections", {})
    if sec_scores:
        vals = [v.get("score", 0) for v in sec_scores.values() if isinstance(v, dict) and "score" in v]
        if vals: scores.append(sum(vals) / len(vals))
        
    tone_score = results.get("tone", {}).get("confidence_score", 0)
    if tone_score: scores.append(tone_score)
    
    overall = round(sum(scores) / len(scores)) if scores else 0
    return {
        "score": overall,
        "grade": _score_to_grade(overall),
        "breakdown": {
            "ats":     results.get("ats", {}).get("score", 0),
            "content": sec_scores.get("experience", {}).get("score", 0) if sec_scores else 0,
            "tone":    tone_score,
            "audit":   audit_score,
        },
    }


def _score_to_grade(s):
    if s >= 90: return "A+"
    if s >= 85: return "A"
    if s >= 80: return "A-"
    if s >= 75: return "B+"
    if s >= 70: return "B"
    if s >= 65: return "B-"
    if s >= 60: return "C+"
    if s >= 55: return "C"
    return "D"

