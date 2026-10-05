"use client";
import { useState, useEffect } from "react";
import { Shield, Loader2, AlertTriangle, CheckCircle, ArrowRight, Copy } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  gendered:      { label: "Gendered language",   color: "#F87171",  bg: "rgba(248, 113, 113, 0.15)", icon: "♀♂" },
  age_signalling:{ label: "Age signalling",       color: "#FBBF24",  bg: "rgba(251, 191, 36, 0.15)", icon: "📅" },
  ability:       { label: "Ability-normative",    color: "#60A5FA",  bg: "rgba(96, 165, 250, 0.15)", icon: "♿" },
  prestige:      { label: "Prestige / class",     color: "#C084FC",  bg: "rgba(192, 132, 252, 0.15)", icon: "🎓" },
  cultural:      { label: "Cultural marker",      color: "#2DD4BF",  bg: "rgba(45, 212, 191, 0.15)", icon: "🌍" },
};

const SEVERITY_COLOR: Record<string, string> = {
  high:   "#F87171",
  medium: "#FBBF24",
  low:    "#60A5FA",
};
const SEVERITY_BG: Record<string, string> = {
  high:   "rgba(248, 113, 113, 0.12)",
  medium: "rgba(251, 191, 36, 0.12)",
  low:    "rgba(96, 165, 250, 0.12)",
};

export default function BiasScannerPage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [result, setResult]     = useState<any | null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  const handleScan = async () => {
    if (!resumeId) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/bias/scan", { resume_id: resumeId });
      setResult(data);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "Scan failed.");
      setStatus("error");
    }
  };

  const copyAlt = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const flagged: any[] = result?.flagged_phrases ?? [];
  const score          = result?.overall_bias_score ?? null;
  const scoreColor     = score === null ? "#94A3B8" : score >= 85 ? "#2DD4BF" : score >= 65 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Bias Scanner" badge="PRO" badgeColor="#2DD4BF" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Bias & Inclusivity Scanner</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            Detect gendered language, age-signalling phrases, and other markers that may trigger unconscious bias in human reviewers — before they see your resume.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>SELECT RESUME TO SCAN</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {resumes.length === 0
                  ? <p style={{ fontSize: 14, color: "#64748B" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
                  : resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${resumeId === r.id ? "#1D9E75" : "rgba(255, 255, 255, 0.1)"}`, background: resumeId === r.id ? "rgba(29, 158, 117, 0.15)" : "rgba(255, 255, 255, 0.03)", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#5EEAD4" : "#E2E8F0", transition: "all 0.2s ease" }}>
                      {r.filename}
                    </button>
                  ))}
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleScan} disabled={!resumeId}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: !resumeId ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: !resumeId ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: !resumeId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: resumeId ? "0 0 20px rgba(29, 158, 117, 0.3)" : "none", transition: "all 0.2s ease" }}>
              <Shield size={18} /> Scan for bias
            </button>
          </>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(45, 212, 191, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={28} color="#2DD4BF" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Scanning for bias patterns</h2>
            <p style={{ color: "#94A3B8" }}>Checking gendered language, age signals, and exclusionary phrases...</p>
          </div>
        )}

        {status === "done" && result && (
          <div>
            {/* Score hero */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 20, border: "1px solid rgba(255, 255, 255, 0.08)", padding: "28px 32px", marginBottom: 20, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 68, fontWeight: 800, color: scoreColor, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>inclusivity score</div>
                <div style={{ fontSize: 12, color: scoreColor, fontWeight: 700, marginTop: 4 }}>
                  {score >= 85 ? "Excellent" : score >= 65 ? "Needs attention" : "Significant issues"}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                {/* Category badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {Object.entries(result.bias_categories ?? {}).map(([key, cat]: [string, any]) => {
                    const meta = CATEGORY_META[key] ?? { label: key, color: "#94A3B8", bg: "rgba(255, 255, 255, 0.05)", icon: "•" };
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: cat.found ? meta.bg : "rgba(255, 255, 255, 0.02)", border: `1px solid ${cat.found ? meta.color + "40" : "rgba(255, 255, 255, 0.08)"}` }}>
                        <span style={{ fontSize: 14 }}>{meta.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: cat.found ? meta.color : "#64748B" }}>{meta.label}</span>
                        {cat.found && <span style={{ fontSize: 11, background: meta.color, color: "#000", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cat.count}</span>}
                        {!cat.found && <CheckCircle size={12} color="#2DD4BF" />}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
              </div>
            </div>

            {/* Flagged phrases */}
            {flagged.length === 0 ? (
              <div style={{ background: "rgba(45, 212, 191, 0.08)", border: "1px solid rgba(45, 212, 191, 0.25)", borderRadius: 18, padding: 32, textAlign: "center", marginBottom: 20 }}>
                <CheckCircle size={44} color="#2DD4BF" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#2DD4BF", marginBottom: 8 }}>No bias detected</h3>
                <p style={{ color: "#94A3B8", fontSize: 14 }}>Your resume uses inclusive, neutral language throughout.</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>Phrases to revise</h3>
                <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 20 }}>{flagged.length} issue{flagged.length !== 1 ? "s" : ""} found · Click copy to use alternatives</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {flagged.map((f: any, i: number) => {
                    const meta = CATEGORY_META[f.category] ?? CATEGORY_META["gendered"];
                    return (
                      <div key={i} style={{ borderRadius: 14, border: `1px solid ${SEVERITY_COLOR[f.severity]}30`, overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
                        <div style={{ padding: "14px 18px", background: SEVERITY_BG[f.severity], display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: SEVERITY_COLOR[f.severity], color: "#000", textTransform: "capitalize" }}>{f.severity}</span>
                          <div>
                            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 6, border: `1px solid ${SEVERITY_COLOR[f.severity]}40` }}>"{f.phrase}"</span>
                            <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 8 }}>{meta.label} · {f.section}</span>
                          </div>
                          <ArrowRight size={14} color="#64748B" />
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, color: "#2DD4BF", fontWeight: 500 }}>{f.neutral_alternative}</span>
                            <button onClick={() => copyAlt(f.neutral_alternative, `flag-${i}`)}
                              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(45, 212, 191, 0.3)", background: copied === `flag-${i}` ? "#1D9E75" : "rgba(45, 212, 191, 0.1)", color: copied === `flag-${i}` ? "#fff" : "#2DD4BF", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                              {copied === `flag-${i}` ? "✓" : <Copy size={11} />}
                            </button>
                          </div>
                        </div>
                        <div style={{ padding: "10px 18px", fontSize: 12.5, color: "#94A3B8", borderTop: `1px solid ${SEVERITY_COLOR[f.severity]}15` }}>
                          <strong style={{ color: "#E2E8F0" }}>Why it matters:</strong> {f.why}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Positive signals */}
            {result.positive_signals?.length > 0 && (
              <div style={{ background: "rgba(45, 212, 191, 0.06)", border: "1px solid rgba(45, 212, 191, 0.2)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#2DD4BF" }}>✓ Inclusive language you're already using well</h3>
                {result.positive_signals.map((s: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid #2DD4BF" }}>{s}</div>
                ))}
              </div>
            )}

            {/* Priority fixes */}
            {result.priority_fixes?.length > 0 && (
              <div style={{ background: "rgba(251, 191, 36, 0.06)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#FBBF24" }}>Priority fixes</h3>
                {result.priority_fixes.map((fix: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "#FDE68A", alignItems: "flex-start" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#D97706", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    {fix}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
              Scan another resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
