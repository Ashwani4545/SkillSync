"""
github_service.py
Fetches public GitHub repos for a user and matches them to resume bullets.
Uses the GitHub REST API (no auth needed for public repos).
"""
import re
import httpx
import json
from ai_engine.llm_client import call_claude

GITHUB_API = "https://api.github.com"


async def fetch_github_repos(github_username: str) -> list[dict]:
    """Fetch public repos from GitHub REST API."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{GITHUB_API}/users/{github_username}/repos",
            params={"sort": "updated", "per_page": 30, "type": "public"},
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        if resp.status_code == 404:
            raise ValueError(f"GitHub user '{github_username}' not found.")
        if resp.status_code == 403:
            raise ValueError("GitHub API rate limit hit. Try again in a few minutes.")
        resp.raise_for_status()
        repos = resp.json()

    return [
        {
            "name":        r["name"],
            "description": r.get("description") or "",
            "url":         r["html_url"],
            "language":    r.get("language") or "Unknown",
            "stars":       r.get("stargazers_count", 0),
            "forks":       r.get("forks_count", 0),
            "updated_at":  r.get("updated_at", "")[:10],
            "topics":      r.get("topics", []),
        }
        for r in repos
        if not r.get("fork")  # exclude forks by default
    ]


def match_repos_to_resume(
    repos: list[dict],
    resume_json: dict,
) -> dict:
    """
    Use Claude to intelligently match GitHub repos to resume bullets.
    Returns suggestions for which projects to add/highlight.
    """
    if not repos:
        return {"matches": [], "unmatched_repos": [], "suggestions": []}

    experience = resume_json.get("experience", [])
    skills     = resume_json.get("skills", [])
    bullets    = [b for e in experience for b in e.get("bullets", [])[:3]]

    repo_text = "\n".join(
        f"- {r['name']} ({r['language']}) — {r['description'][:100]} "
        f"[{r['stars']}⭐ {r['forks']} forks]"
        for r in repos[:20]
    )

    MATCH_SYSTEM = """You are a technical resume advisor. Match GitHub projects to resume content.
Respond ONLY with valid JSON. Schema:
{
  "matches": [
    {
      "repo_name": "<repo>",
      "matched_bullet": "<resume bullet or skill it supports>",
      "strength": "strong|moderate|weak",
      "suggestion": "<how to use this project on the resume>"
    }
  ],
  "missing_from_resume": [
    {
      "repo_name": "<repo worth adding>",
      "why": "<why this project would strengthen the resume>",
      "suggested_bullet": "<draft bullet using this project>"
    }
  ],
  "skills_evidenced": ["<skill that now has project proof>"]
}"""

    user_prompt = f"""Match these GitHub projects to this candidate's resume.

GITHUB REPOS:
{repo_text}

RESUME SKILLS: {', '.join(skills[:20])}

RESUME BULLETS (sample):
{chr(10).join(f'• {b}' for b in bullets[:10])}

Identify which repos support existing claims and which should be added.
Respond with JSON only."""

    response = call_claude(system=MATCH_SYSTEM, user=user_prompt, max_tokens=1500)

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*([\s\S]+?)\s*```", response)
        result = json.loads(m.group(1)) if m else {"matches": [], "error": "parse failed"}

    result["repos"] = repos
    return result
