"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wand2, ArrowRight, Loader2, CheckCircle, Copy, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

const POLL_MS = 2500;

function JDAdapterContent() {
  const searchParams = useSearchParams();
  const [resumes, setResumes]     = useState<any[]>([]);
  const [resumeId, setResumeId]   = useState(searchParams.get("resume_id") ?? "");
  const [jdText, setJdText]       = useState("");
  const [matchId, setMatchId]     = useState<string | null>(null);
  const [result, setResult]       = useState<any | null>(null);
  const [status, setStatus]       = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]         = useState("");
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  // Poll for result
  useEffect(() => {
    if (!matchId || status === "done" || status === "error") return;
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/jd/${matchId}`);
        if (data.adapted_resume_json) {
          setResult(data);
          setStatus("done");
        }
      } catch { setStatus("error"); setError("Failed to fetch result."); }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [matchId, status, result]);

  const handleSubmit = async () => {
    if (!resumeId || !jdText.trim()) return;
    setStatus("loading"); setError(""); setResult(null); setMatchId(null);
    try {
      const { data } = await apiClient.post("/jd/adapt", { resume_id: resumeId, jd_text: jdText });
      setMatchId(data.id);
    } catch (e: any) {
      setError(e.message || "Failed to start adaptation.");
      setStatus("error");
    }
  };

  const adapted = result?.adapted_resume_json;

  const copyFullResume = () => {
    if (!adapted) return;
    const text = buildPlainText(adapted);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="JD Adapter" badge="PRO" badgeColor="#38BDF8" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>JD Adapter</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 15, margin: 0 }}>
            Paste any job description. Get a tailored version of your resume optimised for that specific role — in one click.
          </p>
        </div>

        {status !== "done" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Resume selector */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                SELECT RESUME
              </label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)" }}>No resumes uploaded yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setResumeId(r.id)}
                      style={{
                        padding: "12px 16px", borderRadius: "12px", textAlign: "left",
                        border: `1.5px solid ${resumeId === r.id ? "#2DD4BF" : "rgba(255, 255, 255, 0.08)"}`,
                        background: resumeId === r.id ? "rgba(29, 158, 117, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer", fontSize: 14, color: "#ffffff", transition: "all .15s",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#ffffff" }}>{r.filename}</div>
                      <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)", marginTop: 2 }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* JD input */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                PASTE JOB DESCRIPTION
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here — the more detail the better..."
                rows={10}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 14, fontFamily: "DM Sans, sans-serif",
                  resize: "vertical", color: "#ffffff", outline: "none", lineHeight: 1.6,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              />
              <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)", marginTop: 8 }}>
                {jdText.length} characters · Aim for 500+ for best results
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "14px 18px", background: "rgba(248, 113, 113, 0.15)", borderLeft: "4px solid #F87171", borderRadius: "8px", color: "#FCA5A5", fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Action button */}
        {status !== "done" && (
          <button
            onClick={handleSubmit}
            disabled={!resumeId || !jdText.trim() || status === "loading"}
            style={{
              padding: "14px 32px", borderRadius: "12px", border: "none",
              background: (!resumeId || !jdText.trim() || status === "loading") ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
              color: (!resumeId || !jdText.trim() || status === "loading") ? "rgba(255, 255, 255, 0.3)" : "#fff",
              fontSize: 15, fontWeight: 700, cursor: (!resumeId || !jdText.trim() || status === "loading") ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: (!resumeId || !jdText.trim() || status === "loading") ? "none" : "0 0 20px rgba(29, 158, 117, 0.3)",
              transition: "all 0.2s",
            }}
          >
            {status === "loading"
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Tailoring your resume...</>
              : <><Wand2 size={18} /> Tailor to this job</>
            }
          </button>
        )}

        {/* Results */}
        {status === "done" && adapted && (
          <AdaptedResumeView
            original={resumes.find(r => r.id === resumeId)}
            adapted={adapted}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onCopy={copyFullResume}
            copied={copied}
            onReset={() => { setStatus("idle"); setResult(null); setMatchId(null); }}
          />
        )}
      </div>
    </div>
  );
}

function AdaptedResumeView({ original, adapted, activeSection, setActiveSection, onCopy, copied, onReset }: any) {
  const changes = adapted.changes_made ?? [];
  const added   = adapted.keywords_added ?? [];
  const sections = ["summary", "experience", "skills", "education"];

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Match before", val: `${adapted.match_score_before ?? "—"}%`, color: "var(--coral-700)", bg: "var(--coral-50)" },
          { label: "Match after",  val: `${adapted.match_score_after  ?? "—"}%`, color: "var(--teal-700)",  bg: "var(--teal-50)"  },
          { label: "Keywords added", val: added.length, color: "var(--blue-700)", bg: "var(--blue-50)" },
          { label: "Changes made",   val: changes.length, color: "var(--purple-700)", bg: "var(--purple-50)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: "1 1 120px", background: s.bg, borderRadius: "var(--radius-lg)", padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.val}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Main adapted resume viewer */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", gap: 6 }}>
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeSection === s ? 700 : 500,
                  color: activeSection === s ? "#2DD4BF" : "rgba(255, 255, 255, 0.55)",
                  borderBottom: activeSection === s ? "2px solid #2DD4BF" : "2px solid transparent",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ padding: 24 }}>
            <SectionViewer section={activeSection} adapted={adapted} />
          </div>
        </div>

        {/* Sidebar: changes + keywords */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {added.length > 0 && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#2DD4BF", fontFamily: "Syne, sans-serif" }}>Keywords Added</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {added.map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "rgba(29, 158, 117, 0.15)", color: "#2DD4BF", border: "1px solid rgba(29, 158, 117, 0.3)" }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {changes.length > 0 && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#ffffff", fontFamily: "Syne, sans-serif" }}>Changes Made</h3>
              {changes.map((c: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #2DD4BF", lineHeight: 1.5 }}>{c}</div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={onCopy} style={{ padding: "12px", borderRadius: "12px", border: "none", background: copied ? "rgba(29, 158, 117, 0.3)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 0 20px rgba(29, 158, 117, 0.25)" }}>
              {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy Full Resume</>}
            </button>
            <button onClick={onReset} style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "rgba(255, 255, 255, 0.7)", fontSize: 14, cursor: "pointer" }}>
              Try Another JD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionViewer({ section, adapted }: { section: string; adapted: any }) {
  if (section === "summary") {
    return (
      <div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--gray-700)" }}>{adapted.summary || "No summary."}</p>
      </div>
    );
  }
  if (section === "experience") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {(adapted.experience ?? []).map((exp: any, i: number) => (
          <div key={i}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{exp.title}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 8 }}>{exp.company} · {exp.start} – {exp.end}</div>
            {(exp.bullets ?? []).map((b: string, j: number) => (
              <div key={j} style={{ fontSize: 14, color: "var(--gray-700)", marginBottom: 5, paddingLeft: 14, borderLeft: "2px solid var(--teal-200)", lineHeight: 1.5 }}>{b}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (section === "skills") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(adapted.skills ?? []).map((s: string, i: number) => (
          <span key={i} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, background: "var(--gray-100)", color: "var(--gray-700)", border: "1px solid var(--gray-200)" }}>{s}</span>
        ))}
      </div>
    );
  }
  if (section === "education") {
    return (
      <div>
        {(adapted.education ?? []).map((e: any, i: number) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{e.degree}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{e.institution} · {e.end}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function buildPlainText(adapted: any): string {
  const lines: string[] = [];
  const c = adapted.contact ?? {};
  if (c.name)     lines.push(c.name);
  if (c.email)    lines.push(c.email);
  if (c.linkedin) lines.push(c.linkedin);
  lines.push("", adapted.summary ?? "", "");
  lines.push("EXPERIENCE");
  for (const exp of adapted.experience ?? []) {
    lines.push(`${exp.title} at ${exp.company} (${exp.start}–${exp.end})`);
    for (const b of exp.bullets ?? []) lines.push(`• ${b}`);
    lines.push("");
  }
  lines.push("SKILLS");
  lines.push((adapted.skills ?? []).join(", "), "");
  lines.push("EDUCATION");
  for (const e of adapted.education ?? []) lines.push(`${e.degree}, ${e.institution} (${e.end})`);
  return lines.join("\n");
}



export default function JDAdapterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", color: "var(--gray-400)" }}>
        Loading adapter...
      </div>
    }>
      <JDAdapterContent />
    </Suspense>
  );
}
