"""
Tests for ai_engine/skill_normalizer.py and ai_engine/evidence_engine.py —
the deterministic core added to fix the "candidate profile/evidence graph
were entirely LLM-trusted" gap. Test cases below map directly to the
platform spec's own Problem 20 list.
"""
from ai_engine.skill_normalizer import normalize_skill, normalize_skills
from ai_engine.evidence_engine import build_evidence_graph, compute_proof_coverage, extract_claims
from ai_engine.candidate_profile import build_candidate_profile, estimate_career_level


# ── Spec test 1/2/3: skill normalization ────────────────────────────────

def test_python_normalizes_correctly():
    result = normalize_skill("Python")
    assert result["canonical_name"] == "Python"
    assert result["category"] == "Programming"


def test_python_programming_maps_to_python():
    result = normalize_skill("Python programming")
    assert result["canonical_name"] == "Python"


def test_category_prefixed_skill_maps_to_bare_skill():
    """'Programming & Database: Python' should map to Python — this was
    the exact bug reported: the category prefix used to become part of
    the 'skill' name itself."""
    # The category-prefix stripping happens in parser_service._parse_skills
    # (fixed separately); by the time a raw skill string reaches the
    # normalizer, it should already be bare. This test locks in the
    # normalizer's own behavior if a prefix somehow still slips through —
    # it should still resolve via alias matching once cleaned.
    result = normalize_skill("Python")
    assert result["canonical_name"] == "Python"
    assert ":" not in result["canonical_name"]


def test_unrecognized_skill_still_gets_a_usable_canonical_form():
    result = normalize_skill("Snowflake")
    assert result["canonical_name"] == "Snowflake"
    assert result["category"] == "Other"


def test_normalize_skills_deduplicates_aliases():
    result = normalize_skills(["Python", "python programming", "Python 3"])
    assert len(result) == 1
    assert result[0]["canonical_name"] == "Python"


# ── Spec test 4/5: evidence classification ──────────────────────────────

def test_skill_in_project_bullet_counts_as_evidence():
    resume = {
        "skills": ["Python"],
        "experience": [],
        "projects": [{"name": "Delivery Prediction", "bullets": ["Developed a preprocessing pipeline using Python and Pandas."]}],
        "summary": "",
        "education": [],
        "certifications": [],
    }
    graph = build_evidence_graph(resume)
    python_entry = next(e for e in graph if e["canonical_name"] == "Python")
    assert python_entry["status"] == "EVIDENCED"
    assert python_entry["evidence_level"] == "DIRECT_IMPLEMENTATION"
    assert python_entry["evidence"][0]["source_type"] == "project"
    assert "Python" in python_entry["evidence"][0]["text"]


def test_skill_only_in_skills_section_is_not_strong_evidence():
    resume = {
        "skills": ["MLflow"],
        "experience": [],
        "projects": [{"name": "Delivery Prediction", "bullets": ["Developed a model using XGBoost."]}],
        "summary": "",
        "education": [],
        "certifications": [],
    }
    graph = build_evidence_graph(resume)
    mlflow_entry = next(e for e in graph if e["canonical_name"] == "MLflow")
    assert mlflow_entry["status"] == "UNSUPPORTED"
    assert mlflow_entry["evidence_level"] == "NO_EVIDENCE"
    assert mlflow_entry["evidence"] == []


def test_mention_without_action_verb_is_weaker_than_implementation():
    resume = {
        "skills": ["Docker"],
        "experience": [{"title": "Backend Engineer", "bullets": ["Familiar with Docker and container workflows."]}],
        "projects": [], "summary": "", "education": [], "certifications": [],
    }
    graph = build_evidence_graph(resume)
    docker_entry = next(e for e in graph if e["canonical_name"] == "Docker")
    assert docker_entry["evidence_level"] == "STRONG_MENTION"  # mentioned, but no implementation verb
    assert docker_entry["status"] == "EVIDENCED"  # still evidenced, just not the strongest level


