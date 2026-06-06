"use client";
import { useState, useEffect } from "react";
import { Shield, Loader2, AlertTriangle, CheckCircle, ArrowRight, Copy } from "lucide-react";
import { apiClient } from "@/lib/api";

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  gendered:      { label: "Gendered language",   color: "var(--coral-700)",  bg: "var(--coral-50)",  icon: "♀♂" },
  age_signalling:{ label: "Age signalling",       color: "var(--amber-700)",  bg: "var(--amber-50)",  icon: "📅" },
  ability:       { label: "Ability-normative",    color: "var(--blue-700)",   bg: "var(--blue-50)",   icon: "♿" },
  prestige:      { label: "Prestige / class",     color: "var(--purple-700)", bg: "var(--purple-50)", icon: "🎓" },
  cultural:      { label: "Cultural marker",      color: "var(--teal-700)",   bg: "var(--teal-50)",   icon: "🌍" },
};

const SEVERITY_COLOR: Record<string, string> = {
  high:   "var(--coral-700)",
  medium: "var(--amber-700)",
  low:    "var(--blue-700)",
};
const SEVERITY_BG: Record<string, string> = {
  high:   "var(--coral-50)",
  medium: "var(--amber-50)",
  low:    "var(--blue-50)",
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
  const scoreColor     = score === null ? "var(--gray-400)" : score >= 85 ? "var(--teal-700)" : score >= 65 ? "var(--amber-700)" : "var(--coral-700)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Bias & Inclusivity Scanner</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Detect gendered language, age-signalling phrases, and other markers that may trigger unconscious bias in human reviewers — before they see your resume.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>SELECT RESUME TO SCAN</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {resumes.length === 0
                  ? <p style={{ fontSize: 14, color: "var(--gray-400)" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "var(--teal-700)" }}>Upload one →</a></p>
                  : resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ padding: "9px 16px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "var(--teal-700)" : "var(--gray-700)" }}>
                      {r.filename}
                    </button>
                  ))}
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleScan} disabled={!resumeId}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: !resumeId ? "var(--gray-200)" : "var(--teal-700)", color: !resumeId ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={18} /> Scan for bias
            </button>
          </>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Scanning for bias patterns</h2>
            <p style={{ color: "var(--gray-500)" }}>Checking gendered language, age signals, and exclusionary phrases...</p>
          </div>
        )}

        {status === "done" && result && (
          <div>
            {/* Score hero */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", padding: "28px 32px", marginBottom: 20, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 68, fontWeight: 800, color: scoreColor, fontFamily: "Syne", lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>inclusivity score</div>
                <div style={{ fontSize: 12, color: scoreColor, fontWeight: 700, marginTop: 4 }}>
                  {score >= 85 ? "Excellent" : score >= 65 ? "Needs attention" : "Significant issues"}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {/* Category badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {Object.entries(result.bias_categories ?? {}).map(([key, cat]: [string, any]) => {
                    const meta = CATEGORY_META[key] ?? { label: key, color: "var(--gray-500)", bg: "var(--gray-100)", icon: "•" };
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: cat.found ? meta.bg : "var(--gray-50)", border: `1px solid ${cat.found ? meta.color + "30" : "var(--gray-200)"}` }}>
                        <span style={{ fontSize: 14 }}>{meta.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: cat.found ? meta.color : "var(--gray-400)" }}>{meta.label}</span>
                        {cat.found && <span style={{ fontSize: 11, background: meta.color, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cat.count}</span>}
                        {!cat.found && <CheckCircle size={12} color="var(--teal-500)" />}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
              </div>
            </div>

            {/* Flagged phrases */}
            {flagged.length === 0 ? (
              <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 28, textAlign: "center", marginBottom: 20 }}>
                <CheckCircle size={44} color="var(--teal-500)" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: 18, color: "var(--teal-700)", marginBottom: 8 }}>No bias detected</h3>
                <p style={{ color: "var(--gray-500)", fontSize: 14 }}>Your resume uses inclusive, neutral language throughout.</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>Phrases to revise</h3>
                <p style={{ color: "var(--gray-500)", fontSize: 13, marginBottom: 20 }}>{flagged.length} issue{flagged.length !== 1 ? "s" : ""} found · Click a phrase to see alternatives</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {flagged.map((f: any, i: number) => {
                    const meta = CATEGORY_META[f.category] ?? CATEGORY_META["gendered"];
                    return (
                      <div key={i} style={{ borderRadius: "var(--radius-md)", border: `1px solid ${SEVERITY_COLOR[f.severity]}20`, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: SEVERITY_BG[f.severity], display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: SEVERITY_COLOR[f.severity], color: "#fff", textTransform: "capitalize" }}>{f.severity}</span>
                          <div>
                            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 600, color: "var(--gray-900)", background: SEVERITY_COLOR[f.severity] + "15", padding: "2px 6px", borderRadius: 4 }}>"{f.phrase}"</span>
                            <span style={{ fontSize: 11, color: "var(--gray-400)", marginLeft: 8 }}>{meta.label} · {f.section}</span>
                          </div>
                          <ArrowRight size={14} color="var(--gray-400)" />
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, color: "var(--teal-700)", fontWeight: 500 }}>{f.neutral_alternative}</span>
                            <button onClick={() => copyAlt(f.neutral_alternative, `flag-${i}`)}
                              style={{ padding: "4px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--teal-200)", background: copied === `flag-${i}` ? "var(--teal-700)" : "#fff", color: copied === `flag-${i}` ? "#fff" : "var(--teal-700)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                              {copied === `flag-${i}` ? "✓" : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                        <div style={{ padding: "8px 16px", fontSize: 12, color: "var(--gray-500)", borderTop: `1px solid ${SEVERITY_COLOR[f.severity]}15` }}>
                          <strong>Why it matters:</strong> {f.why}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Positive signals */}
            {result.positive_signals?.length > 0 && (
              <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--teal-700)" }}>✓ Inclusive language you're already using well</h3>
                {result.positive_signals.map((s: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--teal-500)" }}>{s}</div>
                ))}
              </div>
            )}

            {/* Priority fixes */}
            {result.priority_fixes?.length > 0 && (
              <div style={{ background: "var(--amber-50)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--amber-700)" }}>Priority fixes</h3>
                {result.priority_fixes.map((fix: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "var(--gray-800)", alignItems: "flex-start" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--amber-700)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    {fix}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
              Scan another resume
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
      <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Bias Scanner</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)" }}>CAREER</span>
      </div>
    </div>
  );
}
