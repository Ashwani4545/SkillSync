"""
evidence_engine.py

The deterministic core of "evidence-based career intelligence" (spec
Problems 2-5). Builds the evidence graph and proof coverage BEFORE any LLM
call — the LLM then reasons over these already-computed facts instead of
being trusted to classify evidence itself (spec Problem 17: "Facts ->
algorithms -> evidence -> LLM reasoning", not "Resume -> LLM -> everything").

Nothing here calls an LLM. Same resume in -> same evidence graph out,
every time (spec Problem 21: determinism).
"""
import re

from ai_engine.skill_normalizer import normalize_skills

# Evidence level -> (tri-state status for simpler consumers, confidence)
EVIDENCE_LEVEL_META = {
    "DIRECT_IMPLEMENTATION": {"status": "EVIDENCED", "confidence": 0.95},
    "STRONG_MENTION":        {"status": "EVIDENCED", "confidence": 0.80},
    "INDIRECT_EVIDENCE":     {"status": "PARTIALLY_EVIDENCED", "confidence": 0.55},
    "WEAK_MENTION":          {"status": "PARTIALLY_EVIDENCED", "confidence": 0.35},
    "NO_EVIDENCE":           {"status": "UNSUPPORTED", "confidence": 0.0},
}

# Verbs that signal hands-on implementation rather than passive mention —
# "built X using Python" is stronger evidence than "familiar with Python".
IMPLEMENTATION_VERBS = re.compile(
    r"\b(built|build|developed|develop|implemented|implement|created|create|"
    r"designed|design|engineered|engineer|architected|architect|deployed|deploy|"
    r"wrote|write|coded|code|programmed|program|shipped|ship)\b",
    re.IGNORECASE,
)

METRIC_PATTERN = re.compile(r"(\d+(\.\d+)?\s*%|\$\s?\d[\d,]*|\b\d[\d,]*\s*(ms|s|sec|seconds|x|users|requests|records|rows|gb|mb|k|m)\b)", re.IGNORECASE)


def _skill_pattern(canonical_name: str, aliases: list[str]) -> re.Pattern:
    """Word-boundary regex matching the canonical name or any alias."""
    variants = [re.escape(canonical_name)] + [re.escape(a) for a in aliases]
    return re.compile(r"\b(" + "|".join(variants) + r")\b", re.IGNORECASE)


def build_evidence_graph(resume_json: dict) -> list[dict]:
    """
    For every claimed skill, searches the resume's actual content (project
    bullets, experience bullets, titles, summary, certifications) for
    supporting evidence, in descending order of strength. Returns one
    entry per skill with the evidence level, tri-state status, confidence,
    and the exact source (which project/experience + the matching text) —
    so the frontend can show WHY (spec Problem 22), not just a badge.
    """
    raw_skills = resume_json.get("skills", [])
    normalized = normalize_skills(raw_skills)

    experience = resume_json.get("experience", [])
    projects = resume_json.get("projects", [])
    summary = resume_json.get("summary", "")
    certifications = resume_json.get("certifications", [])

    graph = []
    for entry in normalized:
        pattern = _skill_pattern(entry["canonical_name"], entry["aliases"])
        evidence_level = "NO_EVIDENCE"
        source = None

        # 1. Project bullets — strongest possible evidence
        for proj in projects:
            for bullet in proj.get("bullets", []):
                if pattern.search(bullet):
                    level = "DIRECT_IMPLEMENTATION" if IMPLEMENTATION_VERBS.search(bullet) else "STRONG_MENTION"
                    source = {"source_type": "project", "source_name": proj.get("name", "Untitled project"), "text": bullet}
                    evidence_level = level
                    break
            if source:
                break

        # 2. Experience bullets
        if not source:
            for exp in experience:
                for bullet in exp.get("bullets", []):
                    if pattern.search(bullet):
                        level = "DIRECT_IMPLEMENTATION" if IMPLEMENTATION_VERBS.search(bullet) else "STRONG_MENTION"
                        source = {"source_type": "experience", "source_name": exp.get("title", "Untitled role"), "text": bullet}
                        evidence_level = level
                        break
                if source:
                    break

        # 3. Project / experience TITLES (weaker — a title mention isn't a demonstrated bullet)
        if not source:
            for proj in projects:
                if pattern.search(proj.get("name", "")):
                    source = {"source_type": "project_title", "source_name": proj.get("name"), "text": proj.get("name")}
                    evidence_level = "INDIRECT_EVIDENCE"
                    break
        if not source:
            for exp in experience:
                if pattern.search(exp.get("title", "")):
                    source = {"source_type": "experience_title", "source_name": exp.get("title"), "text": exp.get("title")}
                    evidence_level = "INDIRECT_EVIDENCE"
                    break

        # 4. Certifications
        if not source:
            for cert in certifications:
                cert_text = cert if isinstance(cert, str) else cert.get("certification", "")
                if pattern.search(cert_text):
                    source = {"source_type": "certification", "source_name": cert_text, "text": cert_text}
                    evidence_level = "INDIRECT_EVIDENCE"
                    break

        # 5. Summary only
        if not source and pattern.search(summary):
            source = {"source_type": "summary", "source_name": "Summary", "text": summary}
            evidence_level = "WEAK_MENTION"

        meta = EVIDENCE_LEVEL_META[evidence_level]
        graph.append({
            "skill": entry["skill"],
            "canonical_name": entry["canonical_name"],
            "category": entry["category"],
            "evidence_level": evidence_level,
            "status": meta["status"],
            "confidence": meta["confidence"],
            "evidence": [source] if source else [],
        })

    return graph


