"""
llm_client.py — Phase 4: fallback routing + cost awareness
"""
import anthropic
import time, os
from typing import Optional
from dotenv import load_dotenv

# Load env variables into os.environ
load_dotenv()

_claude_client: Optional[anthropic.Anthropic] = None
_openai_client = None


def _get_claude() -> anthropic.Anthropic:
    global _claude_client
    if _claude_client is None:
        _claude_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
    return _claude_client


def call_claude(
    system: str, user: str,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 1000, retries: int = 2,
    temperature: float = 0.3, allow_fallback: bool = True,
) -> str:
    # Local Development Mock Fallback
    if os.environ.get("ENVIRONMENT") == "development" or os.environ.get("ANTHROPIC_API_KEY", "").startswith("sk-ant-..."):
        system_lower = system.lower()
        if "ats" in system_lower or "compatibility" in system_lower:
            return """{
              "score": 85,
              "pass": true,
              "missing_keywords": ["docker", "kubernetes", "typescript"],
              "found_keywords": ["python", "javascript", "postgresql", "fastapi"],
              "format_issues": ["Missing GitHub link in header"],
              "improvements": ["Add detailed metrics to your latest software engineer role."]
            }"""
        elif "grade" in system_lower or "section" in system_lower:
            return """{
              "summary": { "score": 90, "feedback": "Strong professional summary showing clear value proposition." },
              "experience": { "score": 82, "feedback": "Good description of responsibilities, but could use more quantified outcomes." },
              "skills": { "score": 88, "feedback": "Well-categorized and relevant skill list." },
              "education": { "score": 95, "feedback": "Clear education history with degree and institution." }
            }"""
        elif "rewrite" in system_lower or "bullet" in system_lower:
            return """{
              "rewrites": [
                { "original": "Led a team of developers to build a website.", "rewritten": "Directed a cross-functional team of 5 software engineers to design and deploy a Next.js application, increasing user engagement by 35%." },
                { "original": "Responsible for maintaining databases.", "rewritten": "Optimized PostgreSQL database performance through index tuning and query refactoring, reducing page load latency by 45%." }
              ]
            }"""
        elif "tone" in system_lower or "confidence" in system_lower:
            return """{
              "confidence_score": 85,
              "passive_phrases": ["was responsible for", "assisted with"],
              "filler_words": ["just", "really", "mostly"],
              "improvements": ["Replace passive verbs with active ones like 'pioneered', 'spearheaded'."]
            }"""
        elif "persona" in system_lower or "recruit" in system_lower:
            return """{
              "ats_bot": { "score": 88, "status": "pass", "stop_reading_at": "none", "feedback": "Compatible formatting and clean headers allow flawless parsing." },
              "hr_recruiter": { "score": 82, "status": "review", "stop_reading_at": "experience_gap", "feedback": "A 6-month career gap is visible between 2024 and 2025." },
              "hiring_manager": { "score": 80, "status": "interview", "stop_reading_at": "none", "feedback": "Technical credentials look solid, but needs more impact metrics." }
            }"""
        elif "authenticity" in system_lower or "skill" in system_lower:
            return """{
              "score": 90,
              "skills_verified": ["python", "fastapi", "react", "postgresql"],
              "skills_unverified": ["docker", "kubernetes"],
              "feedback": "No projects explicitly mention using Kubernetes or Docker, although they are listed in the skills section."
            }"""
        elif "interview" in system_lower or "question" in system_lower:
            return """{
              "questions": [
                { "bullet": "Led a cross-functional team to deliver a product.", "question": "Can you describe a specific conflict that arose between departments during this project and how you resolved it?", "intent": "To evaluate leadership, communication, and conflict resolution skills." }
              ]
            }"""
        else:
            return '{"score": 80, "status": "success", "message": "Development mock response"}'

    client = _get_claude()
    last_error = None
    for attempt in range(retries + 1):
        try:
            msg = client.messages.create(
                model=model, max_tokens=max_tokens, system=system,
                messages=[{"role": "user", "content": user}],
            )
            return msg.content[0].text
        except anthropic.RateLimitError as e:
            last_error = e
            if allow_fallback and attempt == retries:
                return _fallback_to_openai(system, user, max_tokens, temperature)
            time.sleep(2 ** attempt)
        except anthropic.APIStatusError as e:
            last_error = e
            if e.status_code >= 500:
                if allow_fallback and attempt == retries:
                    return _fallback_to_openai(system, user, max_tokens, temperature)
                time.sleep(2 ** attempt); continue
            raise
        except Exception as e:
            last_error = e
            if attempt < retries: time.sleep(1)
    raise RuntimeError(f"Claude API failed after {retries+1} attempts: {last_error}")


def _fallback_to_openai(system, user, max_tokens, temperature):
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if not openai_key:
        raise RuntimeError("Claude unavailable and no OPENAI_API_KEY for fallback.")
    print("[llm_client] ⚠️ Claude unavailable — falling back to GPT-4o")
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=openai_key)
    resp = _openai_client.chat.completions.create(
        model="gpt-4o", max_tokens=max_tokens, temperature=temperature,
        messages=[{"role":"system","content":system},{"role":"user","content":user}],
    )
    return resp.choices[0].message.content
