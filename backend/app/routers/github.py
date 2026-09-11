"""
github.py — GitHub integration router (Phase 3)
POST /api/v1/github/connect          Fetch repos for a GitHub username
POST /api/v1/github/match            Match repos to a resume
GET  /api/v1/github/repos/{username} List public repos
POST /api/v1/github/proof-score      Compute a Proof Score for a resume against real GitHub evidence
"""
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, User, ProofScore, ProofScoreSkill
from app.middleware.auth import get_current_user, require_career
from app.services.github_service import (
    fetch_github_repos,
    match_repos_to_resume,
    build_repo_evidence_index,
)
from ai_engine.analyzers.proof_score import compute_proof_score
from ai_engine.generators.bullet_rewriter import generate_bullet_from_commits

router = APIRouter()


class GithubConnectRequest(BaseModel):
    github_username: str


class GithubMatchRequest(BaseModel):
    github_username: str
    resume_id: str


class ProofScoreRequest(BaseModel):
    github_username: str
    resume_id: str
    generate_bullets_for_weak_skills: bool = True


@router.post("/connect")
async def connect_github(
    body: GithubConnectRequest,
    current_user: User = Depends(require_career),
):
    """Fetch public repos for a GitHub username (no OAuth needed for public repos)."""
    try:
        repos = await fetch_github_repos(body.github_username)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"GitHub API error: {str(e)}")

    return {
        "username": body.github_username,
        "repo_count": len(repos),
        "repos": repos,
    }


@router.post("/match")
async def match_github_to_resume(
    body: GithubMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_career),
):
    """Match GitHub repos to resume bullets using AI."""
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume must be parsed first.")

    try:
        repos = await fetch_github_repos(body.github_username)
    except ValueError as e:
        raise HTTPException(400, str(e))

    result = match_repos_to_resume(repos, resume.parsed_json)
    return result


@router.get("/repos/{username}")
async def get_repos(
    username: str,
    current_user: User = Depends(get_current_user),
):
    try:
        repos = await fetch_github_repos(username)
        return {"username": username, "repos": repos}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/proof-score")
async def compute_resume_proof_score(
    body: ProofScoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_career),
):
    """
    The Proof Score pipeline, end to end:
    1. Pull the resume's claimed skills
    2. Pull real GitHub evidence (languages + commit activity per repo)
    3. Score each skill verified/weak/unverified with a confidence + reason
    4. For weak/unverified skills, optionally draft a replacement bullet
       sourced from actual commit messages (never invented)
    5. Persist the run so it can be shared via /api/v1/share
    """
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    if not resume.parsed_json:
        raise HTTPException(422, "Resume must be parsed first.")

    try:
        repos = await fetch_github_repos(body.github_username)
    except ValueError as e:
        raise HTTPException(400, str(e))

    if not repos:
        raise HTTPException(422, "No public repositories found for this GitHub username.")

    repos_with_evidence = await build_repo_evidence_index(body.github_username, repos)
    score_result = compute_proof_score(resume.parsed_json, repos_with_evidence)

    if score_result.get("overall_score") is None:
        return score_result  # no code-verifiable skills — nothing to persist

    proof_score = ProofScore(
        resume_id=resume.id,
        github_username=body.github_username,
        overall_score=score_result["overall_score"],
        verified_count=score_result["verified_count"],
        weak_count=score_result["weak_count"],
        unverified_count=score_result["unverified_count"],
        repos_analyzed_json=[
            {"name": r["name"], "url": r.get("url"), "language": r.get("language")}
            for r in repos_with_evidence
        ],
    )
    db.add(proof_score)
    db.flush()  # get proof_score.id before creating child rows

    repos_by_name = {r["name"]: r for r in repos_with_evidence}

    for skill_result in score_result["skills"]:
        suggested_bullet = None

        if (
            body.generate_bullets_for_weak_skills
            and skill_result["status"] in ("weak", "unverified")
            and skill_result.get("evidence_repo")
        ):
            repo = repos_by_name.get(skill_result["evidence_repo"])
            commit_messages = (repo or {}).get("commit_activity", {}).get("messages", [])
            if commit_messages:
                bullet_result = generate_bullet_from_commits(
                    skill=skill_result["skill"],
                    repo_name=skill_result["evidence_repo"],
                    commit_messages=commit_messages,
                )
                suggested_bullet = bullet_result.get("bullet")

        db.add(ProofScoreSkill(
            proof_score_id=proof_score.id,
            skill_name=skill_result["skill"],
            status=skill_result["status"],
            confidence=skill_result["confidence"],
            evidence_repo=skill_result.get("evidence_repo"),
            evidence_url=skill_result.get("evidence_url"),
            reason=skill_result.get("reason"),
            suggested_bullet=suggested_bullet,
        ))

    db.commit()
    db.refresh(proof_score)

    return {
        "proof_score_id": proof_score.id,
        "overall_score": proof_score.overall_score,
        "verified_count": proof_score.verified_count,
        "weak_count": proof_score.weak_count,
        "unverified_count": proof_score.unverified_count,
        "skills": [
            {
                "skill": s.skill_name,
                "status": s.status,
                "confidence": s.confidence,
                "evidence_repo": s.evidence_repo,
                "evidence_url": s.evidence_url,
                "reason": s.reason,
                "suggested_bullet": s.suggested_bullet,
            }
            for s in proof_score.skills
        ],
    }


@router.post("/proof-score/{proof_score_id}/share")
def create_proof_score_share_link(
    proof_score_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Makes a Proof Score publicly viewable via a share token — reuses the
    same share-link pattern as backend/app/routers/share.py."""
    proof_score = (
        db.query(ProofScore)
        .join(Resume)
        .filter(ProofScore.id == proof_score_id, Resume.user_id == current_user.id)
        .first()
    )
    if not proof_score:
        raise HTTPException(404, "Proof Score not found.")

    if not proof_score.share_token:
        proof_score.share_token = secrets.token_urlsafe(16)
        proof_score.is_public = True
        db.commit()

    return {"share_token": proof_score.share_token, "is_public": proof_score.is_public}
