"""
Tests for the real-data benchmark engine (ai_engine/comparators/benchmark_engine.py)
and the embedding layer it's built on (ai_engine/embeddings.py).

Uses USE_MOCK_EMBEDDINGS=true (set in conftest.py) so this suite doesn't need
to download the real sentence-transformers model — the mock embedding is
deterministic (same text -> same vector), which is exactly what's needed to
test ranking/percentile logic correctly.
"""
from ai_engine.embeddings import embed_resume_text, cosine_similarity, resume_json_to_embeddable_text
from ai_engine.comparators.benchmark_engine import benchmark_resume


def test_embedding_excludes_contact_info():
    resume = {
        "contact": {"name": "Jane Doe", "email": "jane@example.com", "phone": "555-1234"},
        "summary": "Backend engineer.",
        "skills": ["Python"],
        "experience": [],
        "projects": [],
    }
    text = resume_json_to_embeddable_text(resume)
    assert "Jane Doe" not in text
    assert "jane@example.com" not in text
    assert "555-1234" not in text
    assert "Backend engineer" in text


def test_embedding_is_deterministic():
    v1 = embed_resume_text("Python backend engineer with FastAPI experience")
    v2 = embed_resume_text("Python backend engineer with FastAPI experience")
    assert v1 == v2


def test_cosine_similarity_identical_vectors_is_one():
    v = embed_resume_text("some resume text")
    assert abs(cosine_similarity(v, v) - 1.0) < 1e-6


def test_cosine_similarity_different_text_is_lower():
    v1 = embed_resume_text("Python backend FastAPI PostgreSQL Docker")
    v2 = embed_resume_text("watercolor painting oil pastels gallery exhibition")
    same_sim = cosine_similarity(v1, v1)
    diff_sim = cosine_similarity(v1, v2)
    assert diff_sim < same_sim


# ── benchmark_resume: falls back to simulation when no real data exists ────

def test_benchmark_resume_without_db_uses_simulation(sample_resume_json):
    result = benchmark_resume(sample_resume_json, target_role="Backend Engineer", industry="technology")
    assert result["data_source"] == "simulated"
    assert "overall_percentile" in result


def test_benchmark_resume_with_db_but_no_ingested_data_falls_back(client, db_session, sample_resume_json):
    # db_session is a fresh, empty DB — no BenchmarkResume rows exist yet.
    result = benchmark_resume(
        sample_resume_json, target_role="Backend Engineer", industry="technology", db=db_session
    )
    assert result["data_source"] == "simulated"


# ── benchmark_resume: uses real data once enough is ingested ───────────────

def _seed_benchmark_resumes(db_session, role, industry, count, quant_rate=70, bullet_count=8):
    from app.db.models import BenchmarkResume

    for i in range(count):
        db_session.add(BenchmarkResume(
            target_role=role,
            industry=industry,
            embedding_json=embed_resume_text(f"strong candidate number {i} python fastapi backend"),
            quantification_rate=quant_rate,
            bullet_count=bullet_count,
            skills_count=8,
            experience_entries=3,
            source_label=f"test_seed_{i}",
        ))
    db_session.commit()


def test_benchmark_resume_uses_real_data_once_enough_ingested(client, db_session, sample_resume_json):
    _seed_benchmark_resumes(db_session, "Backend Engineer", "technology", count=6)

    result = benchmark_resume(
        sample_resume_json, target_role="Backend Engineer", industry="technology", db=db_session
    )

    assert result["data_source"] == "real_benchmark_data"
    assert result["matched_against"] >= 5
    assert "dimensions" in result
    assert "quantification" in result["dimensions"]
    # These must be measured, not LLM-invented — check the shape is right
    assert isinstance(result["dimensions"]["quantification"]["user_score"], int)
    assert isinstance(result["dimensions"]["quantification"]["percentile"], int)


def test_benchmark_resume_below_min_matches_still_falls_back(client, db_session, sample_resume_json):
    # Only 3 seeded rows — below MIN_REAL_MATCHES (5) — must not use real path
    _seed_benchmark_resumes(db_session, "Backend Engineer", "technology", count=3)

    result = benchmark_resume(
        sample_resume_json, target_role="Backend Engineer", industry="technology", db=db_session
    )
    assert result["data_source"] == "simulated"


def test_benchmark_resume_scoped_to_role_and_industry(client, db_session, sample_resume_json):
    # Seed data for a DIFFERENT role — must not be matched against
    _seed_benchmark_resumes(db_session, "Product Manager", "technology", count=10)

    result = benchmark_resume(
        sample_resume_json, target_role="Backend Engineer", industry="technology", db=db_session
    )
    assert result["data_source"] == "simulated"
