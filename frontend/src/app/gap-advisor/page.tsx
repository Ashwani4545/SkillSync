"use client";
import { useState, useEffect } from "react";
import { Calendar, Loader2, ChevronDown, ChevronUp, Shield, AlertTriangle, MessageSquare } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

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
    s === "significant" ? "#F87171"  :
    s === "moderate"    ? "#FBBF24"  : "#60A5FA";
  const severityBg = (s: string) =>
    s === "significant" ? "rgba(239, 68, 68, 0.15)"   :
    s === "moderate"    ? "rgba(245, 158, 11, 0.15)"   : "rgba(59, 130, 246, 0.15)";

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(248, 113, 113, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Gap Advisor" badge="PRO" badgeColor="#F87171" />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Career Gap Advisor</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            Detect employment gaps in your timeline and get honest, strategic reframing narratives for each one.
          </p>
        </div>

        {/* Resume selector */}
        {status !== "done" && (
          <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>SELECT RESUME TO ANALYZE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {resumes.length === 0
                ? <p style={{ fontSize: 14, color: "#94A3B8" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
                : resumes.map(r => (
                  <button key={r.id} onClick={() => setResumeId(r.id)}
                    style={{ padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${resumeId === r.id ? "#1D9E75" : "rgba(255, 255, 255, 0.1)"}`, background: resumeId === r.id ? "rgba(29, 158, 117, 0.15)" : "rgba(255, 255, 255, 0.03)", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#5EEAD4" : "#E2E8F0", transition: "all 0.2s ease" }}
                  >
                    {r.filename}
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

        {status !== "done" && (
          <button onClick={handleAnalyze} disabled={!resumeId || status === "loading"}
            style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: !resumeId ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: !resumeId ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: !resumeId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: resumeId ? "0 0 20px rgba(29, 158, 117, 0.3)" : "none", transition: "all 0.2s ease" }}
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
              <div style={{ background: "rgba(29, 158, 117, 0.1)", border: "1px solid rgba(29, 158, 117, 0.25)", borderRadius: 20, padding: 36, textAlign: "center" }}>
                <Shield size={48} color="#2DD4BF" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#5EEAD4", fontFamily: "Syne, sans-serif" }}>No significant gaps detected</h2>
                <p style={{ color: "#94A3B8" }}>Your career timeline looks clean and continuous. No reframing needed.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <AlertTriangle size={18} color="#FBBF24" />
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9" }}>{gaps.length} gap{gaps.length > 1 ? "s" : ""} detected</span>
                </div>

                {/* Gap list */}
                {gaps.map((gap: any, i: number) => {
                  const strats = strategies.find((s: any) => s.gap_index === i)?.strategies ?? [];
                  return (
                    <div key={i} style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: 16, overflow: "hidden" }}>
                      {/* Gap header */}
                      <button
                        onClick={() => setOpenGap(openGap === i ? null : i)}
                        style={{ width: "100%", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: severityBg(gap.severity), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={20} color={severityColor(gap.severity)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 2 }}>
                            {gap.start} – {gap.end}
                            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: severityBg(gap.severity), color: severityColor(gap.severity), textTransform: "capitalize", border: `1px solid ${severityColor(gap.severity)}33` }}>
                              {gap.severity} · {gap.duration_months} months
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "#94A3B8" }}>
                            {gap.context_before} → {gap.context_after}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#2DD4BF", fontWeight: 600 }}>
                          {strats.length} strateg{strats.length === 1 ? "y" : "ies"}
                        </div>
                        {openGap === i ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                      </button>

                      {openGap === i && (
                        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                          <p style={{ fontSize: 13, color: "#94A3B8", margin: "16px 0 16px", fontStyle: "italic" }}>
                            Choose the strategy that most honestly describes your situation:
                          </p>
                          {strats.map((strat: any, j: number) => (
                            <div key={j} style={{ marginBottom: 12 }}>
                              <button
                                onClick={() => setOpenStrat(s => ({ ...s, [`${i}-${j}`]: s[`${i}-${j}`] === j ? null : j }))}
                                style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.02)", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.06)", cursor: "pointer", textAlign: "left" }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: strat.risk_level === "low" ? "rgba(29, 158, 117, 0.15)" : "rgba(245, 158, 11, 0.15)", color: strat.risk_level === "low" ? "#2DD4BF" : "#FBBF24", border: `1px solid ${strat.risk_level === "low" ? "rgba(45, 212, 191, 0.3)" : "rgba(251, 191, 36, 0.3)"}` }}>
                                    {strat.risk_level === "low" ? "Low risk" : "Med risk"}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{strat.label}</span>
                                </div>
                                <ChevronDown size={14} color="#94A3B8" />
                              </button>
                              {openStrat[`${i}-${j}`] !== undefined && openStrat[`${i}-${j}`] !== null && (
                                <div style={{ padding: "16px", background: "rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255, 255, 255, 0.06)", borderTop: "none", borderRadius: "0 0 12px 12px" }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2DD4BF", letterSpacing: "0.05em", marginBottom: 8 }}>USE THIS NARRATIVE</div>
                                  <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6, margin: "0 0 12px", fontStyle: "italic", padding: "12px 16px", background: "rgba(29, 158, 117, 0.08)", borderRadius: 10, borderLeft: "3px solid #2DD4BF" }}>
                                    "{strat.narrative}"
                                  </p>
                                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                                    <strong style={{ color: "#E2E8F0" }}>Use when:</strong> {strat.use_when}
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
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <MessageSquare size={18} color="#C084FC" />
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>How to answer in an interview</h3>
                    </div>
                    <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7, margin: 0, padding: "14px 18px", background: "rgba(168, 85, 247, 0.1)", borderRadius: 12, borderLeft: "3px solid #C084FC", fontStyle: "italic" }}>
                      "{result.interview_answer}"
                    </p>
                  </div>
                )}

                {/* Cover letter tip */}
                {result.cover_letter_tip && (
                  <div style={{ padding: "16px 20px", background: "rgba(245, 158, 11, 0.1)", borderRadius: 14, borderLeft: "4px solid #FBBF24", border: "1px solid rgba(245, 158, 11, 0.2)", fontSize: 14, color: "#FDE68A", lineHeight: 1.6 }}>
                    <strong style={{ color: "#FCD34D" }}>Cover letter tip:</strong> {result.cover_letter_tip}
                  </div>
                )}
              </>
            )}

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ marginTop: 20, padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
              Analyze another resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
