"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Loader2, ChevronDown, ChevronUp, ArrowRight, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Career Path" badge="CAREER" badgeColor="#C084FC" />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Career Path Predictor</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            AI analyzes your resume to predict your next 2 realistic roles, identify skill gaps, and map your path to your 3–5 year goal.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>SELECT RESUME</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {resumes.length === 0
                  ? <p style={{ fontSize: 14, color: "#94A3B8" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
                  : resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${resumeId === r.id ? "#A855F7" : "rgba(255, 255, 255, 0.1)"}`, background: resumeId === r.id ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.03)", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#D8B4FE" : "#E2E8F0", transition: "all 0.2s ease" }}>
                      {r.filename}
                    </button>
                  ))
                }
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handlePredict} disabled={!resumeId}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: !resumeId ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)", color: !resumeId ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: !resumeId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: resumeId ? "0 0 20px rgba(147, 51, 234, 0.35)" : "none", transition: "all 0.2s ease" }}>
              <TrendingUp size={18} /> Predict my career path
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
              <Loader2 size={28} color="#C084FC" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Mapping your career trajectory</h2>
            <p style={{ color: "#94A3B8" }}>Analyzing your experience, skills, and industry patterns...</p>
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
      <div style={{ background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, border: "1px solid rgba(168, 85, 247, 0.3)", backdropFilter: "blur(12px)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#C084FC", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Current level — {current.confidence} confidence</div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne, sans-serif", marginBottom: 6, color: "#FFFFFF" }}>{current.title || "Unknown"}</div>
        <div style={{ fontSize: 14, color: "#94A3B8", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>~{current.years_experience} years experience</span>
          <span style={{ textTransform: "capitalize" }}>Seniority: {current.seniority}</span>
        </div>
        {result.unique_advantage && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontStyle: "italic", color: "#F1F5F9" }}>
            ✦ {result.unique_advantage}
          </div>
        )}
      </div>

      {/* Trajectory flow */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(45, 212, 191, 0.15)", color: "#2DD4BF", fontSize: 13, fontWeight: 700, border: "1px solid rgba(45, 212, 191, 0.3)" }}>Now</div>
        <ArrowRight size={16} color="#64748B" />
        {nextRoles.slice(0, 2).map((r: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(96, 165, 250, 0.15)", color: "#60A5FA", fontSize: 13, fontWeight: 700, border: "1px solid rgba(96, 165, 250, 0.3)" }}>{r.timeline}</div>
            {i === 0 && <ArrowRight size={16} color="#64748B" />}
          </div>
        ))}
        {stretch && (
          <>
            <ArrowRight size={16} color="#64748B" />
            <div style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(192, 132, 252, 0.15)", color: "#C084FC", fontSize: 13, fontWeight: 700, border: "1px solid rgba(192, 132, 252, 0.3)" }}>3–5 years</div>
          </>
        )}
      </div>

      {/* Next roles */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, fontFamily: "Syne, sans-serif" }}>Your next 2 realistic roles</h2>
      {nextRoles.map((role: any, i: number) => (
        <div key={i} style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: 16, overflow: "hidden" }}>
          <button onClick={() => setOpenRole(openRole === i ? -1 : i)}
            style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(96, 165, 250, 0.15)", border: "1px solid rgba(96, 165, 250, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60A5FA", fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#FFFFFF", marginBottom: 4 }}>{role.title}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>⏱ {role.timeline}</span>
                <span style={{ fontSize: 12, color: "#2DD4BF", fontWeight: 600 }}>💰 {role.salary_range}</span>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: role.probability >= 70 ? "rgba(45, 212, 191, 0.15)" : "rgba(251, 191, 36, 0.15)", color: role.probability >= 70 ? "#2DD4BF" : "#FBBF24", fontWeight: 700, border: `1px solid ${role.probability >= 70 ? "rgba(45, 212, 191, 0.3)" : "rgba(251, 191, 36, 0.3)"}` }}>
                  {role.probability}% likely
                </span>
              </div>
            </div>
            {openRole === i ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
          </button>

          {openRole === i && (
            <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6, margin: "16px 0 20px" }}>{role.why_realistic}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {/* Skill gaps */}
                <div style={{ background: "rgba(239, 68, 68, 0.06)", padding: "16px", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F87171", marginBottom: 10 }}>SKILL GAPS TO FILL</div>
                  {(role.required_skills ?? []).map((s: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: "#FCA5A5", alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", flexShrink: 0, marginTop: 5 }} />
                      {s}
                    </div>
                  ))}
                </div>
                {/* Existing strengths */}
                <div style={{ background: "rgba(45, 212, 191, 0.06)", padding: "16px", borderRadius: 12, border: "1px solid rgba(45, 212, 191, 0.15)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2DD4BF", marginBottom: 10 }}>STRENGTHS YOU ALREADY HAVE</div>
                  {(role.existing_strengths ?? []).map((s: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: "#5EEAD4", alignItems: "flex-start" }}>
                      <CheckCircle size={13} color="#2DD4BF" style={{ flexShrink: 0, marginTop: 2 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action plan */}
              {role.action_plan?.length > 0 && (
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2DD4BF", marginBottom: 12 }}>ACTION PLAN</div>
                  {role.action_plan.map((step: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: "#E2E8F0", alignItems: "flex-start" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{j + 1}</span>
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
        <div style={{ background: "rgba(168, 85, 247, 0.1)", borderRadius: 18, border: "1px solid rgba(168, 85, 247, 0.25)", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Star size={20} color="#C084FC" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#C084FC", marginBottom: 2 }}>3–5 YEAR STRETCH GOAL</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>{stretch.title}</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6, marginBottom: 12 }}>{stretch.gap_summary}</p>
          {stretch.key_milestones?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#C084FC", marginBottom: 8 }}>KEY MILESTONES</div>
              {stretch.key_milestones.map((m: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 14, color: "#E2E8F0" }}>
                  <ArrowRight size={14} color="#C084FC" style={{ flexShrink: 0, marginTop: 3 }} /> {m}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Career risks */}
      {risks.length > 0 && (
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} color="#FBBF24" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>Risks to watch</h3>
          </div>
          {risks.map((r: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #FBBF24" }}>{r}</div>
          ))}
        </div>
      )}

      <button onClick={onReset} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
        Predict for another resume
      </button>
    </div>
  );
}
