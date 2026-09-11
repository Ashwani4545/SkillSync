"""
json_utils.py
Every analyzer/generator in this package parses a Claude response as JSON,
with a fallback for the common case where Claude wraps its JSON in a
markdown code fence. The bug this fixes: that fallback itself called
`json.loads(match.group(1))` with no guard — if the fenced content was
ALSO not valid JSON (rare but real: truncated output, an unescaped quote
inside resume text Claude echoed back, etc.), that raised an unhandled
JSONDecodeError that propagated all the way up through
ai_engine/pipeline.py and failed the ENTIRE analysis — including the ATS
score and persona results from OTHER analyzers that had already succeeded.

`safe_parse_llm_json` never raises. Worst case, it returns `fallback`
(or an empty dict) with the raw response attached for debugging.
"""
import json
import re


def safe_parse_llm_json(response_text: str, fallback: dict | None = None) -> dict:
    """
    Attempts, in order:
    1. Direct json.loads()
    2. Extract from a ```json ... ``` fence and json.loads() that
    3. Extract the first {...} block found anywhere in the text and json.loads() that
    4. Give up — return `fallback` (or {}) with the raw text attached, never raise
    """
    if not response_text:
        return {**(fallback or {}), "_parse_error": "empty_response"}

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", response_text)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass

    brace_match = re.search(r"\{[\s\S]*\}", response_text)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except json.JSONDecodeError:
            pass

    return {
        **(fallback or {}),
        "_parse_error": "unparseable_response",
        "_raw_response": response_text[:2000],  # capped so a bad response can't bloat the DB row
    }
