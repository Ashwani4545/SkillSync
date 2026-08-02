"use client";
import { useState } from "react";
import { TrendingUp, DollarSign, Calendar, BookOpen, Target, ShieldCheck } from "lucide-react";

export function CareerRoadmap({ r }: { r: any }) {
  const [activeSubTab, setActiveSubTab] = useState<"career" | "salary" | "learning">("career");

  const career = r?.career || {};
  const salary = r?.salary || {};
  const currentLevel = career.current_level || { title: "Software Engineer", seniority: "mid", years_experience: 3 };
  const nextRoles = career.next_roles || [
    {
      title: "Senior Software Engineer",
      timeline: "12-18 months",
      probability: 85,
      salary_range: "$135k-$160k",
      why_realistic: "Solid engineering experience. Ready to take technical ownership of larger modules.",
      required_skills: ["System Architecture", "CI/CD Pipeline Optimization"],
      action_plan: ["Lead technical design on next major sprint project", "Implement end-to-end automated testing", "Mentor junior engineers"]
    }
  ];

  const salaryBase = salary.base_salary || { low: 95000, mid: 125000, high: 155000, currency: "USD" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>Career Trajectory, Salary & Learning Roadmap</h2>
          <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>
            Promotion paths, market compensation benchmarks, and structured 30-day to 1-year learning priorities.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setActiveSubTab("career")}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeSubTab === "career" ? "var(--teal-700)" : "var(--gray-100)",
              color: activeSubTab === "career" ? "#fff" : "var(--gray-700)"
            }}
          >
            Career Path
          </button>
          <button
            onClick={() => setActiveSubTab("salary")}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeSubTab === "salary" ? "var(--teal-700)" : "var(--gray-100)",
              color: activeSubTab === "salary" ? "#fff" : "var(--gray-700)"
            }}
          >
            Salary Predictor
          </button>
          <button
            onClick={() => setActiveSubTab("learning")}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeSubTab === "learning" ? "var(--teal-700)" : "var(--gray-100)",
              color: activeSubTab === "learning" ? "#fff" : "var(--gray-700)"
            }}
          >
            Learning Roadmap
          </button>
        </div>
      </div>

      {activeSubTab === "career" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Current Level */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "var(--teal-700)" }}>Current Level Assessment</h3>
            <div style={{ background: "var(--teal-50)", padding: 18, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-800)", textTransform: "uppercase", marginBottom: 4 }}>INFERRED POSITION</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--teal-900)" }}>{currentLevel.title}</div>
              <div style={{ fontSize: 13, color: "var(--teal-700)", marginTop: 4 }}>Seniority: {currentLevel.seniority} · {currentLevel.years_experience} years estimated exp</div>
            </div>

            {career.unique_advantage && (
              <div style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.5 }}>
                <strong>Unique Advantage:</strong> {career.unique_advantage}
              </div>
            )}
          </div>

          {/* Next Target Roles */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Next Target Role (12-18 Months)</h3>
            {nextRoles.map((role: any, i: number) => (
              <div key={i} style={{ background: "var(--gray-50)", padding: 16, borderRadius: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>{role.title}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", background: "var(--teal-50)", padding: "3px 8px", borderRadius: 12 }}>{role.probability}% Likelihood</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--gray-600)", margin: "0 0 10px", lineHeight: 1.4 }}>{role.why_realistic}</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 4 }}>ACTION PLAN</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--gray-700)" }}>
                  {role.action_plan?.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "salary" && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontFamily: "Syne, sans-serif" }}>2025 Market Salary Benchmarks</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "var(--gray-50)", padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 6 }}>25th PERCENTILE</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-700)" }}>${salaryBase.low?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Entry / Baseline</div>
            </div>

            <div style={{ background: "var(--teal-50)", padding: 20, borderRadius: 12, textAlign: "center", border: "1px solid var(--teal-200)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-800)", marginBottom: 6 }}>MEDIAN MARKET VALUE</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--teal-900)" }}>${salaryBase.mid?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--teal-700)", marginTop: 4 }}>Expected Compensation</div>
            </div>

            <div style={{ background: "var(--purple-50)", padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-800)", marginBottom: 6 }}>90th PERCENTILE</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple-900)" }}>${salaryBase.high?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--purple-700)", marginTop: 4 }}>Top Tier Target</div>
            </div>
          </div>

          {salary.factors_boosting_salary?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "var(--teal-700)" }}>Factors Boosting Earning Potential</h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--gray-700)" }}>
                {salary.factors_boosting_salary.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "learning" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--teal-700)" }}>30-Day Quick Wins Plan</h4>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6 }}>
              <li>Update CV experience bullets with quantified metrics (%, $, user scale)</li>
              <li>Add clickable LinkedIn and portfolio links in contact header</li>
              <li>Complete 1 key technical certification matching target job keywords</li>
            </ul>
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--blue-700)" }}>90-Day Skill Building Plan</h4>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6 }}>
              <li>Build & deploy 1 end-to-end technical project utilizing modern cloud stack</li>
              <li>Contribute to open-source repository or document system architecture</li>
              <li>Practice STAR method technical scenario responses</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
