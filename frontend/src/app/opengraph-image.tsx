import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillSync — AI Resume Analyzer & Career Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0A0F1E",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(29, 158, 117, 0.28) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)",
          padding: "64px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Brand & Badge Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            S
          </div>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Skill<span style={{ color: "#2DD4BF" }}>Sync</span>
          </span>
          <span
            style={{
              marginLeft: 12,
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 20,
              backgroundColor: "rgba(29, 158, 117, 0.2)",
              color: "#2DD4BF",
              border: "1px solid rgba(45, 212, 191, 0.3)",
            }}
          >
            Multi-Persona Career Intelligence
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1
            style={{
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: 960,
            }}
          >
            Analyze Your Resume Through ATS, Recruiter & Hiring Manager Eyes
          </h1>
          <p
            style={{
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.75)",
              margin: 0,
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            Instant 30+ ATS criteria checks, skill authenticity evidence graphs, and targeted bullet rewrites before applying.
          </p>
        </div>

        {/* Feature Badges & URL Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#2DD4BF", fontWeight: 700 }}>
            ✓ 30+ ATS Checks
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#2DD4BF", fontWeight: 700 }}>
            ✓ Evidence Graph Verification
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#2DD4BF", fontWeight: 700 }}>
            ✓ Interview Question Predictor
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "rgba(255, 255, 255, 0.6)", fontWeight: 600, marginLeft: "auto" }}>
            by Ashwani Pandey
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
