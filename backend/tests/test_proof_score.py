"""
Tests for the Proof Score feature:
- ai_engine/analyzers/proof_score.py (the deterministic scoring engine)
- ai_engine/generators/bullet_rewriter.generate_bullet_from_commits (mock LLM path)
- POST /api/v1/github/proof-score (full API flow, DB persistence)
- GET  /api/v1/share/proof/{token} (public sharing)

GitHub API calls are monkeypatched rather than hit live — this keeps the
suite deterministic and independent of GitHub's rate limits in CI, and the
scoring logic itself is what's actually being tested, not GitHub's uptime.
"""
from ai_engine.analyzers.proof_score import compute_proof_score
from ai_engine.generators.bullet_rewriter import generate_bullet_from_commits


# ── Fixtures: fake enriched repo data (what build_repo_evidence_index returns) ──

def _fake_repos():
    return [
        {
            "name": "active-python-api",
            "url": "https://github.com/testuser/active-python-api",
            "language": "Python",
            "languages": {"Python": 50000, "Dockerfile": 500},
            "commit_activity": {
                "commit_count_sampled": 30,
                "first_commit_date": "2024-01-10",
                "last_commit_date": "2026-08-01",
                "messages": [
                    "Add rate limiting middleware to FastAPI routes",
                    "Fix connection pool exhaustion under load",
                    "Add integration tests for auth flow",
                ],
            },
        },
        {
            "name": "old-js-project",
            "url": "https://github.com/testuser/old-js-project",
            "language": "JavaScript",
            "languages": {"JavaScript": 8000},
            "commit_activity": {
                "commit_count_sampled": 1,
                "first_commit_date": "2020-03-01",
                "last_commit_date": "2020-03-01",
                "messages": ["Initial commit"],
            },
        },
    ]


def _resume_with_skills(skills):
    return {
        "skills": skills,
        "experience": [],
        "projects": [],
    }


# ── Scoring engine (deterministic, no LLM) ──────────────────────────────────

def test_verified_skill_has_active_recent_evidence():
    result = compute_proof_score(_resume_with_skills(["Python"]), _fake_repos())
    python_result = next(s for s in result["skills"] if s["skill"] == "Python")

    assert python_result["status"] == "verified"
    assert python_result["evidence_repo"] == "active-python-api"
    assert result["overall_score"] == 100


def test_stale_skill_flagged_as_weak_not_verified():
    result = compute_proof_score(_resume_with_skills(["JavaScript"]), _fake_repos())
    js_result = next(s for s in result["skills"] if s["skill"] == "JavaScript")

    assert js_result["status"] == "weak"
    assert "stale" in js_result["reason"].lower() or "old" in js_result["reason"].lower()


def test_skill_with_no_matching_repo_is_unverified():
    result = compute_proof_score(_resume_with_skills(["Rust"]), _fake_repos())
    rust_result = next(s for s in result["skills"] if s["skill"] == "Rust")

    assert rust_result["status"] == "unverified"
    assert rust_result["confidence"] == 0
    assert rust_result["evidence_repo"] is None


def test_non_code_skills_excluded_from_scoring():
    result = compute_proof_score(_resume_with_skills(["Leadership", "Python"]), _fake_repos())
    skill_names = [s["skill"] for s in result["skills"]]

    assert "Leadership" not in skill_names
    assert "Python" in skill_names


def test_overall_score_weights_verified_full_weak_half_unverified_zero():
    # 1 verified (Python), 1 weak (JavaScript), 1 unverified (Rust)
    # = (1.0 + 0.5 + 0) / 3 = 50%
    result = compute_proof_score(
        _resume_with_skills(["Python", "JavaScript", "Rust"]), _fake_repos()
    )
    assert result["overall_score"] == 50


def test_no_scorable_skills_returns_none_score():
    result = compute_proof_score(_resume_with_skills(["Leadership", "Teamwork"]), _fake_repos())
    assert result["overall_score"] is None
    assert result["skills"] == []


# ── Commit-to-bullet generation (mock LLM path) ─────────────────────────────

def test_generate_bullet_from_commits_grounds_in_real_messages():
    result = generate_bullet_from_commits(
        skill="Python",
        repo_name="active-python-api",
        commit_messages=[
            "Add rate limiting middleware to FastAPI routes",
            "Fix connection pool exhaustion under load",
        ],
    )
    assert result["bullet"] is not None
    assert "grounded_in" in result
    assert "active-python-api" in result["grounded_in"]


def test_generate_bullet_with_no_commits_returns_none():
    result = generate_bullet_from_commits(skill="Python", repo_name="empty-repo", commit_messages=[])
    assert result["bullet"] is None


# ── Full API flow (GitHub calls monkeypatched) ──────────────────────────────

async def _fake_fetch_github_repos(username):
    return [{"name": r["name"], "url": r["url"], "language": r["language"],
              "description": "", "stars": 0, "forks": 0, "updated_at": "2026-08-01", "topics": []}
             for r in _fake_repos()]


async def _fake_build_repo_evidence_index(username, repos, max_repos=12):
    return _fake_repos()


def test_proof_score_endpoint_end_to_end(client, db_session, test_user, monkeypatch, sample_resume_json):
    import app.routers.github as github_router
    from app.db.models import Resume

    monkeypatch.setattr(github_router, "fetch_github_repos", _fake_fetch_github_repos)
    monkeypatch.setattr(github_router, "build_repo_evidence_index", _fake_build_repo_evidence_index)

    # Insert the resume directly with a known, deterministic parsed_json
    # instead of routing through PDF parsing — the parser's skill-extraction
    # accuracy is exercised elsewhere (test_ats_pipeline.py); this test is
    # about the Proof Score pipeline once skills are known.
    resume = Resume(
        user_id=test_user.id,
        filename="resume.pdf",
        file_type="pdf",
        raw_text="",
        parsed_json=sample_resume_json,
        file_size=100,
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)

    resp = client.post(
        "/api/v1/github/proof-score",
        json={
            "github_username": "testuser",
            "resume_id": resume.id,
            "generate_bullets_for_weak_skills": True,
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "overall_score" in data
    assert "skills" in data
    assert any(s["skill"] == "Python" and s["status"] == "verified" for s in data["skills"])

    # Sharing
    share_resp = client.post(f"/api/v1/github/proof-score/{data['proof_score_id']}/share")
    assert share_resp.status_code == 200
    token = share_resp.json()["share_token"]

    public_resp = client.get(f"/api/v1/share/proof/{token}")
    assert public_resp.status_code == 200
    assert public_resp.json()["overall_score"] == data["overall_score"]
