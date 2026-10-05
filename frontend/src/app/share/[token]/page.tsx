"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Twitter, Linkedin, Copy, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData]     = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    apiClient.get(`/analysis/share/${token}`)
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingState />;
  if (!data)   return <NotFound />;

  const overall = data.overall_score ?? {};
  const score   = overall.score ?? 0;
  const grade   = overall.grade ?? "—";

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.15) 0%, transparent 60%), #0A0F1E", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Score card */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 24, border: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden", marginBottom: 20 }}>
          {/* Header band */}
          <div style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>SkillSync</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Resume Analysis Score</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 700, marginTop: 4 }}>Grade {grade}</div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ padding: "28px 32px" }}>
            {[
              { label: "ATS compatibility",   val: overall.breakdown?.ats     ?? 0 },
              { label: "Content quality",     val: overall.breakdown?.content ?? 0 },
              { label: "Tone & confidence",   val: overall.breakdown?.tone    ?? 0 },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "#94A3B8" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{item.val || "—"}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255, 255, 255, 0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.val}%`, background: "#2DD4BF", borderRadius: 4, boxShadow: "0 0 10px rgba(45, 212, 191, 0.4)" }} />
                </div>
              </div>
            ))}

            <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", margin: "20px 0 0" }}>
              Verified analysis report by <strong style={{ color: "#2DD4BF" }}>SkillSync AI</strong>
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", marginBottom: 12 }}>SHARE THIS RESULT</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#0A66C2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Linkedin size={15} /> LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=My resume scored ${score}/100 on SkillSync! Check yours 👇&url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#1DA1F2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Twitter size={15} /> Twitter
            </a>
            <button onClick={handleCopy}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease" }}
            >
              {copied ? <><CheckCircle size={14} color="#2DD4BF" /> Copied!</> : <><Copy size={14} /> Copy link</>}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ fontSize: 14, color: "#2DD4BF", fontWeight: 700, textDecoration: "none" }}>
            → Analyze your own resume free
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>Loading...</div>;
}

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>Result not found</h2>
      <p style={{ color: "#64748B" }}>This share link may have expired or been removed.</p>
      <a href="/" style={{ marginTop: 16, color: "#2DD4BF", fontWeight: 700, textDecoration: "none" }}>Go to SkillSync →</a>
    </div>
  );
}
