"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wand2, ArrowRight, Loader2, CheckCircle, Copy, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/api";

const POLL_MS = 2500;

export default function JDAdapterPage() {
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
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>JD Adapter</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Paste any job description. Get a tailored version of your resume optimised for that specific role — in one click.
          </p>
        </div>

        {status !== "done" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Resume selector */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", display: "block", marginBottom: 10 }}>
                SELECT RESUME
              </label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--gray-400)" }}>No resumes uploaded yet. <a href="/analyze/upload" style={{ color: "var(--teal-700)" }}>Upload one →</a></p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setResumeId(r.id)}
                      style={{
                        padding: "10px 14px", borderRadius: "var(--radius-md)", textAlign: "left",
                        border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`,
                        background: resumeId === r.id ? "var(--teal-50)" : "#fff",
                        cursor: "pointer", fontSize: 14, color: "var(--gray-800)", transition: "all .15s",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{r.filename}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* JD input */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", display: "block", marginBottom: 10 }}>
                PASTE JOB DESCRIPTION
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here — the more detail the better..."
                rows={10}
                style={{
                  width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--gray-200)", fontSize: 14, fontFamily: "DM Sans, sans-serif",
                  resize: "vertical", color: "var(--gray-700)", outline: "none", lineHeight: 1.6,
                }}
              />
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 6 }}>
                {jdText.length} characters · Aim for 500+ for best results
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Action button */}
        {status !== "done" && (
          <button
            onClick={handleSubmit}
            disabled={!resumeId || !jdText.trim() || status === "loading"}
            style={{
              padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none",
              background: (!resumeId || !jdText.trim() || status === "loading") ? "var(--gray-200)" : "var(--teal-700)",
              color: (!resumeId || !jdText.trim() || status === "loading") ? "var(--gray-400)" : "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
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
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--gray-200)", display: "flex", gap: 0 }}>
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: "6px 14px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeSection === s ? 600 : 400,
                  color: activeSection === s ? "var(--teal-700)" : "var(--gray-500)",
                  borderBottom: activeSection === s ? "2px solid var(--teal-700)" : "2px solid transparent",
                  textTransform: "capitalize",
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
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--teal-700)" }}>Keywords added</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {added.map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-700)", border: "1px solid var(--teal-100)" }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {changes.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>Changes made</h3>
              {changes.map((c: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid var(--teal-200)", lineHeight: 1.5 }}>{c}</div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={onCopy} style={{ padding: "11px", borderRadius: "var(--radius-md)", border: "1px solid var(--teal-500)", background: copied ? "var(--teal-50)" : "#fff", color: "var(--teal-700)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy full resume</>}
            </button>
            <button onClick={onReset} style={{ padding: "11px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-500)", fontSize: 14, cursor: "pointer" }}>
              Try another JD
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

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>JD Adapter</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--blue-50)", color: "var(--blue-700)" }}>PRO</span>
      </div>
    </div>
  );
}
