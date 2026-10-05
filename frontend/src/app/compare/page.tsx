"use client";
import { useState, useEffect } from "react";
import { Upload, ArrowRight, Loader2, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

const POLL_MS = 2500;

export default function ComparePage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeA, setResumeA]   = useState("");
  const [resumeB, setResumeB]   = useState("");
  const [jdText, setJdText]     = useState("");
  const [taskId, setTaskId]     = useState<string | null>(null);
  const [result, setResult]     = useState<any | null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"polling"|"done"|"error">("idle");
  const [error, setError]       = useState("");

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  // Poll for result
  useEffect(() => {
    if (!taskId || status !== "polling") return;
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/compare/result/${taskId}`);
        if (data.status === "done")   { setResult(data.result); setStatus("done"); }
        else if (data.status === "failed") { setError(data.error || "Comparison failed"); setStatus("error"); }
      } catch { /* keep polling */ }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [taskId, status, result]);

  const handleCompare = async () => {
    if (!resumeA || !resumeB) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/compare/start", {
        resume_a_id: resumeA,
        resume_b_id: resumeB,
        jd_text: jdText || null,
      });
      setTaskId(data.task_id);
      setStatus("polling");
    } catch (e: any) {
      setError(e.message || "Failed to start comparison.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(167, 139, 250, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="A/B Tester" badge="PRO" badgeColor="#A78BFA" />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Resume A/B Tester</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 15, margin: 0 }}>
            Compare two versions of your resume head-to-head. AI picks the winner and explains exactly why.
          </p>
        </div>

        {status === "idle" || status === "error" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <ResumeSelector label="Resume A" value={resumeA} onChange={setResumeA} resumes={resumes} color="#60A5FA" bg="rgba(56, 189, 248, 0.15)" />
              <ResumeSelector label="Resume B" value={resumeB} onChange={setResumeB} resumes={resumes} color="#C084FC" bg="rgba(167, 139, 250, 0.15)" />
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                JOB DESCRIPTION <span style={{ fontWeight: 400, color: "rgba(255, 255, 255, 0.4)" }}>(optional — greatly improves relevance scoring)</span>
              </label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the job description to compare both resumes against this specific role..."
                rows={4}
                style={{ width: "100%", padding: 14, borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", outline: "none", background: "rgba(255, 255, 255, 0.05)", color: "#ffffff" }}
              />
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(248, 113, 113, 0.15)", borderLeft: "4px solid #F87171", borderRadius: "8px", color: "#FCA5A5", fontSize: 14, marginBottom: 20 }}>{error}</div>}

            <button
              onClick={handleCompare}
              disabled={!resumeA || !resumeB || resumeA === resumeB}
              style={{ padding: "14px 32px", borderRadius: "12px", border: "none", background: (!resumeA || !resumeB || resumeA === resumeB) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: (!resumeA || !resumeB || resumeA === resumeB) ? "rgba(255, 255, 255, 0.3)" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!resumeA || !resumeB || resumeA === resumeB) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (!resumeA || !resumeB || resumeA === resumeB) ? "none" : "0 0 20px rgba(29, 158, 117, 0.3)", transition: "all 0.2s" }}
            >
              <ArrowRight size={18} /> Compare resumes
            </button>
            {resumeA === resumeB && resumeA && <p style={{ fontSize: 13, color: "#FBBF24", marginTop: 8 }}>Select two different resumes to compare.</p>}
          </>
        ) : status === "loading" || status === "polling" ? (
          <ProcessingState />
        ) : status === "done" && result ? (
          <CompareResults
            result={result}
            resumeA={resumes.find(r => r.id === resumeA)}
            resumeB={resumes.find(r => r.id === resumeB)}
            onReset={() => { setStatus("idle"); setResult(null); setTaskId(null); }}
          />
        ) : null}
      </div>
    </div>
  );
}

function ResumeSelector({ label, value, onChange, resumes, color, bg }: any) {
  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: `2px solid ${value ? color : "var(--gray-200)"}`, padding: 20, transition: "border-color .2s" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 12 }}>{label}</div>
      {resumes.length === 0
        ? <p style={{ fontSize: 14, color: "var(--gray-400)" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "var(--teal-700)" }}>Upload →</a></p>
        : resumes.map((r: any) => (
          <button key={r.id} onClick={() => onChange(r.id)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "var(--radius-md)", border: `1.5px solid ${value === r.id ? color : "var(--gray-200)"}`, background: value === r.id ? bg : "#fff", marginBottom: 6, cursor: "pointer", fontSize: 13, transition: "all .15s" }}
          >
            <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.filename}</div>
            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
          </button>
        ))
      }
    </div>
  );
}

const COMPARE_STEPS = ["Loading both resumes...", "Scoring ATS compatibility...", "Comparing tone & content...", "Evaluating relevance...", "Declaring a winner..."];

function ProcessingState() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % COMPARE_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Comparing your resumes</h2>
      <p style={{ color: "var(--gray-500)" }}>{COMPARE_STEPS[idx]}</p>
    </div>
  );
}

function CompareResults({ result, resumeA, resumeB, onReset }: any) {
  const winnerLabel = result.winner === "A" ? resumeA?.filename : result.winner === "B" ? resumeB?.filename : "Tie";
  const dims = result.dimension_scores ?? {};

  const dimMeta: Record<string, string> = {
    ats_match:   "ATS Match",
    content:     "Content Quality",
    tone:        "Tone & Confidence",
    relevance:   "Job Relevance",
    readability: "Readability",
  };

  return (
    <div>
      {/* Winner banner */}
      <div style={{ background: result.winner === "tie" ? "var(--gray-100)" : "var(--teal-700)", borderRadius: "var(--radius-xl)", padding: "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={28} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            {result.winner === "tie" ? "IT'S A TIE" : `WINNER — RESUME ${result.winner}`}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Syne" }}>{winnerLabel}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Confidence: {result.confidence}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
          {["A","B"].map(v => (
            <div key={v} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", fontFamily: "Syne" }}>{result.overall_scores?.[v] ?? "—"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Resume {v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Dimension Breakdown</h3>
        {Object.entries(dimMeta).map(([key, label]) => {
          const d = dims[key];
          if (!d) return null;
          const aWins = d.winner === "A";
          const bWins = d.winner === "B";
          return (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255, 255, 255, 0.85)" }}>{label}</span>
                <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>A: {d.A} · B: {d.B}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 8, alignItems: "center" }}>
                <div style={{ height: 8, background: "rgba(255, 255, 255, 0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${d.A}%`, background: aWins ? "#38BDF8" : "rgba(255, 255, 255, 0.2)", borderRadius: 4 }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  {d.winner === "A" ? <TrendingUp size={14} color="#38BDF8" /> : d.winner === "B" ? <TrendingDown size={14} color="#C084FC" /> : <Minus size={14} color="rgba(255, 255, 255, 0.3)" />}
                </div>
                <div style={{ height: 8, background: "rgba(255, 255, 255, 0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${d.B}%`, background: bWins ? "#C084FC" : "rgba(255, 255, 255, 0.2)", borderRadius: 4 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {result.winner_strengths?.length > 0 && (
          <div style={{ background: "rgba(29, 158, 117, 0.12)", border: "1px solid rgba(29, 158, 117, 0.25)", borderRadius: "18px", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#2DD4BF", fontFamily: "Syne, sans-serif" }}>Why {result.winner === "tie" ? "neither" : `Resume ${result.winner}`} wins</h3>
            {result.winner_strengths.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid #2DD4BF" }}>{s}</div>
            ))}
          </div>
        )}
        {result.best_of_both?.length > 0 && (
          <div style={{ background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "18px", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#38BDF8", fontFamily: "Syne, sans-serif" }}>Best elements from the other version</h3>
            {result.best_of_both.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid #38BDF8" }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      {result.recommendation && (
        <div style={{ padding: "16px 20px", background: "rgba(245, 158, 11, 0.12)", borderRadius: "16px", borderLeft: "4px solid #F59E0B", marginBottom: 24, fontSize: 14, color: "rgba(255, 255, 255, 0.9)", lineHeight: 1.6 }}>
          <strong style={{ color: "#FBBF24" }}>Recommendation:</strong> {result.recommendation}
        </div>
      )}

      <button onClick={onReset} style={{ padding: "12px 26px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
        Compare different resumes
      </button>
    </div>
  );
}
