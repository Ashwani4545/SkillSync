"use client";
import { useState, useEffect } from "react";
import { Calendar, Loader2, ChevronDown, ChevronUp, Shield, AlertTriangle, MessageSquare } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function GapAdvisorPage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [result, setResult]     = useState<any | null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]       = useState("");
  const [openGap, setOpenGap]   = useState<number | null>(0);
  const [openStrat, setOpenStrat] = useState<Record<string, number | null>>({});

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  const handleAnalyze = async () => {
    if (!resumeId) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/gap/analyze", { resume_id: resumeId });
      setResult(data);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
      setStatus("error");
    }
  };

  const gaps: any[]     = result?.gaps_detected     ?? [];
  const strategies: any[] = result?.gap_strategies  ?? [];

  const severityColor = (s: string) =>
    s === "significant" ? "var(--coral-700)"  :
    s === "moderate"    ? "var(--amber-700)"  : "var(--blue-700)";
  const severityBg = (s: string) =>
    s === "significant" ? "var(--coral-50)"   :
    s === "moderate"    ? "var(--amber-50)"   : "var(--blue-50)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Career Gap Advisor</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Detect employment gaps in your timeline and get honest, strategic reframing narratives for each one.
          </p>
        </div>

        {/* Resume selector */}
        {status !== "done" && (
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>SELECT RESUME TO ANALYZE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {resumes.length === 0
                ? <p style={{ fontSize: 14, color: "var(--gray-400)" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "var(--teal-700)" }}>Upload one →</a></p>
                : resumes.map(r => (
                  <button key={r.id} onClick={() => setResumeId(r.id)}
                    style={{ padding: "9px 16px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "var(--teal-700)" : "var(--gray-700)" }}
                  >
                    {r.filename}
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

        {status !== "done" && (
          <button onClick={handleAnalyze} disabled={!resumeId || status === "loading"}
            style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: !resumeId ? "var(--gray-200)" : "var(--teal-700)", color: !resumeId ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            {status === "loading"
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Analyzing timeline...</>
              : <><Calendar size={18} /> Analyze my career gaps</>
            }
          </button>
        )}

        {/* Results */}
        {status === "done" && (
          <div>
            {gaps.length === 0 ? (
              <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-xl)", padding: 32, textAlign: "center" }}>
                <Shield size={48} color="var(--teal-500)" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: 22, marginBottom: 8, color: "var(--teal-700)" }}>No significant gaps detected</h2>
                <p style={{ color: "var(--gray-500)" }}>Your career timeline looks clean and continuous. No reframing needed.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <AlertTriangle size={18} color="var(--amber-700)" />
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>{gaps.length} gap{gaps.length > 1 ? "s" : ""} detected</span>
                </div>

                {/* Gap list */}
                {gaps.map((gap: any, i: number) => {
                  const strats = strategies.find((s: any) => s.gap_index === i)?.strategies ?? [];
                  return (
                    <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", marginBottom: 16, overflow: "hidden" }}>
                      {/* Gap header */}
                      <button
                        onClick={() => setOpenGap(openGap === i ? null : i)}
                        style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: severityBg(gap.severity), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={20} color={severityColor(gap.severity)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)", marginBottom: 2 }}>
                            {gap.start} – {gap.end}
                            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: severityBg(gap.severity), color: severityColor(gap.severity), textTransform: "capitalize" }}>
                              {gap.severity} · {gap.duration_months} months
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
                            {gap.context_before} → {gap.context_after}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--teal-700)", fontWeight: 600 }}>
                          {strats.length} strateg{strats.length === 1 ? "y" : "ies"}
                        </div>
                        {openGap === i ? <ChevronUp size={16} color="var(--gray-400)" /> : <ChevronDown size={16} color="var(--gray-400)" />}
                      </button>

                      {openGap === i && (
                        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--gray-100)" }}>
                          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "16px 0 16px", fontStyle: "italic" }}>
                            Choose the strategy that most honestly describes your situation:
                          </p>
                          {strats.map((strat: any, j: number) => (
                            <div key={j} style={{ marginBottom: 12 }}>
                              <button
                                onClick={() => setOpenStrat(s => ({ ...s, [`${i}-${j}`]: s[`${i}-${j}`] === j ? null : j }))}
                                style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", cursor: "pointer", textAlign: "left" }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: strat.risk_level === "low" ? "var(--teal-50)" : "var(--amber-50)", color: strat.risk_level === "low" ? "var(--teal-700)" : "var(--amber-700)" }}>
                                    {strat.risk_level === "low" ? "Low risk" : "Med risk"}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>{strat.label}</span>
                                </div>
                                <ChevronDown size={14} color="var(--gray-400)" />
                              </button>
                              {openStrat[`${i}-${j}`] !== undefined && openStrat[`${i}-${j}`] !== null && (
                                <div style={{ padding: "14px 16px", background: "#fff", border: "1px solid var(--gray-200)", borderTop: "none", borderRadius: "0 0 var(--radius-md) var(--radius-md)" }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", marginBottom: 6 }}>USE THIS NARRATIVE</div>
                                  <p style={{ fontSize: 14, color: "var(--gray-800)", lineHeight: 1.6, margin: "0 0 12px", fontStyle: "italic", padding: "10px 14px", background: "var(--teal-50)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--teal-500)" }}>
                                    "{strat.narrative}"
                                  </p>
                                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                                    <strong>Use when:</strong> {strat.use_when}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Interview answer */}
                {result.interview_answer && (
                  <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <MessageSquare size={18} color="var(--purple-700)" />
                      <h3 style={{ margin: 0, fontSize: 15, color: "var(--gray-900)" }}>How to answer in an interview</h3>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.7, margin: 0, padding: "12px 16px", background: "var(--purple-50)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--purple-500)", fontStyle: "italic" }}>
                      "{result.interview_answer}"
                    </p>
                  </div>
                )}

                {/* Cover letter tip */}
                {result.cover_letter_tip && (
                  <div style={{ padding: "14px 18px", background: "var(--amber-50)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--amber-500)", fontSize: 14, color: "var(--gray-800)", lineHeight: 1.6 }}>
                    <strong>Cover letter tip:</strong> {result.cover_letter_tip}
                  </div>
                )}
              </>
            )}

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ marginTop: 20, padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
              Analyze another resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Gap Advisor</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--blue-50)", color: "var(--blue-700)" }}>PRO</span>
      </div>
    </div>
  );
}
