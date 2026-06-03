"use client";
import { useState, useEffect } from "react";
import { Target, Loader2, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";

const POLL_MS = 2500;

const ROLES = [
  "Software Engineer","Senior Software Engineer","Product Manager","Data Scientist",
  "Data Analyst","DevOps Engineer","UX Designer","Marketing Manager","Sales Manager",
  "Business Analyst","Project Manager","Full Stack Developer","Backend Engineer",
  "Frontend Engineer","Machine Learning Engineer","Cloud Architect",
];
const INDUSTRIES = [
  "technology","finance","healthcare","e-commerce","consulting",
  "media","education","government","manufacturing","retail",
];

const DIM_LABELS: Record<string, string> = {
  bullet_quality:   "Bullet quality",
  keyword_density:  "Keyword density",
  quantification:   "Quantification",
  experience_depth: "Experience depth",
  skills_relevance: "Skills relevance",
  structure:        "Structure",
};

export default function BenchmarkPage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [role, setRole]         = useState("");
  const [industry, setIndustry] = useState("technology");
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
        const { data } = await apiClient.get(`/benchmark/result/${taskId}`);
        if (data.status === "done")   { setResult(data.result); setStatus("done"); }
        else if (data.status === "failed") { setError(data.error || "Benchmark failed"); setStatus("error"); }
      } catch { /* keep polling */ }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [taskId, status]);

  const handleRun = async () => {
    if (!resumeId || !role) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/benchmark/run", { resume_id: resumeId, target_role: role, industry });
      setTaskId(data.task_id);
      setStatus("polling");
    } catch (e: any) {
      setError(e.message || "Failed to start benchmark.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Industry Benchmark</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            See how your resume compares against the top 10% of candidates in your target role and industry.
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
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", marginBottom: 6, cursor: "pointer", fontSize: 12, fontWeight: resumeId === r.id ? 600 : 400, color: "var(--gray-800)" }}
                  >
                    {r.filename}
                  </button>
                ))}
              </div>

              {/* Role */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 10 }}>TARGET ROLE</label>
                <div style={{ position: "relative" }}>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 13, color: role ? "var(--gray-900)" : "var(--gray-400)", background: "#fff", appearance: "none", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Select a role...</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Industry */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 10 }}>INDUSTRY</label>
                <div style={{ position: "relative" }}>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 13, color: "var(--gray-900)", background: "#fff", appearance: "none", outline: "none", cursor: "pointer", textTransform: "capitalize" }}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i} style={{ textTransform: "capitalize" }}>{i}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleRun} disabled={!resumeId || !role}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (!resumeId || !role) ? "var(--gray-200)" : "var(--teal-700)", color: (!resumeId || !role) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <Target size={18} /> Run benchmark
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Benchmarking your resume</h2>
            <p style={{ color: "var(--gray-500)" }}>Comparing against top {role} candidates in {industry}...</p>
          </div>
        )}

        {status === "done" && result && (
          <BenchmarkResults result={result} onReset={() => { setStatus("idle"); setResult(null); }} />
        )}
      </div>
    </div>
  );
}

function BenchmarkResults({ result, onReset }: { result: any; onReset: () => void }) {
  const pct = result.overall_percentile ?? 50;
  const pctColor = pct >= 70 ? "var(--teal-700)" : pct >= 45 ? "var(--amber-700)" : "var(--coral-700)";
  const dims = result.dimensions ?? {};

  return (
    <div>
      {/* Percentile hero */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", padding: 32, marginBottom: 20, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", minWidth: 120 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: pctColor, fontFamily: "Syne", lineHeight: 1 }}>{pct}</div>
          <div style={{ fontSize: 16, color: "var(--gray-500)", marginTop: 4 }}>percentile</div>
          <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>
            Better than {pct}% of<br />similar candidates
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Percentile bar */}
          <div style={{ position: "relative", height: 12, background: "var(--gray-100)", borderRadius: 6, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, var(--coral-500), var(--amber-500), var(--teal-500))`, borderRadius: 6, transition: "width 1s ease" }} />
            <div style={{ position: "absolute", left: `${pct}%`, top: -4, width: 2, height: 20, background: pctColor, borderRadius: 1 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--gray-400)" }}>
            <span>Bottom 10%</span><span>Average</span><span>Top 10%</span>
          </div>
          {result.top_gap && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--amber-50)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--amber-700)", borderLeft: "3px solid var(--amber-500)" }}>
              <strong>Biggest gap:</strong> {result.top_gap}
            </div>
          )}
        </div>
      </div>

      {/* Dimension radar table */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17 }}>Your score vs top 10% benchmark</h3>
        {Object.entries(DIM_LABELS).map(([key, label]) => {
          const d = dims[key];
          if (!d) return null;
          const gap = d.gap ?? (d.benchmark_score - d.user_score);
          const ahead = gap <= 0;
          return (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>{label}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--gray-400)" }}>You: <strong style={{ color: "var(--gray-900)" }}>{d.user_score}</strong></span>
                  <span style={{ fontSize: 12, color: "var(--gray-400)" }}>Top 10%: <strong style={{ color: "var(--gray-600)" }}>{d.benchmark_score}</strong></span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: ahead ? "var(--teal-50)" : "var(--coral-50)", color: ahead ? "var(--teal-700)" : "var(--coral-700)" }}>
                    {ahead ? `+${Math.abs(gap)}` : `-${Math.abs(gap)}`}
                  </span>
                </div>
              </div>
              {/* Dual bar */}
              <div style={{ position: "relative", height: 10, background: "var(--gray-100)", borderRadius: 5, overflow: "visible" }}>
                {/* Benchmark bar (ghost) */}
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${d.benchmark_score}%`, background: "var(--gray-200)", borderRadius: 5 }} />
                {/* User bar */}
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${d.user_score}%`, background: ahead ? "var(--teal-500)" : "var(--blue-500)", borderRadius: 5, transition: "width 0.8s ease" }} />
              </div>
              {d.tips?.[0] && <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>{d.tips[0]}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {result.strengths_vs_benchmark?.length > 0 && (
          <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--teal-700)" }}>Where you're above average</h3>
            {result.strengths_vs_benchmark.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--teal-500)" }}>{s}</div>
            ))}
          </div>
        )}
        {result.role_specific_advice?.length > 0 && (
          <div style={{ background: "var(--blue-50)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--blue-700)" }}>Role-specific advice</h3>
            {result.role_specific_advice.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--blue-500)" }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onReset} style={{ padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
        Run another benchmark
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
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Benchmark</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-700)" }}>PRO</span>
      </div>
    </div>
  );
}