def compute_proof_coverage(evidence_graph: list[dict]) -> dict:
    """
    Weighted evidence coverage (spec Problem 5) — NOT a keyword count.
    Every skill is weighted 1.0 by default; skills backed by DIRECT
    implementation evidence count fully, weaker evidence counts partially,
    matching each entry's own confidence score exactly (so this number is
    always explainable by pointing at the evidence graph, never a separate
    unexplained calculation).
    """
    if not evidence_graph:
        return {"proof_coverage_pct": None, "strongly_evidenced": 0, "weakly_evidenced": 0, "unsupported": 0, "total_skills": 0}

    total = len(evidence_graph)
    strongly = sum(1 for e in evidence_graph if e["evidence_level"] in ("DIRECT_IMPLEMENTATION", "STRONG_MENTION"))
    weakly = sum(1 for e in evidence_graph if e["evidence_level"] in ("INDIRECT_EVIDENCE", "WEAK_MENTION"))
    unsupported = sum(1 for e in evidence_graph if e["evidence_level"] == "NO_EVIDENCE")

    weighted_sum = sum(e["confidence"] for e in evidence_graph)
    proof_coverage_pct = round(100 * weighted_sum / total)

    return {
        "proof_coverage_pct": proof_coverage_pct,
        "strongly_evidenced": strongly,
        "weakly_evidenced": weakly,
        "unsupported": unsupported,
        "total_skills": total,
    }


def extract_claims(resume_json: dict) -> list[dict]:
    """
    Pulls every experience/project bullet as a claim (spec Problem 4),
    tagging whether it's quantified and extracting the actual metric text
    verbatim from the resume — never inventing one. This is what
    bullet_rewrites and interview_prediction should ground themselves in,
    instead of the LLM inventing plausible-sounding numbers.
    """
    claims = []

    def _process(bullets, source_type, source_name):
        for bullet in bullets:
            metric_match = METRIC_PATTERN.search(bullet)
            claims.append({
                "claim": bullet,
                "claim_type": "quantified_achievement" if metric_match else "unquantified_statement",
                "source_type": source_type,
                "source_name": source_name,
                "metric": metric_match.group(0) if metric_match else None,
                "evidence_strength": "HIGH" if metric_match else "LOW",
                "verification_status": "resume_supported",  # it's verbatim from the resume itself
            })

    for exp in resume_json.get("experience", []):
        _process(exp.get("bullets", []), "experience", exp.get("title", "Untitled role"))
    for proj in resume_json.get("projects", []):
        _process(proj.get("bullets", []), "project", proj.get("name", "Untitled project"))

    return claims
