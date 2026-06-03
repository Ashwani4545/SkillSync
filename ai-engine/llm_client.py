"""
llm_client.py
Central Claude API wrapper. All analyzers call this — never call the SDK directly.
This makes it easy to:
  - Add retry logic in one place
  - Switch models
  - Add caching
  - Track token usage
"""
import anthropic
import os
import time

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY", "")
        )
    return _client


def call_claude(
    system: str,
    user: str,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 1000,
    retries: int = 2,
    temperature: float = 0.3,
) -> str:
    """
    Make a Claude API call and return the text response.
    Retries on transient errors (rate limits, network issues).
    Always returns a string — callers are responsible for JSON parsing.
    """
    client = _get_client()
    last_error = None

    for attempt in range(retries + 1):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            return message.content[0].text

        except anthropic.RateLimitError as e:
            last_error = e
            wait = 2 ** attempt  # exponential backoff: 1s, 2s, 4s
            time.sleep(wait)

        except anthropic.APIStatusError as e:
            last_error = e
            if e.status_code >= 500:
                time.sleep(1)
                continue
            raise  # don't retry 4xx errors

        except Exception as e:
            last_error = e
            if attempt < retries:
                time.sleep(1)

    raise RuntimeError(f"Claude API failed after {retries + 1} attempts: {last_error}")
