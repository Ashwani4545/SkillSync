"use client";
import { useState } from "react";
import { Eye, Flame, AlertCircle, Sparkles, CheckCircle } from "lucide-react";

export function RecruiterHeatmap({ r }: { r: any }) {
  const [activeView, setActiveView] = useState<"attention" | "first_glance">("attention");
  
  const ats = r?.ats || {};
  const sections = r?.sections || {};
  const experience = r?.sections?.experience || {};
  const skills = r?.ats?.found_keywords || [];
  const missing = r?.ats?.missing_keywords || [];

  const attentionZones = [
    {
      name: "Header & Contact Links",
      intensity: "High (0.8s)",
      color: "var(--teal-700)",
      status: (ats.format_issues?.length === 0 || ats.format_issues?.[0] === "None detected") ? "High Impact" : "Needs Fix",
      notes: "Recruiters check for clickable LinkedIn/GitHub handles immediately."
    },
    {
      name: "Current Job Title & Company",
      intensity: "Critical (2.5s)",
      color: "var(--blue-700)",
      status: "Primary Focus",
      notes: "First focal point evaluated during 7-10 second initial screening."
    },
    {
      name: "Technical Skill Stack",
      intensity: "High (2.0s)",
      color: "var(--purple-700)",
      status: "Matched Keywords",
      notes: `${skills.length} core technical keywords extracted by parsing algorithms.`
    },
    {
      name: "Quantified Bullet Metrics",
      intensity: "Medium-High (1.5s)",
      color: "var(--amber-700)",
      status: experience.score >= 75 ? "Strong Impact" : "Metric Opportunity",
      notes: "Numbers (%, $, scale) immediately draw human recruiter gaze."
    },
    {
      name: "Education & Certifications",
      intensity: "Low-Medium (0.7s)",
      color: "var(--gray-600)",
      status: "Baseline Check",
      notes: "Verified quickly near the end of initial 10-second pass."
    }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>7-10 Second Recruiter Eye-Tracking Heatmap</h2>
          <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>
            Simulating human recruiter initial gaze pattern & visual focal points.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setActiveView("attention")}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeView === "attention" ? "var(--teal-700)" : "var(--gray-100)",
              color: activeView === "attention" ? "#fff" : "var(--gray-700)"
            }}
          >
            Attention Zones
          </button>
          <button
            onClick={() => setActiveView("first_glance")}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeView === "first_glance" ? "var(--teal-700)" : "var(--gray-100)",
              color: activeView === "first_glance" ? "#fff" : "var(--gray-700)"
            }}
          >
            7-Second Skimming Diagnosis
          </button>
        </div>
      </div>

      {activeView === "attention" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Visual Heatmap Breakdown */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={18} color="var(--coral-600)" /> Gaze Duration & Focus Hotspots
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {attentionZones.map((z, i) => (
                <div key={i} style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, borderLeft: `4px solid ${z.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)" }}>{z.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: z.color }}>{z.intensity}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0, lineHeight: 1.4 }}>{z.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Skimming Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--teal-100)" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "var(--teal-800)", display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={16} /> What Recruiters Notice First
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--teal-900)", lineHeight: 1.6 }}>
                <li>Clear experience progression and job titles</li>
                <li>Key tech stack keywords in context ({skills.slice(0, 4).join(", ") || "Core skills"})</li>
                <li>Numeric results and percentages in top 2 role bullets</li>
              </ul>
            </div>

            <div style={{ background: "var(--coral-50)", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--coral-100)" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "var(--coral-800)", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={16} /> Friction Points (Eyes Skip Over)
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--coral-900)", lineHeight: 1.6 }}>
                {missing.length > 0 && <li>Missing demanded target keywords: {missing.slice(0, 3).join(", ")}</li>}
                <li>Dense wall-of-text paragraphs with no bolding or metrics</li>
                <li>Vague bullet starters like "responsible for" or "helped with"</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontFamily: "Syne, sans-serif" }}>7-Second Skimming Breakdown</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={{ background: "var(--gray-50)", padding: 18, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 6 }}>FIRST 2 SECONDS</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--teal-700)", marginBottom: 8 }}>Header & Job Title</div>
              <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0, lineHeight: 1.4 }}>Evaluates target role alignment and contact links.</p>
            </div>

            <div style={{ background: "var(--gray-50)", padding: 18, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 6 }}>SECONDS 3 TO 6</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--blue-700)", marginBottom: 8 }}>Experience Bullets</div>
              <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0, lineHeight: 1.4 }}>Scans for quantifiable metric results and action verbs.</p>
            </div>

            <div style={{ background: "var(--gray-50)", padding: 18, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 6 }}>SECONDS 7 TO 10</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--purple-700)", marginBottom: 8 }}>Skills & Education</div>
              <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0, lineHeight: 1.4 }}>Confirms technical keywords and degree credentials.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
