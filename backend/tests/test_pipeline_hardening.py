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
# candidate_profile/evidence_graph/proof_coverage/claims are NEVER at risk
# here — they're computed deterministically before the LLM is even called
# (see ai_engine/candidate_profile.py, ai_engine/evidence_engine.py), so
# they can't be missing due to a bad LLM response. Only the LLM's own
# reasoning sections (LLM_SECTION_KEYS) can be incomplete.

def test_missing_llm_section_keys_are_filled_with_empty_defaults(monkeypatch, sample_resume_json):
    import ai_engine.career_intelligence_engine as engine_module
    import os

    def _incomplete_response(*args, **kwargs):
        import json
        return json.dumps({"ats_readiness": {"ats_readiness_score": 70}})

    monkeypatch.setattr(engine_module, "_generate_mock_response", _incomplete_response)
    os.environ["USE_MOCK_LLM"] = "true"

    result = engine_module.run_career_intelligence(sample_resume_json)

    for key in engine_module.LLM_SECTION_KEYS:
        assert key in result
    # candidate_profile/evidence_graph are unaffected by the LLM response at all
    assert result["candidate_profile"]["experience"] == sample_resume_json["experience"]
    assert len(result["evidence_graph"]) == len(set(s.lower() for s in sample_resume_json["skills"]))
    assert any("warnings" in str(w) or "missing" in str(w).lower() for w in result.get("warnings", []))


def test_candidate_profile_survives_even_a_totally_broken_llm_call(monkeypatch, sample_resume_json):
    """This is the actual fix for the '0 experience entries' bug: even a
    complete LLM failure must not zero out candidate_profile/evidence_graph,
    because they never depended on the LLM succeeding in the first place."""
    import ai_engine.career_intelligence_engine as engine_module
    import os

    def _garbage_response(*args, **kwargs):
        return "this is not json at all and has no braces"

    monkeypatch.setattr(engine_module, "_generate_mock_response", _garbage_response)
    os.environ["USE_MOCK_LLM"] = "true"

    result = engine_module.run_career_intelligence(sample_resume_json)

    assert len(result["candidate_profile"]["experience"]) == len(sample_resume_json["experience"])
    assert len(result["evidence_graph"]) > 0


def test_real_api_failure_propagates(monkeypatch, sample_resume_json):
    """
    A failed call here has nothing partial to salvage from the LLM's own
    sections — but candidate_profile/evidence_graph were already computed
    before the call, so this only means the reasoning sections are lost,
    not the whole analysis. workers/analyze_task.py still marks the
    Analysis row "failed" in this case since run_career_intelligence raises.
    """
    import ai_engine.career_intelligence_engine as engine_module
    import os

    os.environ["USE_MOCK_LLM"] = "false"

    def _broken_call_claude_raw(*args, **kwargs):
        raise RuntimeError("simulated Anthropic API failure")

    monkeypatch.setattr(engine_module, "call_claude_raw", _broken_call_claude_raw)

    with pytest.raises(RuntimeError, match="simulated Anthropic API failure"):
        engine_module.run_career_intelligence(sample_resume_json)

    os.environ["USE_MOCK_LLM"] = "true"  # restore for subsequent tests in this process
