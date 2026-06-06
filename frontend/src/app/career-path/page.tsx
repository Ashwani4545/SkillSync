"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Loader2, ChevronDown, ChevronUp, ArrowRight, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

const POLL_MS = 2500;

export default function CareerPathPage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [taskId, setTaskId]     = useState<string | null>(null);
  const [result, setResult]     = useState<any | null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"polling"|"done"|"error">("idle");
  const [error, setError]       = useState("");
  const [openRole, setOpenRole] = useState<number>(0);

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  useEffect(() => {
    if (!taskId || status !== "polling") return;
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/career/result/${taskId}`);
        if (data.status === "done")   { setResult(data.result); setStatus("done"); }
        else if (data.status === "failed") { setError(data.error || "Prediction failed"); setStatus("error"); }
      } catch { /* keep polling */ }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [taskId, status]);

  const handlePredict = async () => {
    if (!resumeId) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/career/trajectory", { resume_id: resumeId });
      setTaskId(data.task_id);
      setStatus("polling");
    } catch (e: any) {
      setError(e.message || "Failed to start prediction.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Career Path Predictor</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            AI analyzes your resume to predict your next 2 realistic roles, identify skill gaps, and map your path to your 3–5 year goal.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>SELECT RESUME</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {resumes.length === 0
                  ? <p style={{ fontSize: 14, color: "var(--gray-400)" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "var(--teal-700)" }}>Upload one →</a></p>
                  : resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ padding: "9px 16px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "var(--teal-700)" : "var(--gray-700)" }}>
                      {r.filename}
                    </button>
                  ))
                }
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handlePredict} disabled={!resumeId}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: !resumeId ? "var(--gray-200)" : "var(--teal-700)", color: !resumeId ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} /> Predict my career path
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Mapping your career trajectory</h2>
            <p style={{ color: "var(--gray-500)" }}>Analyzing your experience, skills, and industry patterns...</p>
          </div>
        )}

        {status === "done" && result && (
          <CareerResults result={result} openRole={openRole} setOpenRole={setOpenRole}
            onReset={() => { setStatus("idle"); setResult(null); }} />
        )}
      </div>
    </div>
  );
}

function CareerResults({ result, openRole, setOpenRole, onReset }: any) {
  const current    = result.current_level ?? {};
  const nextRoles  = result.next_roles ?? [];
  const stretch    = result.stretch_role;
  const risks      = result.career_risks ?? [];

  return (
    <div>
      {/* Current level card */}
      <div style={{ background: "var(--teal-700)", borderRadius: "var(--radius-xl)", padding: "28px 32px", marginBottom: 24, color: "#fff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Current level — {current.confidence} confidence</div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne", marginBottom: 6 }}>{current.title || "Unknown"}</div>
        <div style={{ fontSize: 14, opacity: 0.8, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>~{current.years_experience} years experience</span>
          <span style={{ textTransform: "capitalize" }}>Seniority: {current.seniority}</span>
        </div>
        {result.unique_advantage && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", fontSize: 14, fontStyle: "italic", opacity: 0.9 }}>
            ✦ {result.unique_advantage}
          </div>
        )}
      </div>

      {/* Trajectory flow */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 16px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-700)", fontSize: 13, fontWeight: 700 }}>Now</div>
        <ArrowRight size={16} color="var(--gray-300)" />
        {nextRoles.slice(0, 2).map((r: any, i: number) => (
          <>
            <div key={i} style={{ padding: "8px 16px", borderRadius: 20, background: "var(--blue-50)", color: "var(--blue-700)", fontSize: 13, fontWeight: 700 }}>{r.timeline}</div>
            {i === 0 && <ArrowRight size={16} color="var(--gray-300)" />}
          </>
        ))}
        {stretch && (
          <>
            <ArrowRight size={16} color="var(--gray-300)" />
            <div style={{ padding: "8px 16px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)", fontSize: 13, fontWeight: 700 }}>3–5 years</div>
          </>
        )}
      </div>

      {/* Next roles */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Your next 2 realistic roles</h2>
      {nextRoles.map((role: any, i: number) => (
        <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", marginBottom: 16, overflow: "hidden" }}>
          <button onClick={() => setOpenRole(openRole === i ? -1 : i)}
            style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--blue-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue-700)", fontFamily: "Syne", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--gray-900)", marginBottom: 4 }}>{role.title}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--gray-400)" }}>⏱ {role.timeline}</span>
                <span style={{ fontSize: 12, color: "var(--teal-700)", fontWeight: 600 }}>💰 {role.salary_range}</span>
                <span style={{ fontSize: 12, padding: "1px 8px", borderRadius: 20, background: role.probability >= 70 ? "var(--teal-50)" : "var(--amber-50)", color: role.probability >= 70 ? "var(--teal-700)" : "var(--amber-700)", fontWeight: 700 }}>
                  {role.probability}% likely
                </span>
              </div>
            </div>
            {openRole === i ? <ChevronUp size={18} color="var(--gray-400)" /> : <ChevronDown size={18} color="var(--gray-400)" />}
          </button>

          {openRole === i && (
            <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--gray-100)" }}>
              <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, margin: "16px 0 20px" }}>{role.why_realistic}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {/* Skill gaps */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--coral-700)", marginBottom: 10 }}>SKILL GAPS TO FILL</div>
                  {(role.required_skills ?? []).map((s: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: "var(--gray-700)", alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral-500)", flexShrink: 0, marginTop: 5 }} />
                      {s}
                    </div>
                  ))}
                </div>
                {/* Existing strengths */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", marginBottom: 10 }}>STRENGTHS YOU ALREADY HAVE</div>
                  {(role.existing_strengths ?? []).map((s: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: "var(--gray-700)", alignItems: "flex-start" }}>
                      <CheckCircle size={13} color="var(--teal-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action plan */}
              {role.action_plan?.length > 0 && (
                <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", marginBottom: 12 }}>ACTION PLAN</div>
                  {role.action_plan.map((step: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: "var(--gray-800)", alignItems: "flex-start" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--teal-700)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{j + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Stretch role */}
      {stretch && (
        <div style={{ background: "var(--purple-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--purple-500)30", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Star size={20} color="var(--purple-700)" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-700)", marginBottom: 2 }}>3–5 YEAR STRETCH GOAL</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{stretch.title}</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, marginBottom: 12 }}>{stretch.gap_summary}</p>
          {stretch.key_milestones?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-700)", marginBottom: 8 }}>KEY MILESTONES</div>
              {stretch.key_milestones.map((m: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 14, color: "var(--gray-700)" }}>
                  <ArrowRight size={14} color="var(--purple-500)" style={{ flexShrink: 0, marginTop: 3 }} /> {m}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Career risks */}
      {risks.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} color="var(--amber-700)" />
            <h3 style={{ margin: 0, fontSize: 15, color: "var(--gray-900)" }}>Risks to watch</h3>
          </div>
          {risks.map((r: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid var(--amber-400)" }}>{r}</div>
          ))}
        </div>
      )}

      <button onClick={onReset} style={{ padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
        Predict for another resume
      </button>
    </div>
  );
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Career Path</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)" }}>CAREER</span>
      </div>
    </div>
  );
}
