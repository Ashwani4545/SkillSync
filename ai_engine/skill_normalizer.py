"""
skill_normalizer.py

Deterministic skill normalization (spec Problem 1). Maps raw skill strings
from the resume (e.g. "Python 3", "python programming") to a canonical
representation with a category and known aliases, so downstream matching
("does this resume actually demonstrate Python?") isn't tripped up by
superficial text variation.

Deliberately pure Python, no LLM call — normalization is a lookup/rules
problem, not a reasoning problem (spec Problem 17/21: deterministic where
possible, LLM only for genuine reasoning).
"""
import re

# A small, curated alias/category table covering the skills that actually
# show up across the resumes this product analyzes. Not exhaustive by
# design — an unrecognized skill still gets a sensible canonical form via
# _fallback_normalize() below, just without a curated category/alias list.
SKILL_TABLE = {
    "python": {"canonical": "Python", "category": "Programming", "aliases": ["python 3", "python programming", "python language", "py"]},
    "javascript": {"canonical": "JavaScript", "category": "Programming", "aliases": ["js", "javascript (es6)", "es6"]},
    "typescript": {"canonical": "TypeScript", "category": "Programming", "aliases": ["ts"]},
    "java": {"canonical": "Java", "category": "Programming", "aliases": ["java programming"]},
    "c++": {"canonical": "C++", "category": "Programming", "aliases": ["cpp", "c plus plus"]},
    "sql": {"canonical": "SQL", "category": "Programming", "aliases": ["structured query language"]},
    "r": {"canonical": "R", "category": "Programming", "aliases": ["r programming", "r language"]},

    "pandas": {"canonical": "Pandas", "category": "Data Science", "aliases": ["python pandas"]},
    "numpy": {"canonical": "NumPy", "category": "Data Science", "aliases": ["python numpy"]},
    "scikit-learn": {"canonical": "Scikit-learn", "category": "Machine Learning", "aliases": ["sklearn", "scikit learn"]},
    "xgboost": {"canonical": "XGBoost", "category": "Machine Learning", "aliases": ["xg boost"]},
    "tensorflow": {"canonical": "TensorFlow", "category": "Machine Learning", "aliases": ["tf"]},
    "pytorch": {"canonical": "PyTorch", "category": "Machine Learning", "aliases": ["torch"]},
    "tableau": {"canonical": "Tableau", "category": "Visualization", "aliases": []},
    "power bi": {"canonical": "Power BI", "category": "Visualization", "aliases": ["powerbi"]},
    "matplotlib": {"canonical": "Matplotlib", "category": "Visualization", "aliases": []},

    "fastapi": {"canonical": "FastAPI", "category": "Backend", "aliases": ["fast api"]},
    "django": {"canonical": "Django", "category": "Backend", "aliases": []},
    "flask": {"canonical": "Flask", "category": "Backend", "aliases": []},
    "node.js": {"canonical": "Node.js", "category": "Backend", "aliases": ["nodejs", "node"]},
    "express": {"canonical": "Express", "category": "Backend", "aliases": ["express.js", "expressjs"]},
    "rest api": {"canonical": "REST API", "category": "Backend", "aliases": ["rest apis", "restful api", "restful apis"]},

    "react": {"canonical": "React", "category": "Frontend", "aliases": ["react.js", "reactjs"]},
    "next.js": {"canonical": "Next.js", "category": "Frontend", "aliases": ["nextjs"]},
    "vue": {"canonical": "Vue", "category": "Frontend", "aliases": ["vue.js", "vuejs"]},
    "html": {"canonical": "HTML", "category": "Frontend", "aliases": ["html5"]},
    "css": {"canonical": "CSS", "category": "Frontend", "aliases": ["css3"]},

    "postgresql": {"canonical": "PostgreSQL", "category": "Database", "aliases": ["postgres"]},
    "mysql": {"canonical": "MySQL", "category": "Database", "aliases": []},
    "mongodb": {"canonical": "MongoDB", "category": "Database", "aliases": ["mongo"]},
    "redis": {"canonical": "Redis", "category": "Database", "aliases": []},

    "docker": {"canonical": "Docker", "category": "DevOps", "aliases": ["docker containers", "containerization"]},
    "kubernetes": {"canonical": "Kubernetes", "category": "DevOps", "aliases": ["k8s"]},
    "aws": {"canonical": "AWS", "category": "Cloud", "aliases": ["amazon web services"]},
    "gcp": {"canonical": "GCP", "category": "Cloud", "aliases": ["google cloud", "google cloud platform"]},
    "azure": {"canonical": "Azure", "category": "Cloud", "aliases": ["microsoft azure"]},
    "ci/cd": {"canonical": "CI/CD", "category": "DevOps", "aliases": ["cicd", "continuous integration"]},
    "git": {"canonical": "Git", "category": "Tools", "aliases": ["git version control"]},
    "mlflow": {"canonical": "MLflow", "category": "MLOps", "aliases": ["ml flow"]},

    "celery": {"canonical": "Celery", "category": "Backend", "aliases": []},
    "graphql": {"canonical": "GraphQL", "category": "Backend", "aliases": []},
}

# Built once at import time: alias text -> canonical key, for O(1) lookup.
_ALIAS_TO_KEY = {}
for _key, _entry in SKILL_TABLE.items():
    _ALIAS_TO_KEY[_key] = _key
    for _alias in _entry["aliases"]:
        _ALIAS_TO_KEY[_alias.lower()] = _key


def _fallback_normalize(raw_skill: str) -> dict:
    """For a skill not in SKILL_TABLE: still strip obvious version-number
    noise so 'Python 3.11' and 'Python' would at least collapse together
    if 'Python' weren't already curated — kept generic for anything else
    the curated table doesn't cover."""
    cleaned = re.sub(r"\s+v?\d+(\.\d+)*\s*$", "", raw_skill).strip()
    return {"canonical_name": cleaned or raw_skill, "category": "Other", "aliases": []}


def normalize_skill(raw_skill: str) -> dict:
    """
    Returns {"skill": <as given>, "canonical_name": ..., "category": ..., "aliases": [...]}
    Never raises — an unrecognized skill still gets a usable canonical form.
    """
    key = raw_skill.strip().lower()
    matched_key = _ALIAS_TO_KEY.get(key)

    if matched_key:
        entry = SKILL_TABLE[matched_key]
        return {
            "skill": raw_skill,
            "canonical_name": entry["canonical"],
            "category": entry["category"],
            "aliases": entry["aliases"],
        }

    fallback = _fallback_normalize(raw_skill)
    return {
        "skill": raw_skill,
        "canonical_name": fallback["canonical_name"],
        "category": fallback["category"],
        "aliases": fallback["aliases"],
    }


def normalize_skills(raw_skills: list[str]) -> list[dict]:
    """Normalizes a list, deduplicating by canonical_name (case-insensitive)
    so 'Python' and 'python programming' appearing as two separate resume
    lines don't produce two entries in the evidence graph."""
    seen = {}
    for raw in raw_skills:
        normalized = normalize_skill(raw)
        dedupe_key = normalized["canonical_name"].lower()
        if dedupe_key not in seen:
            seen[dedupe_key] = normalized
    return list(seen.values())
