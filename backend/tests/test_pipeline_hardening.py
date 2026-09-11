"""
Tests for the core-loop hardening:
- ai_engine/json_utils.safe_parse_llm_json never raises, even on garbage input
- ai_engine/career_intelligence_engine.run_career_intelligence fills in any
  top-level key the model's response omits, so downstream consumers never
  hit a missing key even on a genuinely partial LLM response

Note on architecture: the pipeline used to call 11 independent analyzers,
each isolated so one failing (e.g. salary_estimator) couldn't take down
the others (e.g. ats, personas). The unified Career Intelligence Engine
(this file's actual subject now) makes ONE Claude call for the whole
report — there's no longer a "non-core analyzer" to isolate, since the
whole point of the rebuild is that every section shares one coherent
context instead of being computed independently. If that one call fails
(network error, auth error), the whole analysis now correctly fails —
there's nothing partial to salvage from a single request that didn't
complete. What's still tested here is the failure mode that DOES still
exist: a call that succeeds but returns malformed/incomplete JSON.
"""
import pytest
from ai_engine.json_utils import safe_parse_llm_json


# ── safe_parse_llm_json ──────────────────────────────────────────────────

def test_parses_clean_json():
    result = safe_parse_llm_json('{"score": 85}')
    assert result == {"score": 85}


def test_parses_json_in_markdown_fence():
    result = safe_parse_llm_json('Here you go:\n```json\n{"score": 85}\n```\nHope that helps!')
    assert result == {"score": 85}


def test_parses_first_brace_block_as_last_resort():
    result = safe_parse_llm_json('Sure, the result is {"score": 85} — let me know if you need more.')
    assert result == {"score": 85}


def test_never_raises_on_pure_garbage():
    # This is the exact bug that used to crash the whole pipeline: a
    # markdown-fenced block whose CONTENTS are also not valid JSON.
    result = safe_parse_llm_json('```json\n{not: valid, json at all]\n```')
    assert "_parse_error" in result
    assert result["_parse_error"] == "unparseable_response"


def test_never_raises_on_empty_string():
    result = safe_parse_llm_json("")
    assert result["_parse_error"] == "empty_response"


def test_fallback_dict_is_preserved_on_failure():
    result = safe_parse_llm_json("not json at all, no braces either", fallback={"score": 0, "note": "fallback"})
    assert result["score"] == 0
    assert result["note"] == "fallback"


# ── Career Intelligence Engine: missing-key resilience ──────────────────

def test_missing_top_level_keys_are_filled_with_empty_defaults(monkeypatch, sample_resume_json):
    """
    If the model's response is valid JSON but incomplete (missing some of
    the 21 required top-level keys), run_career_intelligence must fill
    those in rather than leave them absent — so frontend code reading
    result["priority_actions"] etc. never hits a KeyError.
    """
    import ai_engine.career_intelligence_engine as engine_module

    def _incomplete_response(*args, **kwargs):
        import json
        return json.dumps({"candidate_profile": {"identity": {"name": "Test"}}})

    monkeypatch.setattr(engine_module, "_generate_mock_response", _incomplete_response)

    import os
    os.environ["USE_MOCK_LLM"] = "true"
    result = engine_module.run_career_intelligence(sample_resume_json)

    for key in engine_module.REQUIRED_TOP_LEVEL_KEYS:
        assert key in result
    assert any("evidence_graph" in w for w in result["warnings"])


def test_real_api_failure_propagates(monkeypatch, sample_resume_json):
    """
    Unlike the old per-analyzer isolation, a failed call here has nothing
    partial to salvage — the whole analysis correctly fails, matching how
    workers/analyze_task.py's except block marks the Analysis row "failed".
    """
    import ai_engine.career_intelligence_engine as engine_module
    import os

    monkeypatch.setattr(os.environ, "get", os.environ.get)  # no-op, keeps real env access
    os.environ["USE_MOCK_LLM"] = "false"

    def _broken_call_claude_raw(*args, **kwargs):
        raise RuntimeError("simulated Anthropic API failure")

    monkeypatch.setattr(engine_module, "call_claude_raw", _broken_call_claude_raw)

    with pytest.raises(RuntimeError, match="simulated Anthropic API failure"):
        engine_module.run_career_intelligence(sample_resume_json)

    os.environ["USE_MOCK_LLM"] = "true"  # restore for subsequent tests in this process
