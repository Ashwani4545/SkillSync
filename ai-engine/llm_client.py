"""
llm_client.py — Phase 4: fallback routing + cost awareness
"""
import anthropic
import time, os
from typing import Optional

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
