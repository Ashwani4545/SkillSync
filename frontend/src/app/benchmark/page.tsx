"use client";
import { useState, useEffect } from "react";
import { Target, Loader2, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Benchmark" badge="PRO" badgeColor="#FBBF24" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Industry Benchmark</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 15, margin: 0 }}>
            See how your resume compares against the top 10% of candidates in your target role and industry.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Resume */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>RESUME</label>
                {resumes.map(r => (
                  <button key={r.id} onClick={() => setResumeId(r.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: "10px", border: `1.5px solid ${resumeId === r.id ? "#2DD4BF" : "rgba(255, 255, 255, 0.08)"}`, background: resumeId === r.id ? "rgba(29, 158, 117, 0.15)" : "rgba(255, 255, 255, 0.02)", marginBottom: 6, cursor: "pointer", fontSize: 12, fontWeight: resumeId === r.id ? 700 : 500, color: "#ffffff" }}
                  >
                    {r.filename}
                  </button>
                ))}
              </div>

              {/* Role */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>TARGET ROLE</label>
                <div style={{ position: "relative" }}>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: "100%", padding: "11px 32px 11px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 13, color: role ? "#ffffff" : "rgba(255, 255, 255, 0.4)", background: "rgba(255, 255, 255, 0.05)", appearance: "none", outline: "none", cursor: "pointer" }}
                  >
                    <option value="" style={{ background: "#0A0F1E" }}>Select a role...</option>
                    {ROLES.map(r => <option key={r} value={r} style={{ background: "#0A0F1E" }}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.5)", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Industry */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>INDUSTRY</label>
                <div style={{ position: "relative" }}>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    style={{ width: "100%", padding: "11px 32px 11px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 13, color: "#ffffff", background: "rgba(255, 255, 255, 0.05)", appearance: "none", outline: "none", cursor: "pointer", textTransform: "capitalize" }}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: "#0A0F1E", textTransform: "capitalize" }}>{i}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.5)", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(248, 113, 113, 0.15)", borderLeft: "4px solid #F87171", borderRadius: "8px", color: "#FCA5A5", fontSize: 14, marginBottom: 20 }}>{error}</div>}

            <button onClick={handleRun} disabled={!resumeId || !role}
              style={{ padding: "14px 32px", borderRadius: "12px", border: "none", background: (!resumeId || !role) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: (!resumeId || !role) ? "rgba(255, 255, 255, 0.3)" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!resumeId || !role) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (!resumeId || !role) ? "none" : "0 0 20px rgba(29, 158, 117, 0.3)", transition: "all 0.2s" }}
            >
              <Target size={18} /> Run benchmark
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(29, 158, 117, 0.3)" }}>
              <Loader2 size={28} color="#2DD4BF" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Benchmarking your resume</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Comparing against top {role} candidates in {industry}...</p>
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
      <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 32, marginBottom: 20, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", minWidth: 120 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: pct >= 70 ? "#2DD4BF" : pct >= 45 ? "#FBBF24" : "#F87171", fontFamily: "Syne", lineHeight: 1 }}>{pct}</div>
          <div style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.6)", marginTop: 4 }}>percentile</div>
          <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>
            Better than {pct}% of<br />similar candidates
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Percentile bar */}
          <div style={{ position: "relative", height: 12, background: "rgba(255, 255, 255, 0.06)", borderRadius: 6, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, #F87171, #F59E0B, #10B981)`, borderRadius: 6, transition: "width 1s ease" }} />
            <div style={{ position: "absolute", left: `${pct}%`, top: -4, width: 2, height: 20, background: pct >= 70 ? "#2DD4BF" : pct >= 45 ? "#FBBF24" : "#F87171", borderRadius: 1 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.45)" }}>
            <span>Bottom 10%</span><span>Average</span><span>Top 10%</span>
          </div>
          {result.top_gap && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245, 158, 11, 0.12)", borderRadius: "12px", fontSize: 14, color: "#FBBF24", borderLeft: "3px solid #F59E0B" }}>
              <strong>Biggest gap:</strong> {result.top_gap}
            </div>
          )}
        </div>
      </div>

      {/* Dimension radar table */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Your score vs top 10% benchmark</h3>
        {Object.entries(DIM_LABELS).map(([key, label]) => {
          const d = dims[key];
          if (!d) return null;
          const gap = d.gap ?? (d.benchmark_score - d.user_score);
          const ahead = gap <= 0;
          return (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255, 255, 255, 0.85)" }}>{label}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>You: <strong style={{ color: "#ffffff" }}>{d.user_score}</strong></span>
                  <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>Top 10%: <strong style={{ color: "rgba(255, 255, 255, 0.7)" }}>{d.benchmark_score}</strong></span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: ahead ? "rgba(29, 158, 117, 0.15)" : "rgba(248, 113, 113, 0.15)", color: ahead ? "#2DD4BF" : "#F87171" }}>
                    {ahead ? `+${Math.abs(gap)}` : `-${Math.abs(gap)}`}
                  </span>
                </div>
              </div>
              {/* Dual bar */}
              <div style={{ position: "relative", height: 10, background: "rgba(255, 255, 255, 0.06)", borderRadius: 5, overflow: "visible" }}>
                {/* Benchmark bar (ghost) */}
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${d.benchmark_score}%`, background: "rgba(255, 255, 255, 0.12)", borderRadius: 5 }} />
                {/* User bar */}
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${d.user_score}%`, background: ahead ? "#10B981" : "#38BDF8", borderRadius: 5, transition: "width 0.8s ease" }} />
              </div>
              {d.tips?.[0] && <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)", marginTop: 4 }}>{d.tips[0]}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {result.strengths_vs_benchmark?.length > 0 && (
          <div style={{ background: "rgba(29, 158, 117, 0.12)", border: "1px solid rgba(29, 158, 117, 0.25)", borderRadius: "18px", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#2DD4BF", fontFamily: "Syne, sans-serif" }}>Where you're above average</h3>
            {result.strengths_vs_benchmark.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid #2DD4BF" }}>{s}</div>
            ))}
          </div>
        )}
        {result.role_specific_advice?.length > 0 && (
          <div style={{ background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "18px", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#38BDF8", fontFamily: "Syne, sans-serif" }}>Role-specific advice</h3>
            {result.role_specific_advice.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid #38BDF8" }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onReset} style={{ padding: "12px 26px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
        Run another benchmark
      </button>
    </div>
  );
}
