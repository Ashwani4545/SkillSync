"use client";
import { useState, useEffect } from "react";
import { DollarSign, Loader2, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";

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
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Salary Calibrator</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Understand your market value based on your resume strength, target role, and location.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Resume */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 10 }}>RESUME</label>
                {resumes.map(r => (
                  <button key={r.id} onClick={() => setResumeId(r.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", marginBottom: 6, cursor: "pointer", fontSize: 12, fontWeight: resumeId === r.id ? 600 : 400 }}>
                    {r.filename}
                  </button>
                ))}
              </div>
              {/* Role */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 10 }}>TARGET ROLE</label>
                <div style={{ position: "relative" }}>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 13, background: "#fff", appearance: "none", outline: "none", cursor: "pointer", color: role ? "var(--gray-900)" : "var(--gray-400)" }}>
                    <option value="">Select role...</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} />
                </div>
              </div>
              {/* Location */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 10 }}>LOCATION</label>
                <div style={{ position: "relative" }}>
                  <select value={location} onChange={e => setLocation(e.target.value)}
                    style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 13, background: "#fff", appearance: "none", outline: "none", cursor: "pointer" }}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleEstimate} disabled={!resumeId || !role}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (!resumeId || !role) ? "var(--gray-200)" : "var(--teal-700)", color: (!resumeId || !role) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={18} /> Estimate my salary
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Calibrating your market value</h2>
            <p style={{ color: "var(--gray-500)" }}>Analyzing your resume strength against {role} market data...</p>
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
  const pctColor = pct >= 65 ? "var(--teal-700)" : pct >= 40 ? "var(--amber-700)" : "var(--coral-700)";
  const trendIcon = result.market_trend === "rising"
    ? <TrendingUp size={16} color="var(--teal-700)" />
    : result.market_trend === "declining"
    ? <TrendingDown size={16} color="var(--coral-700)" />
    : null;

  return (
    <div>
      {/* Main salary card */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", padding: "32px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Range */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 8 }}>BASE SALARY RANGE — {result.default_location}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "var(--gray-400)" }}>{fmt(base.low)}</span>
              <span style={{ fontSize: 42, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>{fmt(base.mid)}</span>
              <span style={{ fontSize: 14, color: "var(--gray-400)" }}>{fmt(base.high)}</span>
            </div>
            {/* Salary bar */}
            <div style={{ position: "relative", height: 10, background: "var(--gray-100)", borderRadius: 5, marginBottom: 6 }}>
              <div style={{ position: "absolute", left: "10%", width: "80%", height: "100%", background: "var(--teal-100)", borderRadius: 5 }} />
              <div style={{ position: "absolute", left: `${pct}%`, top: -4, width: 3, height: 18, background: "var(--teal-700)", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-400)", display: "flex", justifyContent: "space-between" }}>
              <span>Market low</span><span>Market high</span>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 6 }}>TOTAL COMPENSATION (incl. bonus + equity)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "var(--gray-400)" }}>{fmt(total.low)}</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", fontFamily: "Syne" }}>{fmt(total.mid)}</span>
                <span style={{ fontSize: 13, color: "var(--gray-400)" }}>{fmt(total.high)}</span>
              </div>
            </div>
          </div>

          {/* Percentile */}
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: pctColor, fontFamily: "Syne", lineHeight: 1 }}>{pct}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>market percentile</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 13, color: "var(--gray-500)", textTransform: "capitalize" }}>
              {trendIcon} {result.market_trend} market
            </div>
          </div>
        </div>
      </div>

      {/* Location multipliers */}
      {Object.keys(mults).length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Salary by location</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {Object.entries(mults).map(([loc, mult]: [string, any]) => (
              <div key={loc} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 4 }}>{loc}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)", fontFamily: "Syne" }}>{fmt(Math.round(base.mid * mult))}</div>
                <div style={{ fontSize: 11, color: mult >= 1.1 ? "var(--teal-700)" : mult <= 0.9 ? "var(--coral-700)" : "var(--gray-400)", fontWeight: 600 }}>
                  {mult >= 1 ? "+" : ""}{Math.round((mult - 1) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {result.factors_boosting_salary?.length > 0 && (
          <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--teal-700)" }}>What's boosting your value</h3>
            {result.factors_boosting_salary.map((f: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--teal-500)" }}>{f}</div>
            ))}
          </div>
        )}
        {result.factors_limiting_salary?.length > 0 && (
          <div style={{ background: "var(--coral-50)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--coral-700)" }}>What's limiting your earnings</h3>
            {result.factors_limiting_salary.map((f: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--coral-500)" }}>{f}</div>
            ))}
          </div>
        )}
      </div>

      {result.negotiation_tips?.length > 0 && (
        <div style={{ background: "var(--amber-50)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--amber-700)" }}>💡 Negotiation tips</h3>
          {result.negotiation_tips.map((tip: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--gray-700)", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, color: "var(--amber-700)", flexShrink: 0 }}>{i + 1}.</span> {tip}
            </div>
          ))}
        </div>
      )}

      {result.market_trend_reason && (
        <div style={{ padding: "12px 16px", background: "var(--blue-50)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--blue-700)", marginBottom: 24 }}>
          <strong>Market trend:</strong> {result.market_trend_reason}
        </div>
      )}

      <button onClick={onReset} style={{ padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
        Estimate for another role
      </button>
    </div>
  );
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Salary Calibrator</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)" }}>CAREER</span>
      </div>
    </div>
  );
}
