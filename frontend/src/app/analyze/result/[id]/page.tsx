"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { ScoreRing } from "@/components/analysis/ScoreRing";
import { PersonaView } from "@/components/analysis/PersonaView";
import { SectionGrades } from "@/components/analysis/SectionGrades";
import { BulletRewriter } from "@/components/resume/BulletRewriter";
import { ToneReport } from "@/components/analysis/ToneReport";
import { InterviewQuestions } from "@/components/analysis/InterviewQuestions";
import { SkillAudit } from "@/components/analysis/SkillAudit";
import { DetailedAudit } from "@/components/analysis/DetailedAudit";
import { RecruiterHeatmap } from "@/components/analysis/RecruiterHeatmap";
import { GlobalEmployability } from "@/components/analysis/GlobalEmployability";
import { TopActions } from "@/components/analysis/TopActions";
import { CareerRoadmap } from "@/components/analysis/CareerRoadmap";
import { ATSReadinessReportCard } from "@/components/analysis/ATSReadinessReportCard";

const POLL_INTERVAL = 2500; // ms

type AnalysisStatus = "pending" | "processing" | "done" | "failed";

interface Analysis {
  id: string;
  status: AnalysisStatus;
  results_json: Record<string, any> | null;
  error_msg: string | null;
  created_at: string;
  completed_at: string | null;
}

