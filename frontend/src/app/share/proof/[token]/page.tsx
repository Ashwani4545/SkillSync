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
  { color: string; bg: string; Icon: typeof CheckCircle; label: string }
> = {
  verified: { color: "#0F6E56", bg: "#E6F5F0", Icon: CheckCircle, label: "Verified" },
  weak: { color: "#B45309", bg: "#FEF3E2", Icon: AlertTriangle, label: "Weak evidence" },
  unverified: { color: "#B91C1C", bg: "#FDECEC", Icon: XCircle, label: "Unverified" },
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
        <p style={{ color: "#64748B" }}>Loading Proof Score…</p>
      </Centered>
    );
  }

  if (!data) {
    return (
      <Centered>
        <p style={{ color: "#64748B" }}>This Proof Score link is invalid or has been made private.</p>
      </Centered>
    );
  }

  const scoreColor =
    data.overall_score >= 80 ? "#0F6E56" : data.overall_score >= 50 ? "#B45309" : "#B91C1C";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "40px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
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
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Github size={14} /> github.com/{data.github_username}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                {data.overall_score}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>Proof Score</div>
            </div>
          </div>

          <div style={{ padding: "20px 32px", display: "flex", gap: 24 }}>
            <Stat label="Verified" value={data.verified_count} color="#0F6E56" />
            <Stat label="Weak" value={data.weak_count} color="#B45309" />
            <Stat label="Unverified" value={data.unverified_count} color="#B91C1C" />
          </div>

          <p style={{ padding: "0 32px 20px", fontSize: 13, color: "#64748B" }}>
            Every skill below is checked against real commit history and language usage on GitHub —
            not just whether the word appears on the resume.
          </p>
        </div>

        {/* Per-skill breakdown */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 8, marginBottom: 20 }}>
          {data.skills.map((s) => {
            const meta = STATUS_META[s.status];
            const Icon = meta.Icon;
            return (
              <div
                key={s.skill}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{s.skill}</span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: meta.color,
                        background: meta.bg,
                      }}
                    >
                      <Icon size={11} /> {meta.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.confidence}% confidence</span>
                </div>

                {s.reason && <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>{s.reason}</p>}

                {s.evidence_repo && s.evidence_url && (
                  <a
                    href={s.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12.5, color: "#0F6E56", textDecoration: "none", fontWeight: 600 }}
                  >
                    → {s.evidence_repo}
                  </a>
                )}

                {s.suggested_bullet && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "10px 12px",
                      background: "#F8FAFC",
                      borderRadius: 10,
                      fontSize: 12.5,
                      color: "#334155",
                      fontStyle: "italic",
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
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 16, display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "Syne, sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
}
