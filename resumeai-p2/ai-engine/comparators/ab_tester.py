"""
ab_tester.py
Compares two resume versions against the same criteria and optionally
against a specific job description. Returns a winner with detailed reasoning.

Phase 2 feature — Pro plan and above.
"""
import json, re
from ai_engine.llm_client import call_claude
from ai_engine.analyzers.ats_analyzer import analyze_ats
from ai_engine.analyzers.section_grader import grade_sections
from ai_engine.analyzers.tone_analyzer import analyze_tone

AB_SYSTEM = """You are a senior career coach comparing two resume versions.
Evaluate both objectively and determine which is stronger for the target role.

Respond ONLY with valid JSON. Schema:
{
  "winner": "A" | "B" | "tie",
  "confidence": "high" | "medium" | "low",
  "overall_scores": { "A": <0-100>, "B": <0-100> },
  "dimension_scores": {
    "ats_match":    { "A": <0-100>, "B": <0-100>, "winner": "A"|"B"|"tie" },
    "content":      { "A": <0-100>, "B": <0-100>, "winner": "A"|"B"|"tie" },
    "tone":         { "A": <0-100>, "B": <0-100>, "winner": "A"|"B"|"tie" },
    "relevance":    { "A": <0-100>, "B": <0-100>, "winner": "A"|"B"|"tie" },
    "readability":  { "A": <0-100>, "B": <0-100>, "winner": "A"|"B"|"tie" }
  },
  "winner_strengths": ["<why the winner is better>"],
  "loser_issues": ["<what the losing version does worse>"],
  "recommendation": "<1-2 sentence actionable advice>",
  "best_of_both": ["<elements from the losing version worth keeping>"]
}"""


def compare_resumes(
    resume_a: dict,
    resume_b: dict,
    jd_text: str | None = None,
) -> dict:
    """
    Full A/B comparison. Runs quick scores then asks Claude for holistic verdict.
    """
    # Run parallel scoring on both resumes
    scores_a = _quick_score(resume_a, jd_text)
    scores_b = _quick_score(resume_b, jd_text)

    # Build compact summaries for Claude
    summary_a = _resume_summary(resume_a, "A")
    summary_b = _resume_summary(resume_b, "B")

    user_prompt = f"""Compare these two resumes and declare a winner.

RESUME A:
{summary_a}
Pre-computed scores — ATS: {scores_a["ats"]}, Sections avg: {scores_a["sections_avg"]}, Tone: {scores_a["tone"]}

RESUME B:
{summary_b}
Pre-computed scores — ATS: {scores_b["ats"]}, Sections avg: {scores_b["sections_avg"]}, Tone: {scores_b["tone"]}

{"JOB DESCRIPTION:\n" + jd_text[:1500] if jd_text else "No job description provided — evaluate general quality."}

Respond with JSON only."""

    response = call_claude(
        system=AB_SYSTEM,
        user=user_prompt,
        max_tokens=1200,
        temperature=0.2,
    )

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        match = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        if match:
            result = json.loads(match.group(1))
        else:
            result = {
                "winner": "tie",
                "confidence": "low",
                "error": "Parse failed",
                "overall_scores": {"A": scores_a["ats"], "B": scores_b["ats"]},
            }

    # Attach raw scores
    result["raw_scores"] = {"A": scores_a, "B": scores_b}
    return result


def _quick_score(resume: dict, jd_text: str | None) -> dict:
    """Fast scoring without full LLM calls — uses pre-computed heuristics."""
    skills = resume.get("skills", [])
    experience = resume.get("experience", [])
    bullets = [b for exp in experience for b in exp.get("bullets", [])]
    summary = resume.get("summary", "")

    # ATS heuristic
    ats_score = 50
    if skills:       ats_score += 15
    if summary:      ats_score += 10
    if experience:   ats_score += 15
    if len(bullets) >= 8: ats_score += 10

    # JD keyword match
    if jd_text and skills:
        jd_lower = jd_text.lower()
        matched = sum(1 for s in skills if s.lower() in jd_lower)
        ats_score = min(100, ats_score + int((matched / max(len(skills), 1)) * 20))

    # Sections average
    section_scores = []
    if summary:      section_scores.append(min(100, 50 + len(summary.split()) * 2))
    if experience:   section_scores.append(min(100, 40 + len(bullets) * 4))
    if skills:       section_scores.append(min(100, 40 + len(skills) * 2))
    sections_avg = int(sum(section_scores) / len(section_scores)) if section_scores else 0

    # Tone heuristic
    from ai_engine.analyzers.tone_analyzer import WEAK_PHRASES
    all_text = summary + " " + " ".join(bullets)
    weak_count = sum(1 for p in WEAK_PHRASES if p in all_text.lower())
    tone = max(30, 85 - weak_count * 8)

    return {"ats": ats_score, "sections_avg": sections_avg, "tone": tone}


def _resume_summary(resume: dict, label: str) -> str:
    contact = resume.get("contact", {})
    exp = resume.get("experience", [])
    skills = resume.get("skills", [])
    bullets = [b for e in exp for b in e.get("bullets", [])][:8]

    return f"""[Resume {label}]
Summary: {resume.get("summary", "")[:250]}
Experience entries: {len(exp)}
Skills listed: {len(skills)} — {", ".join(skills[:10])}
Sample bullets:
{chr(10).join(f"  • {b}" for b in bullets)}"""
