"""
proof_score.py
The core "Proof Score" engine: for every skill claimed on a resume,
cross-references it against real GitHub evidence (languages actually used,
commit recency, commit volume) and classifies it as verified / weak /
unverified with a confidence score and a plain-language reason.

Deliberately deterministic rather than LLM-driven for the classification
itself — skill matching against language-byte-counts and commit dates is a
data problem, not a language-understanding problem, and a rule-based
approach is faster, cheaper, and more auditable ("why did this get flagged?"
should have a traceable answer, not a black-box one). The LLM is used
elsewhere in the pipeline only for turning evidence into a suggested resume
bullet (see ai_engine/generators/bullet_rewriter.py's
`generate_bullet_from_commits`).
"""
from datetime import datetime, timedelta

# Skills that can't be verified from a language/commit signal at all — a
# repo doesn't tell you someone has "communication" or "leadership".
# These are excluded from scoring rather than auto-flagged as unverified,
# which would be misleading.
NON_CODE_SKILLS = {
    "communication", "leadership", "teamwork", "collaboration",
    "problem solving", "problem-solving", "time management",
    "project management", "agile", "scrum", "critical thinking",
    "presentation", "public speaking", "mentoring", "stakeholder management",
}

# Maps a resume-style skill name to the language names GitHub reports it as.
# GitHub's /languages endpoint uses linguist's naming, which doesn't always
# match how people write skills on a resume (e.g. "Node.js" vs "JavaScript").
SKILL_TO_LANGUAGE_ALIASES = {
    "python": ["Python"],
    "javascript": ["JavaScript"],
    "typescript": ["TypeScript"],
    "node.js": ["JavaScript", "TypeScript"],
    "nodejs": ["JavaScript", "TypeScript"],
    "react": ["JavaScript", "TypeScript"],
    "java": ["Java"],
    "c++": ["C++"],
    "c#": ["C#"],
    "go": ["Go"],
    "golang": ["Go"],
    "rust": ["Rust"],
    "ruby": ["Ruby"],
    "php": ["PHP"],
    "swift": ["Swift"],
    "kotlin": ["Kotlin"],
    "html": ["HTML"],
    "css": ["CSS"],
    "sql": ["PLpgSQL", "SQL", "TSQL"],
    "shell": ["Shell"],
    "bash": ["Shell"],
    "dockerfile": ["Dockerfile"],
    "docker": ["Dockerfile"],
}

STALE_AFTER_DAYS = 730  # 2 years with no commits using this skill = "weak", not "verified"
THIN_EVIDENCE_COMMIT_THRESHOLD = 2  # fewer than this many relevant commits = "weak" even if recent


def _candidate_languages_for_skill(skill: str) -> list[str] | None:
    key = skill.strip().lower()
    if key in SKILL_TO_LANGUAGE_ALIASES:
        return SKILL_TO_LANGUAGE_ALIASES[key]
    # Fall back to a direct capitalized match (covers "Python", "Go", etc.
    # not in the alias table) — GitHub language names are usually just the
    # capitalized skill name.
    return [skill.strip()]


def _find_best_repo_for_skill(skill: str, repos: list[dict]) -> dict | None:
    """Returns the repo with the strongest evidence for `skill`, or None."""
    candidate_languages = _candidate_languages_for_skill(skill)
    best_repo = None
    best_bytes = 0

    for repo in repos:
        languages = repo.get("languages", {}) or {}
        repo_bytes = sum(languages.get(lang, 0) for lang in candidate_languages)
        if repo_bytes > best_bytes:
            best_bytes = repo_bytes
            best_repo = repo

    return best_repo if best_bytes > 0 else None


def _classify_skill(skill: str, repos: list[dict]) -> dict:
    best_repo = _find_best_repo_for_skill(skill, repos)

    if best_repo is None:
        return {
            "skill": skill,
            "status": "unverified",
            "confidence": 0,
            "evidence_repo": None,
            "evidence_url": None,
            "reason": "No public repository shows meaningful use of this skill.",
        }

    activity = best_repo.get("commit_activity", {}) or {}
    last_commit_str = activity.get("last_commit_date")
    commit_count = activity.get("commit_count_sampled", 0)

    is_stale = False
    if last_commit_str:
        try:
            last_commit = datetime.strptime(last_commit_str, "%Y-%m-%d")
            is_stale = (datetime.utcnow() - last_commit) > timedelta(days=STALE_AFTER_DAYS)
        except ValueError:
            is_stale = False

    is_thin = commit_count < THIN_EVIDENCE_COMMIT_THRESHOLD

    if is_stale and is_thin:
        status, confidence = "weak", 30
        reason = (
            f"Evidence in '{best_repo['name']}' is both old (last commit {last_commit_str}) "
            f"and thin (only {commit_count} commits sampled)."
        )
    elif is_stale:
        status, confidence = "weak", 45
        reason = f"Repo '{best_repo['name']}' hasn't been touched since {last_commit_str} — evidence looks stale."
    elif is_thin:
        status, confidence = "weak", 55
        reason = f"Only {commit_count} sampled commits in '{best_repo['name']}' — thin but present evidence."
    else:
        status, confidence = "verified", 90
        reason = f"Active, substantial evidence in '{best_repo['name']}' (last commit {last_commit_str})."

    return {
        "skill": skill,
        "status": status,
        "confidence": confidence,
        "evidence_repo": best_repo["name"],
        "evidence_url": best_repo.get("url"),
        "reason": reason,
    }


def compute_proof_score(resume_json: dict, repos_with_evidence: list[dict]) -> dict:
    """
    Main entry point. `repos_with_evidence` should come from
    github_service.build_repo_evidence_index() — repos already enriched
    with `languages` and `commit_activity`.
    """
    skills = resume_json.get("skills", [])
    scorable_skills = [s for s in skills if s.strip().lower() not in NON_CODE_SKILLS]

    if not scorable_skills:
        return {
            "overall_score": None,
            "verified_count": 0,
            "weak_count": 0,
            "unverified_count": 0,
            "skills": [],
            "note": "No code-verifiable skills found on this resume.",
        }

    results = [_classify_skill(skill, repos_with_evidence) for skill in scorable_skills]

    verified = [r for r in results if r["status"] == "verified"]
    weak = [r for r in results if r["status"] == "weak"]
    unverified = [r for r in results if r["status"] == "unverified"]

    # Overall score weights verified fully, weak half, unverified zero —
    # so a resume padded with unverifiable skills scores worse than one
    # with fewer, all backed by real work.
    weighted = len(verified) * 1.0 + len(weak) * 0.5
    overall_score = round(100 * weighted / len(scorable_skills))

    return {
        "overall_score": overall_score,
        "verified_count": len(verified),
        "weak_count": len(weak),
        "unverified_count": len(unverified),
        "skills": results,
    }
