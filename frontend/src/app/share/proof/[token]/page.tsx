"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, CheckCircle, Github, AlertTriangle, XCircle } from "lucide-react";
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

type ProofScoreData = {
  github_username: string;
  overall_score: number;
  verified_count: number;
  weak_count: number;
  unverified_count: number;
  created_at: string;
  skills: ProofSkill[];
};

const STATUS_META: Record<
  ProofSkill["status"],
  { color: string; bg: string; border: string; Icon: typeof CheckCircle; label: string }
> = {
  verified: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.15)", border: "rgba(45, 212, 191, 0.3)", Icon: CheckCircle, label: "Verified" },
  weak: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.3)", Icon: AlertTriangle, label: "Weak evidence" },
  unverified: { color: "#F87171", bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)", Icon: XCircle, label: "Unverified" },
};

export default function ProofScoreSharePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ProofScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/share/proof/${token}`)
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Centered>
        <p style={{ color: "#94A3B8" }}>Loading Proof Score…</p>
      </Centered>
    );
  }

  if (!data) {
    return (
      <Centered>
        <p style={{ color: "#94A3B8" }}>This Proof Score link is invalid or has been made private.</p>
      </Centered>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.15) 0%, transparent 60%), #0A0F1E", color: "#ffffff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
              padding: "28px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>
                SkillSync Proof Score
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Github size={14} /> github.com/{data.github_username}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                {data.overall_score}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Proof Score</div>
            </div>
          </div>

          <div style={{ padding: "20px 32px", display: "flex", gap: 24 }}>
            <Stat label="Verified" value={data.verified_count} color="#2DD4BF" />
            <Stat label="Weak" value={data.weak_count} color="#FBBF24" />
            <Stat label="Unverified" value={data.unverified_count} color="#F87171" />
          </div>

          <p style={{ padding: "0 32px 20px", fontSize: 13, color: "#94A3B8" }}>
            Every skill below is checked against real commit history and language usage on GitHub —
            not just whether the word appears on the resume.
          </p>
        </div>

        {/* Per-skill breakdown */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 20, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 8, marginBottom: 20 }}>
          {data.skills.map((s) => {
            const meta = STATUS_META[s.status];
            const Icon = meta.Icon;
            return (
              <div
                key={s.skill}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>{s.skill}</span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: meta.color,
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                      }}
                    >
                      <Icon size={12} /> {meta.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.confidence}% confidence</span>
                </div>

                {s.reason && <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0 }}>{s.reason}</p>}

                {s.evidence_repo && s.evidence_url && (
                  <a
                    href={s.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 13, color: "#2DD4BF", textDecoration: "none", fontWeight: 600 }}
                  >
                    → {s.evidence_repo}
                  </a>
                )}

                {s.suggested_bullet && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "10px 14px",
                      background: "rgba(0, 0, 0, 0.25)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#E2E8F0",
                      fontStyle: "italic",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    Suggested bullet, drafted from real commits: “{s.suggested_bullet}”
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Share row */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 16, display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.05)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#FFFFFF",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? <CheckCircle size={15} color="#2DD4BF" /> : <Copy size={15} />}
            {copied ? "Copied Link!" : "Copy Public Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "Syne, sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
}