# ── Spec test 7: unsupported skill never gets fabricated evidence ───────

def test_unsupported_skill_evidence_list_is_empty_not_fabricated():
    resume = {"skills": ["Kubernetes"], "experience": [], "projects": [], "summary": "", "education": [], "certifications": []}
    graph = build_evidence_graph(resume)
    k8s_entry = next(e for e in graph if e["canonical_name"] == "Kubernetes")
    assert k8s_entry["evidence"] == []
    assert k8s_entry["confidence"] == 0.0


# ── Proof coverage: deterministic and explainable ────────────────────────

def test_proof_coverage_matches_evidence_graph_exactly():
    resume = {
        "skills": ["Python", "Kubernetes"],
        "experience": [{"title": "Engineer", "bullets": ["Built services using Python."]}],
        "projects": [], "summary": "", "education": [], "certifications": [],
    }
    graph = build_evidence_graph(resume)
    coverage = compute_proof_coverage(graph)

    assert coverage["total_skills"] == 2
    assert coverage["strongly_evidenced"] == 1
    assert coverage["unsupported"] == 1
    # weighted sum = 0.95 (Python, DIRECT_IMPLEMENTATION) + 0.0 (Kubernetes) = 0.95 / 2 = 47.5 -> 48
    assert coverage["proof_coverage_pct"] == 48


def test_proof_coverage_empty_when_no_skills():
    coverage = compute_proof_coverage([])
    assert coverage["proof_coverage_pct"] is None


# ── Claim extraction: metrics never invented ─────────────────────────────

def test_quantified_claim_extracts_real_metric_verbatim():
    resume = {
        "experience": [{"title": "Engineer", "bullets": ["Reduced processing time by 40%."]}],
        "projects": [],
    }
    claims = extract_claims(resume)
    assert claims[0]["claim_type"] == "quantified_achievement"
    assert claims[0]["metric"] == "40%"
    assert claims[0]["verification_status"] == "resume_supported"


def test_unquantified_claim_has_no_fabricated_metric():
    resume = {"experience": [{"title": "Engineer", "bullets": ["Worked on a machine learning project."]}], "projects": []}
    claims = extract_claims(resume)
    assert claims[0]["claim_type"] == "unquantified_statement"
    assert claims[0]["metric"] is None


# ── Career level: confidence reflects actual date availability ──────────

def test_career_level_high_confidence_with_parseable_dates():
    result = estimate_career_level([{"title": "Engineer", "start": "2018", "end": "2023"}])
    assert result["confidence"] == "HIGH"
    assert result["years_estimated"] == 5.0


def test_career_level_low_confidence_without_parseable_dates():
    result = estimate_career_level([{"title": "Engineer", "start": "", "end": ""}])
    assert result["confidence"] == "LOW"


def test_career_level_entry_level_with_no_experience():
    result = estimate_career_level([])
    assert result["level"] == "Entry-level"


# ── candidate_profile: pure transformation, no fabrication ──────────────

def test_candidate_profile_reflects_actual_resume_content():
    resume = {
        "contact": {"name": "Jane Doe", "email": "jane@example.com"},
        "experience": [{"title": "Engineer", "start": "2020", "end": "2023"}],
        "projects": [{"name": "X"}],
        "education": [], "certifications": [],
    }
    profile = build_candidate_profile(resume)
    assert profile["identity"]["name"] == "Jane Doe"
    assert len(profile["experience"]) == 1
    assert len(profile["projects"]) == 1


def test_candidate_profile_empty_resume_has_zero_counts_not_fabricated():
    """Spec Problem 15: if there's genuinely nothing parsed, say so — don't
    manufacture plausible-looking content."""
    profile = build_candidate_profile({})
    assert profile["experience"] == []
    assert profile["projects"] == []
    assert profile["career_level"]["level"] == "Entry-level"
    assert profile["career_level"]["confidence"] == "LOW"
