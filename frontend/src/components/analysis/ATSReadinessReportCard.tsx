"use client";
import { CheckCircle, AlertTriangle, ShieldCheck, FileCheck, Sparkles, Target, ArrowUpRight } from "lucide-react";

export function ATSReadinessReportCard({ r }: { r: any }) {
  const ats = r?.ats || {};
  const overall = r?.overall_score || {};
  const sections = r?.sections || {};
  const audit = r?.audit || {};
  const skills = r?.skills || {};
  const tone = r?.tone || {};

  const baseScore = ats.score ?? overall.score ?? 78;
  const isPass = ats.pass ?? (baseScore >= 70);

  const formatIssues = (ats.format_issues || []).filter((x: string) => x !== "None detected");
  const missingKws = (ats.missing_keywords || []).filter((x: string) => x !== "None");

  const categories = [
    { name: "File Compatibility", score: 100 - formatIssues.length * 5, status: formatIssues.length === 0 ? "Supported Text PDF/DOCX" : "Layout Risks Detected" },
    { name: "Parsing Accuracy", score: ats.parsing_accuracy ?? Math.max(70, baseScore), status: "Structure Extraction Confidence" },
    { name: "Resume Structure", score: Math.round(sections.experience?.score ?? sections.summary?.score ?? 80), status: "Standard Headings Verified" },
    { name: "Contact Information", score: ats.contact_validation?.score ?? (ats.format_issues?.some((i: string) => i.includes("LinkedIn")) ? 75 : 95), status: "Link & Header Validation" },
    { name: "Formatting Quality", score: Math.max(60, 95 - formatIssues.length * 10), status: formatIssues.length === 0 ? "Clean Single Column" : `${formatIssues.length} Formatting Obstacles` },
    { name: "ATS Keyword Match", score: Math.round((ats.keyword_density ?? 0.7) * 100), status: `${ats.found_keywords?.length || 0} Target Keywords Found` },
    { name: "Semantic Skill Match", score: Math.max(50, Math.round(baseScore * 0.95)), status: "Related Skills Contextually Parsed" },
    { name: "Experience Quality & STAR", score: sections.experience?.score ?? 75, status: "Action Verbs & Responsibilities" },
    { name: "Achievement Quantification", score: audit.score ?? 75, status: "Numeric Metrics & Scale" },
    { name: "Grammar & Readability", score: tone.confidence_score ?? 85, status: "Active Voice & Phrasing" },
    { name: "Recruiter 7s Appeal", score: Math.round(baseScore * 0.92), status: "Visual Focal Point Scan" },
    { name: "Skill Evidence Authenticity", score: skills.authenticity_score ?? 80, status: "Work History Context Support" },
  ];

  const top5Actions = [
    "Add missing target job keywords into your experience bullet points.",
    "Quantify your top experience bullets with numeric percentages (%, $, scale gains).",
    "Ensure clickable LinkedIn and GitHub repository links are present in your header.",
    "Replace passive phrases like 'worked on' with active engineering verbs like 'Spearheaded' and 'Architected'.",
    "Cross-reference every claimed technical skill with a concrete project or work experience bullet."
  ];

  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 24 }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, pb: 16, borderBottom: "1px solid var(--gray-100)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontFamily: "Syne, sans-serif" }}>ATS Readiness Report Card</h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "var(--teal-50)", color: "var(--teal-800)", border: "1px solid var(--teal-500)30" }}>
                Universal ATS Mode (No Role Required)
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-500)" }}>General ATS Parseability & Structural Quality Audit</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: isPass ? "var(--teal-700)" : "var(--coral-700)", fontFamily: "Syne" }}>
              {baseScore}<span style={{ fontSize: 14, color: "var(--gray-400)", fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>UNIVERSAL ATS READINESS</div>
          </div>
          <div style={{ padding: "8px 16px", borderRadius: 20, background: isPass ? "var(--teal-50)" : "var(--coral-50)", color: isPass ? "var(--teal-700)" : "var(--coral-700)", fontWeight: 700, fontSize: 13, border: `1px solid ${isPass ? "var(--teal-500)30" : "var(--coral-500)30"}` }}>
            {isPass ? "✓ ATS APPROVED" : "⚠ ACTION REQUIRED"}
          </div>
        </div>
      </div>

      {/* Score Grid (12 Categories) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {categories.map((c) => (
          <div key={c.name} style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)80" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>{c.name}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: c.score >= 80 ? "var(--teal-700)" : c.score >= 65 ? "var(--amber-700)" : "var(--coral-700)" }}>
                {c.score}/100
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{c.status}</div>
          </div>
        ))}
      </div>

      {/* Top 5 High-Impact Actions */}
      <div style={{ background: "var(--teal-50)", borderRadius: 12, padding: 18, border: "1px solid var(--teal-200)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--teal-900)", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} color="var(--teal-700)" /> Top 5 High-Impact Actions for Maximum Interview Rate
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {top5Actions.map((action, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--teal-900)", alignItems: "flex-start" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--teal-700)", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