const PROCESSING_STEPS = [
  "Parsing resume structure...",
  "Running ATS compatibility check...",
  "Analyzing through recruiter eyes...",
  "Checking tone and confidence...",
  "Predicting interview questions...",
  "Generating bullet improvements...",
  "Computing overall score...",
];

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Poll for results
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const { data } = await apiClient.get(`/analysis/${id}`);
        setAnalysis(data);
        if (data.status === "pending" || data.status === "processing") {
          timer = setTimeout(poll, POLL_INTERVAL);
        }
      } catch {
        timer = setTimeout(poll, POLL_INTERVAL * 2);
      }
    };

    poll();
    return () => clearTimeout(timer);
  }, [id]);

  // Animate processing step text
  useEffect(() => {
    if (analysis?.status !== "done") {
      const t = setInterval(() => setStepIdx((i) => (i + 1) % PROCESSING_STEPS.length), 2200);
      return () => clearInterval(t);
    }
  }, [analysis?.status]);

  if (!analysis || analysis.status === "pending" || analysis.status === "processing") {
    return <ProcessingScreen step={PROCESSING_STEPS[stepIdx]} />;
  }

  if (analysis.status === "failed") {
    return <FailedScreen error={analysis.error_msg} />;
  }

  const r = analysis.results_json!;
  const overall = r.overall_score ?? {};

  const TABS = [
    { id: "overview",   label: "Overview" },
    { id: "audit",      label: "13-Point Audit" },
    { id: "skills",     label: "Skill Audit" },
    { id: "bullets",    label: "Bullet Rewriter" },
    { id: "personas",   label: "Heatmap & Personas" },
    { id: "career",     label: "Career & Salary" },
    { id: "global",     label: "Global Employability" },
    { id: "actions",    label: "Top 10 Actions" },
    { id: "interview",  label: "Interview Prep" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>

      {/* ── Top bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, height: 64 }}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)" }}>ResumeAI</span>
          <span style={{ color: "var(--gray-300)" }}>›</span>
          <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Career Intelligence Report</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} color="var(--teal-500)" />
            <span style={{ fontSize: 13, color: "var(--gray-500)" }}>
              Completed {new Date(analysis.completed_at!).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Score hero ── */}
      <div style={{ background: "var(--teal-700)", color: "#fff", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <ScoreRing score={overall.score ?? 0} grade={overall.grade ?? "—"} size={120} />
          <div>
            <h1 style={{ fontSize: 28, margin: "0 0 8px", color: "#fff" }}>
              {overall.score >= 80 ? "Strong resume" : overall.score >= 65 ? "Good start — room to improve" : "Needs significant work"}
            </h1>
            <p style={{ margin: "0 0 16px", opacity: 0.8, fontSize: 15 }}>
              Your resume scored {overall.score}/100 overall.{" "}
              {overall.score < 70 ? "Fix the issues below to pass ATS filters." : "A few tweaks will make it exceptional."}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "ATS",     val: overall.breakdown?.ats ?? 0 },
                { label: "Content", val: overall.breakdown?.content ?? 0 },
                { label: "Tone",    val: overall.breakdown?.tone ?? 0 },
                { label: "Audit",   val: overall.breakdown?.audit ?? 0 },
              ].map((b) => (
                <div key={b.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", minWidth: 80, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{b.val || "—"}</div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "var(--teal-700)" : "var(--gray-500)",
                borderBottom: activeTab === tab.id ? "2px solid var(--teal-700)" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "overview"  && <OverviewTab r={r} />}
        {activeTab === "audit"     && <DetailedAudit data={r.audit} />}
        {activeTab === "skills"    && <SkillAudit data={r.skills} />}
        {activeTab === "bullets"   && <BulletRewriter data={r.bullets} />}
        {activeTab === "personas"  && (
          <div>
            <RecruiterHeatmap r={r} />
            <div style={{ marginTop: 32 }}>
              <PersonaView data={r.personas} r={r} />
            </div>
          </div>
        )}
        {activeTab === "career"    && <CareerRoadmap r={r} />}
        {activeTab === "global"    && <GlobalEmployability data={r.global_employability} />}
        {activeTab === "actions"   && <TopActions r={r} />}
        {activeTab === "interview" && <InterviewQuestions data={r.interview} />}
      </div>
    </div>
  );
}

function OverviewTab({ r }: { r: any }) {
  const ats = r.ats || {};
  const score = ats.score ?? 0;
  const isPass = ats.pass ?? (score >= 70);
  const densityPct = Math.round((ats.keyword_density ?? 0) * 100);

  return (
    <div>
      <ATSReadinessReportCard r={r} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <SectionGrades data={r.sections} />
        </div>

      {r.ats && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
          {/* Header & Score Banner */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, pb: 16, borderBottom: "1px solid var(--gray-100)" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "Syne, sans-serif" }}>ATS Compatibility Audit</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>
                Keyword density & formatting score vs Applicant Tracking Systems
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: isPass ? "var(--teal-700)" : "var(--coral-700)", fontFamily: "Syne" }}>
                  {score}<span style={{ fontSize: 14, color: "var(--gray-400)", fontWeight: 500 }}>/100</span>
                </div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: isPass ? "var(--teal-50)" : "var(--coral-50)",
                color: isPass ? "var(--teal-700)" : "var(--coral-700)",
                fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                border: `1px solid ${isPass ? "var(--teal-500)30" : "var(--coral-500)30"}`
              }}>
                {isPass ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {isPass ? "PASS (ATS Ready)" : "NEEDS WORK"}
              </div>
            </div>
          </div>

          {/* Keyword Density Bar */}
          <div style={{ marginBottom: 20, background: "var(--gray-50)", padding: 14, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "var(--gray-700)" }}>Keyword Density Match</span>
              <span style={{ color: "var(--teal-700)" }}>{densityPct}%</span>
            </div>
            <div style={{ height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.max(5, densityPct))}%`, background: isPass ? "var(--teal-500)" : "var(--coral-500)", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Format Issues */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 10 }}>FORMAT & STRUCTURE AUDIT</p>
            {ats.format_issues?.length > 0 && ats.format_issues[0] !== "None detected" ? (
              ats.format_issues.map((issue: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--coral-700)", alignItems: "flex-start", background: "var(--coral-50)40", padding: "8px 12px", borderRadius: 8 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2, color: "var(--coral-600)" }} />
                  <span>{issue}</span>
                </div>
              ))
            ) : (
              <div style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--teal-700)", background: "var(--teal-50)", padding: "8px 12px", borderRadius: 8, alignItems: "center" }}>
                <CheckCircle size={15} /> All header contact links & structural sections present cleanly.
              </div>
            )}
          </div>

          {/* Found Keywords */}
          {ats.found_keywords?.length > 0 && ats.found_keywords[0] !== "None" && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 10 }}>FOUND KEYWORDS ({ats.found_keywords.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ats.found_keywords.slice(0, 15).map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "var(--teal-50)", color: "var(--teal-800)", border: "1px solid var(--teal-500)30", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={11} color="var(--teal-600)" /> {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {ats.missing_keywords?.length > 0 && ats.missing_keywords[0] !== "None" && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 10 }}>RECOMMENDED / MISSING KEYWORDS ({ats.missing_keywords.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ats.missing_keywords.slice(0, 12).map((kw: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "var(--coral-50)", color: "var(--coral-800)", border: "1px solid var(--coral-500)30", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <AlertCircle size={11} color="var(--coral-600)" /> {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {r.ats?.improvements?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontFamily: "Syne, sans-serif" }}>Top ATS Improvements</h3>
          {r.ats.improvements.map((tip: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 14, color: "var(--gray-700)", alignItems: "flex-start", background: "var(--gray-50)", padding: 12, borderRadius: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--teal-100)", color: "var(--teal-800)", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ lineHeight: 1.5, flex: 1 }}>{tip}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessingScreen({ step }: { step: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", padding: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, animation: "pulse-ring 1.5s infinite" }}>
        <Loader2 size={28} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Analyzing your resume</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 15, marginBottom: 8 }}>{step}</p>
      <p style={{ color: "var(--gray-400)", fontSize: 13 }}>This takes about 20 seconds</p>
    </div>
  );
}

function FailedScreen({ error }: { error: string | null }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <AlertCircle size={48} color="var(--coral-500)" style={{ marginBottom: 20 }} />
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Analysis failed</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>{error || "Something went wrong. Please try again."}</p>
      <a href="/analyze/upload" style={{ padding: "12px 24px", background: "var(--teal-700)", color: "#fff", borderRadius: "var(--radius-md)", textDecoration: "none", fontWeight: 600 }}>Try again</a>
    </div>
  );
}
