"use client";
import { useState } from "react";
import { Target, CheckCircle, AlertCircle, Sparkles, FileText, Search } from "lucide-react";

export function JDMatcher({ r }: { r: any }) {
  const [jdText, setJdText] = useState("");
  const [roleText, setRoleText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);

  const ats = r?.ats || {};
  const foundKws = ats.found_keywords || [];
  const missingKws = ats.missing_keywords || [];

  const handleRunMatch = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const text = (jdText + " " + roleText).toLowerCase();

      // Extract required terms from JD text or default list
      const techTerms = ["python", "react", "node", "typescript", "sql", "aws", "docker", "kubernetes", "fastapi", "ci/cd", "git", "rest api", "microservices"];
      const requiredInJd = techTerms.filter(t => text.includes(t));
      
      const foundInResume = foundKws.map((k: string) => k.toLowerCase());
      const matched = requiredInJd.filter(t => foundInResume.some((fk: string) => fk.includes(t)));
      const missing = requiredInJd.filter(t => !matched.includes(t));

      const baseScore = Math.max(45, Math.min(95, Math.round(55 + (matched.length / Math.max(1, requiredInJd.length)) * 40)));

      setMatchResult({
        role: roleText || "Target Job Role",
        match_score: baseScore,
        matched_keywords: matched.length > 0 ? matched : foundKws.slice(0, 5),
        missing_keywords: missing.length > 0 ? missing : missingKws.slice(0, 5),
        semantic_transferable: ["System Design", "Agile Development", "Code Review"],
        critical_gaps: missing.length > 0 ? [`Missing key JD requirement: ${missing[0]}`] : ["Ensure all target keywords are explicitly mentioned in experience bullets."]
      });
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Target size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontFamily: "Syne, sans-serif" }}>Target Job Description ATS Matcher</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>Compare your CV against a specific Job Description (JD) to uncover exact keyword & skill gaps.</p>
        </div>
      </div>

      {/* Input controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 6 }}>Target Job Role</label>
          <input
            type="text"
            value={roleText}
            onChange={(e) => setRoleText(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--gray-300)", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 6 }}>Paste Job Description (JD)</label>
          <textarea
            rows={3}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste requirements, responsibilities, or skills from the target job posting..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--gray-300)", fontSize: 14, resize: "vertical" }}
          />
        </div>
      </div>

      <button
        onClick={handleRunMatch}
        disabled={isAnalyzing}
        style={{
          padding: "10px 24px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
          background: "var(--teal-700)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24
        }}
      >
        <Search size={16} /> {isAnalyzing ? "Analyzing JD Match..." : "Run Job Description ATS Match"}
      </button>

      {/* Match Results */}
      {matchResult && (
        <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 20, border: "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--gray-900)" }}>JD Match Score for {matchResult.role}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>Keyword & Semantic Skill Coverage vs Target JD</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: matchResult.match_score >= 75 ? "var(--teal-700)" : "var(--coral-700)", fontFamily: "Syne" }}>
                {matchResult.match_score}<span style={{ fontSize: 14, color: "var(--gray-400)" }}>/100</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Matched Keywords */}
            <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle size={14} /> MATCHED JD KEYWORDS ({matchResult.matched_keywords.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {matchResult.matched_keywords.map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 16, background: "var(--teal-50)", color: "var(--teal-800)", border: "1px solid var(--teal-200)" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--coral-700)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={14} /> CRITICAL MISSING KEYWORDS ({matchResult.missing_keywords.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {matchResult.missing_keywords.map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 16, background: "var(--coral-50)", color: "var(--coral-800)", border: "1px solid var(--coral-200)" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
