"use client";
import { useState, useEffect } from "react";
import { Globe, Loader2, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

const POLL_MS = 2500;

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Germany": "🇩🇪",
  "Japan": "🇯🇵", "Canada": "🇨🇦", "Australia": "🇦🇺",
  "France": "🇫🇷", "India": "🇮🇳",
};

export default function LanguageAdapterPage() {
  const [resumes, setResumes]     = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [resumeId, setResumeId]   = useState("");
  const [country, setCountry]     = useState("United Kingdom");
  const [taskId, setTaskId]       = useState<string | null>(null);
  const [result, setResult]       = useState<any | null>(null);
  const [status, setStatus]       = useState<"idle"|"loading"|"polling"|"done"|"error">("idle");
  const [error, setError]         = useState("");
  const [activeSection, setSection] = useState("summary");
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
    apiClient.get("/language/countries").then(({ data }) => setCountries(data.countries ?? []));
  }, []);

  useEffect(() => {
    if (!taskId || status !== "polling") return;
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/language/result/${taskId}`);
        if (data.status === "done")   { setResult(data.result); setStatus("done"); }
        else if (data.status === "failed") { setError(data.error || "Adaptation failed"); setStatus("error"); }
      } catch { /* keep polling */ }
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [taskId, status]);

  const handleAdapt = async () => {
    if (!resumeId || !country) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/language/adapt", { resume_id: resumeId, target_country: country });
      setTaskId(data.task_id);
      setStatus("polling");
    } catch (e: any) {
      setError(e.message || "Failed to start adaptation.");
      setStatus("error");
    }
  };

  const adapted = result?.adapted_resume;
  const norms   = result?.country_norms ?? {};
  const changes = result?.changes_made ?? [];
  const mustAdd = result?.must_add_manually ?? [];

  const copyResume = () => {
    if (!adapted) return;
    const lines: string[] = [];
    const c = adapted.contact ?? {};
    if (c.name) lines.push(c.name);
    if (c.email) lines.push(c.email);
    lines.push("", adapted.summary ?? "", "");
    (adapted.experience ?? []).forEach((e: any) => {
      lines.push(`${e.title} at ${e.company} (${e.start}–${e.end})`);
      (e.bullets ?? []).forEach((b: string) => lines.push(`• ${b}`));
      lines.push("");
    });
    lines.push("SKILLS", (adapted.skills ?? []).join(", "), "");
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SECTIONS = ["summary", "experience", "education", "skills"];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Cultural Adapter" badge="CAREER" badgeColor="#60A5FA" />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Cultural Adapter</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            Restructure and reformat your resume for any country's hiring culture — US one-pager, German Lebenslauf, Japanese rirekisho, and more.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Resume selector */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>SELECT RESUME</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resumes.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#64748B" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
                  ) : (
                    resumes.map(r => (
                      <button key={r.id} onClick={() => setResumeId(r.id)}
                        style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${resumeId === r.id ? "#38BDF8" : "rgba(255, 255, 255, 0.08)"}`, background: resumeId === r.id ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.02)", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#7DD3FC" : "#E2E8F0", textAlign: "left", transition: "all 0.2s ease" }}>
                        {r.filename}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Country selector */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>TARGET COUNTRY</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {countries.map(c => (
                    <button key={c} onClick={() => setCountry(c)}
                      style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${country === c ? "#38BDF8" : "rgba(255, 255, 255, 0.08)"}`, background: country === c ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.02)", cursor: "pointer", fontSize: 13, fontWeight: country === c ? 600 : 400, color: country === c ? "#7DD3FC" : "#CBD5E1", transition: "all 0.2s ease" }}>
                      {COUNTRY_FLAGS[c] ?? "🌍"} {c}
                    </button>
                  ))}
                </div>
                {country && norms.length === 0 && (
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <strong style={{ color: "#E2E8F0" }}>Key norms for {country}:</strong><br />
                    Photo: not included · Length: 1-2 pages · Tone: professional
                  </div>
                )}
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleAdapt} disabled={!resumeId || !country}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: (!resumeId || !country) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", color: (!resumeId || !country) ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!resumeId || !country) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (resumeId && country) ? "0 0 20px rgba(2, 132, 199, 0.35)" : "none", transition: "all 0.2s ease" }}>
              <Globe size={18} /> Adapt for {country || "selected country"}
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={28} color="#38BDF8" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Adapting for {country}</h2>
            <p style={{ color: "#94A3B8" }}>Restructuring format, tone, and sections to match local hiring norms...</p>
          </div>
        )}

        {status === "done" && adapted && (
          <div>
            {/* Must-add warnings */}
            {mustAdd.length > 0 && (
              <div style={{ background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.25)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={18} color="#FBBF24" />
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#FBBF24" }}>You need to add these manually</h3>
                </div>
                {mustAdd.map((item: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "#FDE68A", marginBottom: 6, paddingLeft: 10, borderLeft: "2px solid #FBBF24" }}>{item}</div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
              {/* Adapted resume viewer */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", gap: 4, background: "rgba(255, 255, 255, 0.02)" }}>
                  {SECTIONS.map(s => (
                    <button key={s} onClick={() => setSection(s)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: activeSection === s ? "rgba(45, 212, 191, 0.15)" : "none", cursor: "pointer", fontSize: 13, fontWeight: activeSection === s ? 700 : 400, color: activeSection === s ? "#2DD4BF" : "#94A3B8", textTransform: "capitalize", transition: "all 0.2s ease" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ padding: 24 }}>
                  <AdaptedSection section={activeSection} adapted={adapted} />
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", marginBottom: 10 }}>ADAPTED FOR</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>{COUNTRY_FLAGS[country] ?? "🌍"} {country}</div>
                  {result.length_recommendation && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{result.length_recommendation}</div>}
                </div>

                {changes.length > 0 && (
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", marginBottom: 10 }}>CHANGES MADE</div>
                    {changes.slice(0, 5).map((c: string, i: number) => (
                      <div key={i} style={{ fontSize: 12.5, color: "#CBD5E1", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #2DD4BF", lineHeight: 1.5 }}>{c}</div>
                    ))}
                  </div>
                )}

                {result.format_tips?.length > 0 && (
                  <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", letterSpacing: "0.05em", marginBottom: 10 }}>FORMAT TIPS</div>
                    {result.format_tips.map((tip: string, i: number) => (
                      <div key={i} style={{ fontSize: 12.5, color: "#BAE6FD", marginBottom: 8, lineHeight: 1.5 }}>• {tip}</div>
                    ))}
                  </div>
                )}

                <button onClick={copyResume} style={{ padding: "12px", borderRadius: 12, border: `1px solid ${copied ? "#1D9E75" : "rgba(255, 255, 255, 0.12)"}`, background: copied ? "rgba(29, 158, 117, 0.2)" : "rgba(255, 255, 255, 0.04)", color: copied ? "#2DD4BF" : "#FFFFFF", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease" }}>
                  {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy full resume</>}
                </button>
                <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "12px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.08)", background: "none", color: "#94A3B8", fontSize: 14, cursor: "pointer", transition: "all 0.2s ease" }}>
                  Try another country
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdaptedSection({ section, adapted }: { section: string; adapted: any }) {
  if (section === "summary") return <p style={{ fontSize: 14, lineHeight: 1.7, color: "#E2E8F0" }}>{adapted.summary || "No summary."}</p>;
  if (section === "experience") return (
    <div>
      {(adapted.experience ?? []).map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#FFFFFF" }}>{e.title}</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 10 }}>{e.company} · {e.start}–{e.end}</div>
          {(e.bullets ?? []).map((b: string, j: number) => (
            <div key={j} style={{ fontSize: 14, color: "#CBD5E1", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #2DD4BF", lineHeight: 1.5 }}>{b}</div>
          ))}
        </div>
      ))}
    </div>
  );
  if (section === "education") return (
    <div>
      {(adapted.education ?? []).map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: 15 }}>{e.degree}</div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>{e.institution} · {e.end}</div>
        </div>
      ))}
      {Object.entries(adapted.additional_sections ?? {}).map(([k, v]) => (
        <div key={k} style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, textTransform: "capitalize", color: "#2DD4BF" }}>{k.replace(/_/g, " ")}</div>
          <div style={{ fontSize: 14, color: "#E2E8F0" }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
  if (section === "skills") return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {(adapted.skills ?? []).map((s: string, i: number) => (
        <span key={i} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 20, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#E2E8F0" }}>{s}</span>
      ))}
    </div>
  );
  return null;
}
