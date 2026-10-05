"use client";
import { useState, useEffect } from "react";
import { DollarSign, Loader2, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

const POLL_MS = 2500;

const ROLES = [
  "Software Engineer","Senior Software Engineer","Staff Engineer","Principal Engineer",
  "Engineering Manager","Product Manager","Senior Product Manager","Data Scientist",
  "Data Engineer","ML Engineer","DevOps/SRE","UX Designer","Product Designer",
  "Marketing Manager","Sales Manager","Business Analyst","Project Manager",
];

const LOCATIONS = [
  "San Francisco","New York","Austin","Seattle","Boston","Chicago",
  "Remote (US)","London","Berlin","Toronto","Bangalore","Singapore",
];

export default function SalaryPage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [role, setRole]         = useState("");
  const [location, setLocation] = useState("Remote (US)");
  const [taskId, setTaskId]     = useState<string | null>(null);
  const [result, setResult]     = useState<any | null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"polling"|"done"|"error">("idle");
  const [error, setError]       = useState("");

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  useEffect(() => {
    if (!taskId || status !== "polling") return;
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/career/salary/result/${taskId}`);
        if (data.status === "done")   { setResult(data.result); setStatus("done"); }
        else if (data.status === "failed") { setError(data.error || "Estimation failed"); setStatus("error"); }
      } catch { /* keep polling */ }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [taskId, status]);

  const handleEstimate = async () => {
    if (!resumeId || !role) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/career/salary", { resume_id: resumeId, target_role: role, location });
      setTaskId(data.task_id);
      setStatus("polling");
    } catch (e: any) {
      setError(e.message || "Failed to start estimation.");
      setStatus("error");
    }
  };

  const fmt = (n: number) => n ? `$${(n / 1000).toFixed(0)}k` : "—";

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Salary Calibrator" badge="CAREER" badgeColor="#38BDF8" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Salary Calibrator</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            Understand your market value based on your resume strength, target role, and location.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Resume */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>RESUME</label>
                {resumes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#64748B" }}>No resumes. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload →</a></p>
                ) : (
                  resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${resumeId === r.id ? "#38BDF8" : "rgba(255, 255, 255, 0.08)"}`, background: resumeId === r.id ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.02)", marginBottom: 8, cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#7DD3FC" : "#E2E8F0", transition: "all 0.2s ease" }}>
                      {r.filename}
                    </button>
                  ))
                )}
              </div>
              {/* Role */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>TARGET ROLE</label>
                <div style={{ position: "relative" }}>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: "100%", padding: "12px 36px 12px 14px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 13, background: "#0F172A", color: role ? "#F1F5F9" : "#64748B", appearance: "none", outline: "none", cursor: "pointer" }}>
                    <option value="">Select role...</option>
                    {ROLES.map(r => <option key={r} value={r} style={{ background: "#0F172A", color: "#F1F5F9" }}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                </div>
              </div>
              {/* Location */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>LOCATION</label>
                <div style={{ position: "relative" }}>
                  <select value={location} onChange={e => setLocation(e.target.value)}
                    style={{ width: "100%", padding: "12px 36px 12px 14px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 13, background: "#0F172A", color: "#F1F5F9", appearance: "none", outline: "none", cursor: "pointer" }}>
                    {LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0F172A", color: "#F1F5F9" }}>{l}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleEstimate} disabled={!resumeId || !role}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: (!resumeId || !role) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", color: (!resumeId || !role) ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!resumeId || !role) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (resumeId && role) ? "0 0 20px rgba(2, 132, 199, 0.35)" : "none", transition: "all 0.2s ease" }}>
              <DollarSign size={18} /> Estimate my salary
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
              <Loader2 size={28} color="#38BDF8" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Calibrating your market value</h2>
            <p style={{ color: "#94A3B8" }}>Analyzing your resume strength against {role} market data...</p>
          </div>
        )}

        {status === "done" && result && (
          <SalaryResults result={result} fmt={fmt} onReset={() => { setStatus("idle"); setResult(null); }} />
        )}
      </div>
    </div>
  );
}

function SalaryResults({ result, fmt, onReset }: any) {
  const base   = result.base_salary ?? {};
  const total  = result.total_compensation ?? {};
  const mults  = result.location_multipliers ?? {};
  const pct    = result.percentile_position ?? 50;
  const pctColor = pct >= 65 ? "#2DD4BF" : pct >= 40 ? "#FBBF24" : "#F87171";
  const trendIcon = result.market_trend === "rising"
    ? <TrendingUp size={16} color="#2DD4BF" />
    : result.market_trend === "declining"
    ? <TrendingDown size={16} color="#F87171" />
    : null;

  return (
    <div>
      {/* Main salary card */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 20, border: "1px solid rgba(255, 255, 255, 0.08)", padding: "32px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Range */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", marginBottom: 8 }}>BASE SALARY RANGE — {result.default_location}</div>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "#64748B" }}>{fmt(base.low)}</span>
              <span style={{ fontSize: 44, fontWeight: 800, color: "#38BDF8", fontFamily: "Syne, sans-serif" }}>{fmt(base.mid)}</span>
              <span style={{ fontSize: 14, color: "#64748B" }}>{fmt(base.high)}</span>
            </div>
            {/* Salary bar */}
            <div style={{ position: "relative", height: 10, background: "rgba(255, 255, 255, 0.06)", borderRadius: 5, marginBottom: 8 }}>
              <div style={{ position: "absolute", left: "10%", width: "80%", height: "100%", background: "rgba(56, 189, 248, 0.2)", borderRadius: 5 }} />
              <div style={{ position: "absolute", left: `${pct}%`, top: -4, width: 4, height: 18, background: "#38BDF8", borderRadius: 2, boxShadow: "0 0 10px #38BDF8" }} />
            </div>
            <div style={{ fontSize: 12, color: "#64748B", display: "flex", justifyContent: "space-between" }}>
              <span>Market low</span><span>Market high</span>
            </div>

            <div style={{ marginTop: 24, padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>TOTAL COMPENSATION (incl. bonus + equity)</div>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>{fmt(total.low)}</span>
                <span style={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>{fmt(total.mid)}</span>
                <span style={{ fontSize: 13, color: "#64748B" }}>{fmt(total.high)}</span>
              </div>
            </div>
          </div>

          {/* Percentile */}
          <div style={{ textAlign: "center", minWidth: 140, padding: "20px 24px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: pctColor, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>{pct}</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>market percentile</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 13, color: "#E2E8F0", textTransform: "capitalize" }}>
              {trendIcon} {result.market_trend} market
            </div>
          </div>
        </div>
      </div>

      {/* Location multipliers */}
      {Object.keys(mults).length > 0 && (
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>Salary by location</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {Object.entries(mults).map(([loc, mult]: [string, any]) => (
              <div key={loc} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{loc}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>{fmt(Math.round(base.mid * mult))}</div>
                <div style={{ fontSize: 11, color: mult >= 1.1 ? "#2DD4BF" : mult <= 0.9 ? "#F87171" : "#94A3B8", fontWeight: 700, marginTop: 2 }}>
                  {mult >= 1 ? "+" : ""}{Math.round((mult - 1) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {result.factors_boosting_salary?.length > 0 && (
          <div style={{ background: "rgba(45, 212, 191, 0.06)", border: "1px solid rgba(45, 212, 191, 0.2)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#2DD4BF" }}>What's boosting your value</h3>
            {result.factors_boosting_salary.map((f: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #2DD4BF" }}>{f}</div>
            ))}
          </div>
        )}
        {result.factors_limiting_salary?.length > 0 && (
          <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#F87171" }}>What's limiting your earnings</h3>
            {result.factors_limiting_salary.map((f: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #EF4444" }}>{f}</div>
            ))}
          </div>
        )}
      </div>

      {result.negotiation_tips?.length > 0 && (
        <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#FBBF24" }}>💡 Negotiation tips</h3>
          {result.negotiation_tips.map((tip: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#FDE68A", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, color: "#FBBF24", flexShrink: 0 }}>{i + 1}.</span> {tip}
            </div>
          ))}
        </div>
      )}

      {result.market_trend_reason && (
        <div style={{ padding: "14px 18px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 12, fontSize: 14, color: "#7DD3FC", marginBottom: 24 }}>
          <strong style={{ color: "#BAE6FD" }}>Market trend:</strong> {result.market_trend_reason}
        </div>
      )}

      <button onClick={onReset} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
        Estimate for another role
      </button>
    </div>
  );
}
