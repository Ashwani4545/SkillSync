"use client";
import { useState } from "react";
import { Bot, UserCheck, Briefcase, AlertTriangle, ThumbsUp } from "lucide-react";

const PERSONAS = [
  {
    id: "ats_bot",
    label: "ATS Bot",
    icon: <Bot size={18} />,
    color: "var(--blue-700)",
    bg: "var(--blue-50)",
    border: "var(--blue-500)",
    desc: "Automated keyword and format scanner",
  },
  {
    id: "hr_recruiter",
    label: "HR Recruiter",
    icon: <UserCheck size={18} />,
    color: "var(--teal-700)",
    bg: "var(--teal-50)",
    border: "var(--teal-500)",
    desc: "Initial human screen — 6 seconds per resume",
  },
  {
    id: "hiring_manager",
    label: "Hiring Manager",
    icon: <Briefcase size={18} />,
    color: "var(--purple-700)",
    bg: "var(--purple-50)",
    border: "var(--purple-500)",
    desc: "Evaluates real-world capability and credibility",
  },
];

export function PersonaView({ data }: { data: any }) {
  const [active, setActive] = useState("ats_bot");
  if (!data) return <EmptyState />;

  const persona = PERSONAS.find((p) => p.id === active)!;
  const pd = data[active] ?? {};

  const verdictColor = (v: string) => {
    if (["pass", "shortlist", "strong"].includes(v)) return "var(--teal-700)";
    if (["maybe", "consider"].includes(v)) return "var(--amber-700)";
    return "var(--coral-700)";
  };
  const verdictBg = (v: string) => {
    if (["pass", "shortlist", "strong"].includes(v)) return "var(--teal-50)";
    if (["maybe", "consider"].includes(v)) return "var(--amber-50)";
    return "var(--coral-50)";
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Persona-based analysis</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
        See your resume as each type of reviewer sees it — and exactly where they'd stop reading.
      </p>

      {/* Persona tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {PERSONAS.map((p) => {
          const pd = data[p.id] ?? {};
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              style={{
                padding: "16px", borderRadius: "var(--radius-lg)", border: `2px solid ${active === p.id ? p.border : "var(--gray-200)"}`,
                background: active === p.id ? p.bg : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: active === p.id ? p.color : "var(--gray-500)" }}>
                {p.icon}
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: active === p.id ? p.color : "var(--gray-400)", fontFamily: "Syne" }}>{pd.score ?? "—"}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>/ 100</div>
            </button>
          );
        })}
      </div>

      {/* Persona detail */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: `1px solid var(--gray-200)`, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: persona.bg, display: "flex", alignItems: "center", justifyContent: "center", color: persona.color }}>{persona.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{persona.label}</div>
            <div style={{ fontSize: 13, color: "var(--gray-400)" }}>{persona.desc}</div>
          </div>
          {pd.verdict && (
            <div style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 20, background: verdictBg(pd.verdict), color: verdictColor(pd.verdict), fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>
              {pd.verdict}
            </div>
          )}
        </div>

        {pd.stop_reading_at && (
          <div style={{ background: "var(--amber-50)", border: "1px solid var(--amber-500)40", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber-700)", marginBottom: 4 }}>STOPS READING AT</div>
            <div style={{ fontSize: 14, color: "var(--gray-700)" }}>{pd.stop_reading_at}</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Issues / Red flags / Credibility gaps */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 10 }}>
              {active === "ats_bot" ? "ISSUES" : active === "hr_recruiter" ? "RED FLAGS" : "CREDIBILITY GAPS"}
            </div>
            {(pd.issues || pd.red_flags || pd.credibility_gaps || []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--coral-700)", alignItems: "flex-start" }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
              </div>
            ))}
          </div>

          {/* Positives */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 10 }}>
              {active === "ats_bot" ? "PASSED CHECKS" : active === "hr_recruiter" ? "GREEN FLAGS" : "STRENGTHS"}
            </div>
            {(pd.passed_checks || pd.green_flags || pd.strengths || []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--teal-700)", alignItems: "flex-start" }}>
                <ThumbsUp size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
              </div>
            ))}
          </div>
        </div>

        {pd.first_impression && (
          <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--teal-500)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 4 }}>FIRST IMPRESSION</div>
            <div style={{ fontSize: 15, color: "var(--gray-700)", fontStyle: "italic" }}>"{pd.first_impression}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return <div style={{ padding: 32, textAlign: "center", color: "var(--gray-400)" }}>No persona data available.</div>;
}
