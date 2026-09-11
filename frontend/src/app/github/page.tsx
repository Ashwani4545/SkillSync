"use client";
import { useState, useEffect } from "react";
import { Github, Loader2, Star, GitFork, ExternalLink, CheckCircle, Plus, AlertTriangle, XCircle, Share2, Copy } from "lucide-react";
import { apiClient } from "@/lib/api";

type ProofSkill = {
  skill: string;
  status: "verified" | "weak" | "unverified";
  confidence: number;
  evidence_repo: string | null;
  evidence_url: string | null;
  reason: string | null;
  suggested_bullet: string | null;
};

const STATUS_META: Record<ProofSkill["status"], { color: string; bg: string; Icon: any; label: string }> = {
  verified:   { color: "var(--teal-700)",  bg: "var(--teal-50)",  Icon: CheckCircle,   label: "Verified" },
  weak:       { color: "var(--amber-700)", bg: "var(--amber-50)", Icon: AlertTriangle, label: "Weak evidence" },
  unverified: { color: "var(--coral-700)", bg: "var(--coral-50)", Icon: XCircle,       label: "Unverified" },
};

export default function GithubPage() {
  const [resumes, setResumes]     = useState<any[]>([]);
  const [resumeId, setResumeId]   = useState("");
  const [username, setUsername]   = useState("");
  const [result, setResult]       = useState<any | null>(null);
  const [status, setStatus]       = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);

  // Proof Score state
  const [proofStatus, setProofStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [proofData, setProofData]     = useState<any | null>(null);
  const [proofError, setProofError]   = useState("");
  const [shareUrl, setShareUrl]       = useState<string | null>(null);

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

  const handleComputeProofScore = async () => {
    if (!username.trim() || !resumeId) return;
    setProofStatus("loading"); setProofError(""); setProofData(null); setShareUrl(null);
    try {
      const { data } = await apiClient.post("/github/proof-score", {
        github_username: username.trim(),
        resume_id: resumeId,
        generate_bullets_for_weak_skills: true,
      });
      setProofData(data);
      setProofStatus("done");
    } catch (e: any) {
      setProofError(e.response?.data?.detail || e.message || "Proof Score computation failed.");
      setProofStatus("error");
    }
  };

  const handleShareProofScore = async () => {
    if (!proofData?.proof_score_id) return;
    try {
      const { data } = await apiClient.post(`/github/proof-score/${proofData.proof_score_id}/share`);
      setShareUrl(`${window.location.origin}/share/proof/${data.share_token}`);
    } catch {
      /* non-fatal — share button just stays as-is */
    }
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

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleMatch} disabled={!username.trim() || !resumeId}
                style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (!username.trim() || !resumeId) ? "var(--gray-200)" : "var(--gray-900)", color: (!username.trim() || !resumeId) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Github size={18} /> Match GitHub to resume
              </button>
              <button onClick={handleComputeProofScore} disabled={!username.trim() || !resumeId || proofStatus === "loading"}
                style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--teal-700)", background: "#fff", color: (!username.trim() || !resumeId) ? "var(--gray-400)" : "var(--teal-700)", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {proofStatus === "loading" ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={18} />}
                Compute Proof Score
              </button>
            </div>
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

        {proofError && (
          <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginTop: 16 }}>
            {proofError}
          </div>
        )}

        {proofStatus === "done" && proofData && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, margin: "0 0 4px" }}>Proof Score</h2>
                <p style={{ color: "var(--gray-500)", fontSize: 13, margin: 0 }}>
                  Every claimed skill, checked against real commit history — not just keyword matching.
                </p>
              </div>
              <button onClick={handleShareProofScore}
                style={{ padding: "10px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Share2 size={14} /> Share
              </button>
            </div>

            {shareUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--teal-50)", borderRadius: "var(--radius-md)", marginBottom: 16, fontSize: 13 }}>
                <span style={{ flex: 1, color: "var(--teal-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
                <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--teal-700)", display: "flex", alignItems: "center" }}>
                  <Copy size={14} />
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", background: "var(--gray-900)", borderRadius: "var(--radius-lg)", padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "Syne" }}>{proofData.overall_score}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 2 }}>Overall Proof Score</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>{proofData.verified_count}</div>
                <div style={{ fontSize: 12, color: "var(--teal-700)", fontWeight: 600, marginTop: 2 }}>Verified</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "var(--amber-50)", borderRadius: "var(--radius-lg)", padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--amber-700)", fontFamily: "Syne" }}>{proofData.weak_count}</div>
                <div style={{ fontSize: 12, color: "var(--amber-700)", fontWeight: 600, marginTop: 2 }}>Weak</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "var(--coral-50)", borderRadius: "var(--radius-lg)", padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--coral-700)", fontFamily: "Syne" }}>{proofData.unverified_count}</div>
                <div style={{ fontSize: 12, color: "var(--coral-700)", fontWeight: 600, marginTop: 2 }}>Unverified</div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 8 }}>
              {(proofData.skills ?? []).map((s: ProofSkill) => {
                const meta = STATUS_META[s.status];
                const Icon = meta.Icon;
                return (
                  <div key={s.skill} style={{ padding: "16px 18px", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{s.skill}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg }}>
                          <Icon size={11} /> {meta.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{s.confidence}% confidence</span>
                    </div>
                    {s.reason && <p style={{ fontSize: 12.5, color: "var(--gray-500)", margin: "0 0 4px" }}>{s.reason}</p>}
                    {s.evidence_repo && s.evidence_url && (
                      <a href={s.evidence_url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--teal-700)", textDecoration: "none", fontWeight: 600 }}>
                        → {s.evidence_repo}
                      </a>
                    )}
                    {s.suggested_bullet && (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}>
                        <div style={{ flex: 1, padding: "10px 14px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--gray-800)", lineHeight: 1.5, fontStyle: "italic" }}>
                          • {s.suggested_bullet}
                        </div>
                        <button onClick={() => copyBullet(s.suggested_bullet!, `proof-${s.skill}`)}
                          style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none", background: copied === `proof-${s.skill}` ? "var(--teal-700)" : "var(--gray-900)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {copied === `proof-${s.skill}` ? <><CheckCircle size={12} /> Copied</> : <><Plus size={12} /> Copy bullet</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
