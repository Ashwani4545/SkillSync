"use client";
import { useState, useEffect } from "react";
import { Github, Loader2, Star, GitFork, ExternalLink, CheckCircle, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function GithubPage() {
  const [resumes, setResumes]     = useState<any[]>([]);
  const [resumeId, setResumeId]   = useState("");
  const [username, setUsername]   = useState("");
  const [result, setResult]       = useState<any | null>(null);
  const [status, setStatus]       = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => setResumes(data.resumes ?? []));
  }, []);

  const handleMatch = async () => {
    if (!username.trim() || !resumeId) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const { data } = await apiClient.post("/github/match", {
        github_username: username.trim(),
        resume_id: resumeId,
      });
      setResult(data);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "GitHub match failed.");
      setStatus("error");
    }
  };

  const copyBullet = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const repos: any[]   = result?.repos ?? [];
  const matches        = result?.matches ?? [];
  const missing        = result?.missing_from_resume ?? [];
  const evidenced      = result?.skills_evidenced ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>GitHub Integration</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
            Connect your GitHub to see which projects support your resume claims — and which impressive projects you're not mentioning.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>GITHUB USERNAME</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Github size={20} color="var(--gray-400)" />
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 8 }}>Public repos only — no OAuth required</p>
              </div>

              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>SELECT RESUME TO MATCH</label>
                {resumes.map(r => (
                  <button key={r.id} onClick={() => setResumeId(r.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: "var(--radius-md)", border: `1.5px solid ${resumeId === r.id ? "var(--teal-500)" : "var(--gray-200)"}`, background: resumeId === r.id ? "var(--teal-50)" : "#fff", marginBottom: 6, cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400 }}>
                    {r.filename}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleMatch} disabled={!username.trim() || !resumeId}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (!username.trim() || !resumeId) ? "var(--gray-200)" : "var(--gray-900)", color: (!username.trim() || !resumeId) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Github size={18} /> Match GitHub to resume
            </button>
          </>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={26} color="var(--gray-700)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Fetching repos and matching...</h2>
            <p style={{ color: "var(--gray-500)" }}>Analyzing {username}'s public projects against your resume</p>
          </div>
        )}

        {status === "done" && (
          <div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Repos found",        val: repos.length,   color: "var(--gray-700)",   bg: "var(--gray-100)" },
                { label: "Resume matches",     val: matches.length, color: "var(--teal-700)",   bg: "var(--teal-50)"  },
                { label: "Missing from resume",val: missing.length, color: "var(--amber-700)",  bg: "var(--amber-50)" },
                { label: "Skills evidenced",   val: evidenced.length,color: "var(--blue-700)", bg: "var(--blue-50)"  },
              ].map(s => (
                <div key={s.label} style={{ flex: "1 1 120px", background: s.bg, borderRadius: "var(--radius-lg)", padding: "16px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Projects to ADD to resume */}
            {missing.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--amber-200)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>Projects to add to your resume</h3>
                <p style={{ color: "var(--gray-500)", fontSize: 13, marginBottom: 16 }}>These impressive repos aren't reflected in your resume yet.</p>
                {missing.map((m: any, i: number) => (
                  <div key={i} style={{ background: "var(--amber-50)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{m.repo_name}</div>
                      <a href={`https://github.com/${username}/${m.repo_name}`} target="_blank" rel="noreferrer"
                        style={{ color: "var(--gray-400)", display: "flex", alignItems: "center" }}>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 10 }}>{m.why}</p>
                    {m.suggested_bullet && (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ flex: 1, padding: "10px 14px", background: "#fff", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--gray-800)", lineHeight: 1.5, fontStyle: "italic", border: "1px solid var(--amber-200)" }}>
                          • {m.suggested_bullet}
                        </div>
                        <button onClick={() => copyBullet(m.suggested_bullet, `missing-${i}`)}
                          style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none", background: copied === `missing-${i}` ? "var(--teal-700)" : "var(--amber-700)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {copied === `missing-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Plus size={12} /> Copy bullet</>}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resume matches */}
            {matches.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>Projects supporting your resume</h3>
                <p style={{ color: "var(--gray-500)", fontSize: 13, marginBottom: 16 }}>These repos provide evidence for claims you've already made.</p>
                {matches.map((m: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--gray-100)", alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: m.strength === "strong" ? "var(--teal-50)" : "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Github size={16} color={m.strength === "strong" ? "var(--teal-700)" : "var(--gray-400)"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{m.repo_name}</span>
                        <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, fontWeight: 700, background: m.strength === "strong" ? "var(--teal-50)" : "var(--gray-100)", color: m.strength === "strong" ? "var(--teal-700)" : "var(--gray-500)", textTransform: "capitalize" }}>
                          {m.strength}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "0 0 4px" }}>Matches: <em>{m.matched_bullet}</em></p>
                      <p style={{ fontSize: 13, color: "var(--teal-700)", margin: 0 }}>{m.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All repos */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>All public repos — {username}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {repos.slice(0, 12).map((r: any, i: number) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer"
                    style={{ display: "block", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", textDecoration: "none", transition: "border-color .15s" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--gray-900)", marginBottom: 4 }}>{r.name}</div>
                    {r.description && <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8, lineHeight: 1.4 }}>{r.description.slice(0, 70)}</div>}
                    <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--gray-400)" }}>
                      {r.language && <span style={{ padding: "1px 7px", borderRadius: 20, background: "var(--gray-100)", color: "var(--gray-600)", fontWeight: 500 }}>{r.language}</span>}
                      {r.stars > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={11} /> {r.stars}</span>}
                      {r.forks > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={11} /> {r.forks}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "11px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 14, cursor: "pointer" }}>
              Try another username
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>GitHub Sync</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--purple-50)", color: "var(--purple-700)" }}>CAREER</span>
      </div>
    </div>
  );
}
