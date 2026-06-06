"""
github.py — GitHub integration router (Phase 3)
POST /api/v1/github/connect          Fetch repos for a GitHub username
POST /api/v1/github/match            Match repos to a resume
GET  /api/v1/github/repos/{username} List public repos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, User
from app.middleware.auth import get_current_user, require_career
from app.services.github_service import fetch_github_repos, match_repos_to_resume

router = APIRouter()


class GithubConnectRequest(BaseModel):
    github_username: str


class GithubMatchRequest(BaseModel):
    github_username: str
    resume_id: str


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
