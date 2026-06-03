"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Share2, Twitter, Linkedin, Copy, CheckCircle } from "lucide-react";
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
  const scoreColor = score >= 80 ? "var(--teal-700)" : score >= 65 ? "var(--amber-700)" : "var(--coral-700)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Score card */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", overflow: "hidden", marginBottom: 16 }}>
          {/* Header band */}
          <div style={{ background: "var(--teal-700)", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, color: "#fff" }}>ResumeAI</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Resume Analysis Score</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: "#fff", fontFamily: "Syne", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Grade {grade}</div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ padding: "24px 28px" }}>
            {[
              { label: "ATS compatibility",   val: overall.breakdown?.ats     ?? 0 },
              { label: "Content quality",     val: overall.breakdown?.content ?? 0 },
              { label: "Tone & confidence",   val: overall.breakdown?.tone    ?? 0 },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: "var(--gray-600)" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{item.val || "—"}</span>
                </div>
                <div style={{ height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.val}%`, background: "var(--teal-500)", borderRadius: 3 }} />
                </div>
              </div>
            ))}

            <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", margin: "16px 0 0" }}>
              Analyzed with <strong style={{ color: "var(--teal-700)" }}>ResumeAI</strong> · resumeai.app
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", marginBottom: 12 }}>SHARE THIS RESULT</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-md)", background: "#0A66C2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Linkedin size={15} /> LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=My resume scored ${score}/100 on ResumeAI! Check yours 👇&url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-md)", background: "#1DA1F2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Twitter size={15} /> Twitter
            </a>
            <button onClick={handleCopy}
              style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {copied ? <><CheckCircle size={14} color="var(--teal-500)" /> Copied!</> : <><Copy size={14} /> Copy link</>}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/" style={{ fontSize: 13, color: "var(--teal-700)", fontWeight: 600, textDecoration: "none" }}>
            → Analyze your own resume free
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-400)" }}>Loading...</div>;
}
function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--gray-400)" }}>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: "var(--gray-700)" }}>Result not found</h2>
      <p>This share link may have expired or been removed.</p>
      <a href="/" style={{ marginTop: 16, color: "var(--teal-700)", fontWeight: 600, textDecoration: "none" }}>Go to ResumeAI →</a>
    </div>
  );
}
