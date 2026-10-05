"use client";
import { useState, useEffect } from "react";
import { Github, Loader2, Star, GitFork, ExternalLink, CheckCircle, Plus, AlertTriangle, XCircle, Share2, Copy } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

type ProofSkill = {
  skill: string;
  status: "verified" | "weak" | "unverified";
  confidence: number;
  evidence_repo: string | null;
  evidence_url: string | null;
  reason: string | null;
  suggested_bullet: string | null;
};

const STATUS_META: Record<ProofSkill["status"], { color: string; bg: string; border: string; Icon: any; label: string }> = {
  verified:   { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.15)", border: "rgba(45, 212, 191, 0.3)", Icon: CheckCircle,   label: "Verified" },
  weak:       { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.3)", Icon: AlertTriangle, label: "Weak evidence" },
  unverified: { color: "#F87171", bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)", Icon: XCircle,       label: "Unverified" },
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="GitHub Sync" badge="CAREER" badgeColor="#C084FC" />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>GitHub Integration</h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            Connect your GitHub to see which projects support your resume claims — and which impressive projects you're not mentioning.
          </p>
        </div>

        {(status === "idle" || status === "error") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>GITHUB USERNAME</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Github size={20} color="#94A3B8" />
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", color: "#FFFFFF", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 10 }}>Public repos only — no OAuth required</p>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>SELECT RESUME TO MATCH</label>
                {resumes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#64748B" }}>No resumes yet. <a href="/analyze/upload" style={{ color: "#2DD4BF" }}>Upload one →</a></p>
                ) : (
                  resumes.map(r => (
                    <button key={r.id} onClick={() => setResumeId(r.id)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${resumeId === r.id ? "#A855F7" : "rgba(255, 255, 255, 0.08)"}`, background: resumeId === r.id ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.02)", marginBottom: 8, cursor: "pointer", fontSize: 13, fontWeight: resumeId === r.id ? 600 : 400, color: resumeId === r.id ? "#D8B4FE" : "#E2E8F0", transition: "all 0.2s ease" }}>
                      {r.filename}
                    </button>
                  ))
                )}
              </div>
            </div>

            {error && <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={handleMatch} disabled={!username.trim() || !resumeId}
                style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: (!username.trim() || !resumeId) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: (!username.trim() || !resumeId) ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!username.trim() || !resumeId) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (username.trim() && resumeId) ? "0 0 20px rgba(29, 158, 117, 0.3)" : "none", transition: "all 0.2s ease" }}>
                <Github size={18} /> Match GitHub to resume
              </button>
              <button onClick={handleComputeProofScore} disabled={!username.trim() || !resumeId || proofStatus === "loading"}
                style={{ padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(168, 85, 247, 0.4)", background: "rgba(168, 85, 247, 0.12)", color: (!username.trim() || !resumeId) ? "#64748B" : "#D8B4FE", fontSize: 15, fontWeight: 700, cursor: (!username.trim() || !resumeId || proofStatus === "loading") ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease" }}>
                {proofStatus === "loading" ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={18} />}
                Compute Proof Score
              </button>
            </div>
          </>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Loader2 size={28} color="#2DD4BF" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Fetching repos and matching...</h2>
            <p style={{ color: "#94A3B8" }}>Analyzing {username}'s public projects against your resume</p>
          </div>
        )}

        {status === "done" && (
          <div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Repos found",        val: repos.length,   color: "#FFFFFF",   bg: "rgba(255, 255, 255, 0.03)", border: "rgba(255, 255, 255, 0.08)" },
                { label: "Resume matches",     val: matches.length, color: "#2DD4BF",   bg: "rgba(45, 212, 191, 0.08)", border: "rgba(45, 212, 191, 0.25)" },
                { label: "Missing from resume",val: missing.length, color: "#FBBF24",   bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.25)" },
                { label: "Skills evidenced",   val: evidenced.length,color: "#60A5FA", bg: "rgba(96, 165, 250, 0.08)", border: "rgba(96, 165, 250, 0.25)" },
              ].map(s => (
                <div key={s.label} style={{ flex: "1 1 120px", background: s.bg, border: `1px solid ${s.border}`, backdropFilter: "blur(12px)", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Projects to ADD to resume */}
            {missing.length > 0 && (
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(251, 191, 36, 0.3)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FBBF24" }}>Projects to add to your resume</h3>
                <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 18 }}>These impressive repos aren't reflected in your resume yet.</p>
                {missing.map((m: any, i: number) => (
                  <div key={i} style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.15)", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#FFFFFF" }}>{m.repo_name}</div>
                      <a href={`https://github.com/${username}/${m.repo_name}`} target="_blank" rel="noreferrer"
                        style={{ color: "#94A3B8", display: "flex", alignItems: "center" }}>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 12 }}>{m.why}</p>
                    {m.suggested_bullet && (
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ flex: 1, padding: "12px 14px", background: "rgba(0, 0, 0, 0.25)", borderRadius: 10, fontSize: 13, color: "#FDE68A", lineHeight: 1.5, fontStyle: "italic", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                          • {m.suggested_bullet}
                        </div>
                        <button onClick={() => copyBullet(m.suggested_bullet, `missing-${i}`)}
                          style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: copied === `missing-${i}` ? "#1D9E75" : "#D97706", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {copied === `missing-${i}` ? <><CheckCircle size={13} /> Copied</> : <><Plus size={13} /> Copy bullet</>}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resume matches */}
            {matches.length > 0 && (
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>Projects supporting your resume</h3>
                <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 18 }}>These repos provide evidence for claims you've already made.</p>
                {matches.map((m: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: i < matches.length - 1 ? "1px solid rgba(255, 255, 255, 0.06)" : "none", alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: m.strength === "strong" ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.05)", border: `1px solid ${m.strength === "strong" ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Github size={18} color={m.strength === "strong" ? "#2DD4BF" : "#94A3B8"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#FFFFFF" }}>{m.repo_name}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: m.strength === "strong" ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.05)", color: m.strength === "strong" ? "#2DD4BF" : "#94A3B8", border: `1px solid ${m.strength === "strong" ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.1)"}`, textTransform: "capitalize" }}>
                          {m.strength}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 6px" }}>Matches: <em style={{ color: "#E2E8F0" }}>{m.matched_bullet}</em></p>
                      <p style={{ fontSize: 13, color: "#2DD4BF", margin: 0, fontWeight: 500 }}>{m.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All repos */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>All public repos — {username}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {repos.slice(0, 12).map((r: any, i: number) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer"
                    style={{ display: "block", padding: "14px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", textDecoration: "none", transition: "all .2s ease" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#FFFFFF", marginBottom: 6 }}>{r.name}</div>
                    {r.description && <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10, lineHeight: 1.4 }}>{r.description.slice(0, 70)}</div>}
                    <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#64748B" }}>
                      {r.language && <span style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(255, 255, 255, 0.05)", color: "#CBD5E1", fontWeight: 500 }}>{r.language}</span>}
                      {r.stars > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#FBBF24" }}><Star size={11} /> {r.stars}</span>}
                      {r.forks > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={11} /> {r.forks}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
              Try another username
            </button>
          </div>
        )}

        {proofError && (
          <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.15)", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, marginTop: 16 }}>
            {proofError}
          </div>
        )}

        {proofStatus === "done" && proofData && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Syne, sans-serif", margin: "0 0 4px", color: "#FFFFFF" }}>Proof Score</h2>
                <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>
                  Every claimed skill, checked against real commit history — not just keyword matching.
                </p>
              </div>
              <button onClick={handleShareProofScore}
                style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#E2E8F0", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s ease" }}>
                <Share2 size={14} /> Share
              </button>
            </div>

            {shareUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: "rgba(45, 212, 191, 0.1)", border: "1px solid rgba(45, 212, 191, 0.25)", borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
                <span style={{ flex: 1, color: "#2DD4BF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
                <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "#2DD4BF", display: "flex", alignItems: "center" }}>
                  <Copy size={14} />
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", borderRadius: 18, padding: "20px 24px", textAlign: "center", boxShadow: "0 0 20px rgba(29, 158, 117, 0.3)" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif" }}>{proofData.overall_score}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 4 }}>Overall Proof Score</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "rgba(45, 212, 191, 0.08)", border: "1px solid rgba(45, 212, 191, 0.25)", borderRadius: 18, padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#2DD4BF", fontFamily: "Syne, sans-serif" }}>{proofData.verified_count}</div>
                <div style={{ fontSize: 12, color: "#2DD4BF", fontWeight: 600, marginTop: 4 }}>Verified</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.25)", borderRadius: 18, padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#FBBF24", fontFamily: "Syne, sans-serif" }}>{proofData.weak_count}</div>
                <div style={{ fontSize: 12, color: "#FBBF24", fontWeight: 600, marginTop: 4 }}>Weak</div>
              </div>
              <div style={{ flex: "1 1 120px", background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.25)", borderRadius: 18, padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#F87171", fontFamily: "Syne, sans-serif" }}>{proofData.unverified_count}</div>
                <div style={{ fontSize: 12, color: "#F87171", fontWeight: 600, marginTop: 4 }}>Unverified</div>
              </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 12 }}>
              {(proofData.skills ?? []).map((s: ProofSkill) => {
                const meta = STATUS_META[s.status];
                const Icon = meta.Icon;
                return (
                  <div key={s.skill} style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>{s.skill}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
                          <Icon size={12} /> {meta.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.confidence}% confidence</span>
                    </div>
                    {s.reason && <p style={{ fontSize: 13, color: "#CBD5E1", margin: "0 0 6px" }}>{s.reason}</p>}
                    {s.evidence_repo && s.evidence_url && (
                      <a href={s.evidence_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2DD4BF", textDecoration: "none", fontWeight: 600 }}>
                        → {s.evidence_repo}
                      </a>
                    )}
                    {s.suggested_bullet && (
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10 }}>
                        <div style={{ flex: 1, padding: "12px 14px", background: "rgba(0, 0, 0, 0.25)", borderRadius: 10, fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, fontStyle: "italic", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                          • {s.suggested_bullet}
                        </div>
                        <button onClick={() => copyBullet(s.suggested_bullet!, `proof-${s.skill}`)}
                          style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: copied === `proof-${s.skill}` ? "#1D9E75" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
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
