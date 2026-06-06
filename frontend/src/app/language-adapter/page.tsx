"use client";
import { useState, useEffect } from "react";
import { Globe, Loader2, ChevronDown, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api";

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
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Cultural Adapter</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Restructure and reformat your resume for any country's hiring culture — US one-pager, German Lebenslauf, Japanese rirekisho, and more.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Resume selector */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>SELECT RESUME</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ padding: "9px 14px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "var(--teal-700)" : "var(--gray-800)", textAlign: "left" }}>
                      {r.filename}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country selector */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>TARGET COUNTRY</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {countries.map(c => (
                    <button key={c} onClick={() => setCountry(c)}
                      style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: `1.5px solid ${country === c ? "var(--teal-500)" : "var(--gray-200)"}`, background: country === c ? "var(--teal-50)" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: country === c ? 600 : 400, color: country === c ? "var(--teal-700)" : "var(--gray-700)" }}>
                      {COUNTRY_FLAGS[c] ?? "🌍"} {c}
                    </button>
                  ))}
                </div>
                {country && norms.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--gray-400)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--gray-600)" }}>Key norms for {country}:</strong><br />
                    Photo: not included · Length: 1-2 pages · Tone: professional
                  </div>
                )}
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleAdapt} disabled={!resumeId || !country}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (!resumeId || !country) ? "var(--gray-200)" : "var(--teal-700)", color: (!resumeId || !country) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={18} /> Adapt for {country || "selected country"}
            </button>
          </>
        )}

        {(status === "loading" || status === "polling") && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Adapting for {country}</h2>
            <p style={{ color: "var(--gray-500)" }}>Restructuring format, tone, and sections to match local hiring norms...</p>
          </div>
        )}

        {status === "done" && adapted && (
          <div>
            {/* Must-add warnings */}
            {mustAdd.length > 0 && (
              <div style={{ background: "var(--amber-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--amber-200)", padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={18} color="var(--amber-700)" />
                  <h3 style={{ margin: 0, fontSize: 14, color: "var(--amber-700)" }}>You need to add these manually</h3>
                </div>
                {mustAdd.map((item: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 6, paddingLeft: 10, borderLeft: "2px solid var(--amber-400)" }}>{item}</div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
              {/* Adapted resume viewer */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-200)", display: "flex", gap: 0 }}>
                  {SECTIONS.map(s => (
                    <button key={s} onClick={() => setSection(s)}
                      style={{ padding: "6px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeSection === s ? 600 : 400, color: activeSection === s ? "var(--teal-700)" : "var(--gray-500)", borderBottom: activeSection === s ? "2px solid var(--teal-700)" : "2px solid transparent", textTransform: "capitalize" }}>
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
                <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 10 }}>ADAPTED FOR</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{COUNTRY_FLAGS[country] ?? "🌍"} {country}</div>
                  {result.length_recommendation && <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 6 }}>{result.length_recommendation}</div>}
                </div>

                {changes.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 10 }}>CHANGES MADE</div>
                    {changes.slice(0, 5).map((c: string, i: number) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 7, paddingLeft: 8, borderLeft: "2px solid var(--teal-200)", lineHeight: 1.5 }}>{c}</div>
                    ))}
                  </div>
                )}

                {result.format_tips?.length > 0 && (
                  <div style={{ background: "var(--blue-50)", borderRadius: "var(--radius-lg)", padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue-700)", marginBottom: 10 }}>FORMAT TIPS</div>
                    {result.format_tips.map((tip: string, i: number) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--gray-700)", marginBottom: 7 }}>• {tip}</div>
                    ))}
                  </div>
                )}

                <button onClick={copyResume} style={{ padding: "11px", borderRadius: "var(--radius-md)", border: `1px solid ${copied ? "var(--teal-500)" : "var(--gray-200)"}`, background: copied ? "var(--teal-50)" : "#fff", color: copied ? "var(--teal-700)" : "var(--gray-600)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy full resume</>}
                </button>
                <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "11px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-500)", fontSize: 14, cursor: "pointer" }}>
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
  if (section === "summary") return <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--gray-700)" }}>{adapted.summary || "No summary."}</p>;
  if (section === "experience") return (
    <div>
      {(adapted.experience ?? []).map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{e.title}</div>
          <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 8 }}>{e.company} · {e.start}–{e.end}</div>
          {(e.bullets ?? []).map((b: string, j: number) => (
            <div key={j} style={{ fontSize: 14, color: "var(--gray-700)", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid var(--teal-200)" }}>{b}</div>
          ))}
        </div>
      ))}
    </div>
  );
  if (section === "education") return (
    <div>
      {(adapted.education ?? []).map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>{e.degree}</div>
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{e.institution} · {e.end}</div>
        </div>
      ))}
      {Object.entries(adapted.additional_sections ?? {}).map(([k, v]) => (
        <div key={k} style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</div>
          <div style={{ fontSize: 14, color: "var(--gray-700)" }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
  if (section === "skills") return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {(adapted.skills ?? []).map((s: string, i: number) => (
        <span key={i} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, background: "var(--gray-100)", color: "var(--gray-700)" }}>{s}</span>
      ))}
    </div>
  );
  return null;
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Cultural Adapter</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)" }}>CAREER</span>
      </div>
    </div>
  );
}
