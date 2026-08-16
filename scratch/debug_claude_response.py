from ai_engine.llm_client import call_claude
from ai_engine.analyzers.tone_analyzer import TONE_SYSTEM
from ai_engine.analyzers.audit_analyzer import AUDIT_SYSTEM

resp_tone = call_claude(system=TONE_SYSTEM, user="Analyze this resume tone:\nSUMMARY: Experienced Python developer building web applications.", max_tokens=1000)
print("TONE RESPONSE:", repr(resp_tone[:200]))

resp_audit = call_claude(system=AUDIT_SYSTEM, user="Perform 13-Point Audit:\nRESUME SKILLS: Python, FastAPI", max_tokens=1000)
print("AUDIT RESPONSE:", repr(resp_audit[:200]))
