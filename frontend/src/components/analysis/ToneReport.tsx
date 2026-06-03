"use client";
import { AlertTriangle, CheckCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// ── ToneReport ────────────────────────────────────────────────────────────────
export function ToneReport({ data }: { data: any }) {
  if (!data) return null;
  const score = data.confidence_score ?? 0;
  const barColor = score >= 75 ? "var(--teal-500)" : score >= 55 ? "var(--amber-500)" : "var(--coral-500)";

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Tone & confidence report</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>Passive language and hedging phrases weaken your resume. Here's where to fix them.</p>

      {/* Score meter */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>Confidence score</span>
          <span style={{ fontSize: 32, fontWeight: 800, color: barColor, fontFamily: "Syne" }}>{score}<span style={{ fontSize: 18 }}>/100</span></span>
        </div>
        <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: 4, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--gray-400)" }}>
          <span>Passive / hedging</span><span>Confident & direct</span>
        </div>
      </div>

      {/* Passive phrases */}
      {data.passive_phrases?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Weak phrases to fix</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.passive_phrases.map((p: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--coral-700)", fontWeight: 700, marginBottom: 4 }}>WEAK</div>
                  <div style={{ fontSize: 14, color: "var(--gray-500)", textDecoration: "line-through" }}>{p.phrase}</div>
                </div>
                <div style={{ fontSize: 18, color: "var(--gray-300)" }}>→</div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--teal-700)", fontWeight: 700, marginBottom: 4 }}>STRONGER</div>
                  <div style={{ fontSize: 14, color: "var(--gray-800)", fontWeight: 500 }}>{p.fix}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top improvements */}
      {data.top_improvements?.length > 0 && (
        <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--teal-700)" }}>Top improvements</h3>
          {data.top_improvements.map((tip: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--gray-700)" }}>
              <CheckCircle size={15} color="var(--teal-500)" style={{ flexShrink: 0, marginTop: 2 }} />{tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── InterviewQuestions ────────────────────────────────────────────────────────
export function InterviewQuestions({ data }: { data: any }) {
  const [open, setOpen] = useState<number | null>(null);
  const questions = data?.questions ?? [];

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Interview question predictor</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
        Based on weak spots in your resume, here are the probing questions a recruiter will likely ask you.
      </p>
      {data?.overall_concern_level && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, marginBottom: 20, background: data.overall_concern_level === "high" ? "var(--coral-50)" : data.overall_concern_level === "medium" ? "var(--amber-50)" : "var(--teal-50)", color: data.overall_concern_level === "high" ? "var(--coral-700)" : data.overall_concern_level === "medium" ? "var(--amber-700)" : "var(--teal-700)" }}>
          <AlertTriangle size={14} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Concern level: {data.overall_concern_level}</span>
          {data.top_concern && <span style={{ fontSize: 13 }}>— {data.top_concern}</span>}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((q: any, i: number) => (
          <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <MessageSquare size={18} color="var(--amber-500)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)", lineHeight: 1.4 }}>{q.question}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>Triggered by: {q.trigger}</div>
              </div>
              {open === i ? <ChevronUp size={16} color="var(--gray-400)" /> : <ChevronDown size={16} color="var(--gray-400)" />}
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 16px 50px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 6 }}>WHY THEY'RE ASKING</div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 12 }}>{q.why}</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", marginBottom: 6 }}>HOW TO ANSWER WELL</div>
                <p style={{ fontSize: 14, color: "var(--gray-700)", padding: "10px 14px", background: "var(--teal-50)", borderRadius: "var(--radius-md)", margin: 0 }}>{q.good_answer_tip}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SkillAudit ────────────────────────────────────────────────────────────────
export function SkillAudit({ data }: { data: any }) {
  if (!data) return null;
  const score = data.authenticity_score ?? 0;

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Skill authenticity audit</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
        Cross-referencing your claimed skills against your experience. Skills without evidence are a red flag to experienced recruiters.
      </p>

      {/* Score */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Evidenced",   count: data.evidenced_skills?.length ?? 0, color: "var(--teal-700)", bg: "var(--teal-50)" },
          { label: "Unsupported", count: data.unsupported_skills?.length ?? 0, color: "var(--coral-700)", bg: "var(--coral-50)" },
          { label: "Missing",     count: data.missing_skills?.length ?? 0, color: "var(--amber-700)", bg: "var(--amber-50)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, minWidth: 120, background: s.bg, borderRadius: "var(--radius-lg)", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.count}</div>
            <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Evidenced skills */}
      {data.evidenced_skills?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--teal-700)" }}>✓ Evidenced skills</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.evidenced_skills.map((s: any, i: number) => (
              <div key={i} title={s.evidence} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-700)", border: "1px solid var(--teal-100)", cursor: "default" }}>{s.skill}</div>
            ))}
          </div>
        </div>
      )}

      {/* Unsupported skills */}
      {data.unsupported_skills?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--coral-700)" }}>⚠ Unsupported skills</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.unsupported_skills.map((s: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "var(--coral-50)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--coral-700)", minWidth: 80 }}>{s.skill}</span>
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>{s.risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommendation && (
        <div style={{ padding: "14px 18px", background: "var(--blue-50)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--blue-700)", borderLeft: "3px solid var(--blue-500)" }}>
          {data.recommendation}
        </div>
      )}
    </div>
  );
}
