"use client";
import { CheckCircle2, ArrowUpRight, ShieldAlert, Sparkles, Layers } from "lucide-react";

export function TopActions({ r }: { r: any }) {
  const ats = r?.ats || {};
  const missingKws = ats.missing_keywords || [];
  const formatIssues = (ats.format_issues || []).filter((x: string) => x !== "None detected");

  const actions = [
    {
      rank: 1,
      title: "Add Demanded Target Role Keywords",
      impact: "+25% ATS Match",
      difficulty: "Easy (5 mins)",
      details: missingKws.length > 0 
        ? `Incorporate key missing keywords into your experience bullets: ${missingKws.slice(0, 4).join(", ")}.`
        : "Incorporate missing domain terms from your target job description into skills and project descriptions.",
      category: "ATS Optimization"
    },
    {
      rank: 2,
      title: "Quantify Experience Achievements with Numeric Metrics",
      impact: "+30% Recruiter Engagement",
      difficulty: "Medium (15 mins)",
      details: "Add specific percentage gains (e.g. 35% latency reduction), revenue figures, or user scale to your top 3 experience bullet points.",
      category: "Content Quality"
    },
    {
      rank: 3,
      title: "Add Verified Profile Handles to Header",
      impact: "+15% Credibility Score",
      difficulty: "Easy (2 mins)",
      details: "Ensure your contact header includes full clickable links to your LinkedIn profile and GitHub repository or online portfolio.",
      category: "Structure & Format"
    },
    {
      rank: 4,
      title: "Replace Weak Passive Verbs with Active Engineering Terms",
      impact: "+18% Tone Score",
      difficulty: "Easy (10 mins)",
      details: "Replace phrases like 'responsible for' or 'worked on' with high-impact verbs like 'Spearheaded', 'Architected', and 'Designed'.",
      category: "Tone & Confidence"
    },
    {
      rank: 5,
      title: "Substantiate Technical Skills with Work History Context",
      impact: "+20% Skill Authenticity",
      difficulty: "Medium (15 mins)",
      details: "Cross-reference every technical skill claimed in your skill stack with at least one detailed sentence in your work history or project descriptions.",
      category: "Skill Credibility"
    },
    {
      rank: 6,
      title: "Structure Bullet Points Using the STAR Method",
      impact: "+22% Interview Callback Rate",
      difficulty: "Medium (20 mins)",
      details: "Rephrase experience statements into Situation, Task, Action, and Result format for maximum clarity to hiring managers.",
      category: "Interview Readiness"
    },
    {
      rank: 7,
      title: "Format Section Headings & Remove Parsing Barriers",
      impact: "+12% Parsing Accuracy",
      difficulty: "Easy (5 mins)",
      details: formatIssues.length > 0 ? formatIssues[0] : "Use standard section titles ('Summary', 'Experience', 'Education', 'Skills') so ATS parsers recognize all blocks.",
      category: "ATS Parsing"
    },
    {
      rank: 8,
      title: "Align Summary Statement with Target Role",
      impact: "+15% First-Impression Score",
      difficulty: "Medium (10 mins)",
      details: "Update your 3-sentence summary at the top to highlight your core technical strengths and target role alignment.",
      category: "Executive Summary"
    },
    {
      rank: 9,
      title: "Add Live Project Links or Open Source Contributions",
      impact: "+18% Technical Depth",
      difficulty: "Medium (30 mins)",
      details: "Include live demo URLs or GitHub repository links for your top 2 technical projects.",
      category: "Project Evaluation"
    },
    {
      rank: 10,
      title: "Target 2-5 Year Future Skills Forecast",
      impact: "+25% Long-Term Readiness",
      difficulty: "High (Ongoing)",
      details: "Incorporate rapidly growing tech stack skills (e.g. Cloud Infrastructure, AI API Integration, CI/CD Pipelines) into your ongoing learning roadmap.",
      category: "Future Forecast"
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>Top 10 High-Impact Action Plan</h2>
        <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>
          Prioritized recommendations ranked by expected increase in interview callback rate.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {actions.map((act) => (
          <div key={act.rank} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--teal-50)", color: "var(--teal-700)", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              #{act.rank}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "var(--gray-900)" }}>{act.title}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-700)", border: "1px solid var(--teal-500)30" }}>
                    {act.impact}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "var(--gray-100)", color: "var(--gray-600)" }}>
                    {act.difficulty}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--gray-600)", lineHeight: 1.5 }}>{act.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
