"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle, AlertCircle, Loader2, ShieldCheck, ShieldAlert, ShieldX,
  TrendingUp, Target, Map, ListChecks, MessageSquareQuote, Sparkles,
} from "lucide-react";
import { apiClient } from "../../../../lib/api";
import { ScoreRing } from "../../../../components/analysis/ScoreRing";
import { PersonaView } from "../../../../components/analysis/PersonaView";

/**
 * Rebuilt for the unified Career Intelligence Engine's output schema
 * (ai_engine/career_intelligence_engine.py) — candidate_profile,
 * evidence_graph, universal_ats, job_match, career_positioning,
 * target_role, career_readiness, skill_gaps, career_path, career_roadmap,
 * bullet_rewrites, interview_prediction, persona_analysis,
 * priority_actions. Replaces the old page, which read a completely
 * different flat schema (ats/sections/bullets/personas/...) from the
 * previous fragmented 11-analyzer pipeline.
 */

const POLL_INTERVAL = 2500;

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
  "Building your candidate career profile...",
  "Cross-checking skills against real evidence...",
  "Scoring ATS readiness...",
  "Analyzing through ATS, recruiter, and hiring manager eyes...",
  "Mapping your realistic career pathway...",
  "Prioritizing the highest-impact actions...",
];

const EVIDENCE_META: Record<string, { color: string; bg: string; Icon: any; label: string }> = {
  EVIDENCED:            { color: "var(--teal-700)",  bg: "var(--teal-50)",  Icon: ShieldCheck, label: "Evidenced" },
  PARTIALLY_EVIDENCED:  { color: "var(--amber-700)", bg: "var(--amber-50)", Icon: ShieldAlert, label: "Partially evidenced" },
  UNSUPPORTED:          { color: "var(--coral-700)", bg: "var(--coral-50)", Icon: ShieldX,     label: "Unsupported" },
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

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
  const cr = r.career_readiness ?? {};
  const overallScore = cr.overall_career_readiness ?? 0;

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "evidence",  label: "Skill Evidence" },
    { id: "personas",  label: "Personas" },
    { id: "career",    label: "Career Path" },
    { id: "roadmap",   label: "Roadmap" },
    { id: "bullets",   label: "Bullet Rewrites" },
    { id: "interview", label: "Interview Prep" },
    { id: "actions",   label: "Top Actions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, height: 64 }}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)" }}>SkillSync</span>
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

      {/* Score hero */}
      <div style={{ background: "var(--teal-700)", color: "#fff", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <ScoreRing score={overallScore} grade={scoreToGrade(overallScore)} size={120} />
          <div>
            <h1 style={{ fontSize: 28, margin: "0 0 8px", color: "#fff" }}>
              {overallScore >= 80 ? "Strong career readiness" : overallScore >= 60 ? "Good foundation — room to grow" : "Significant gaps to close"}
            </h1>
            <p style={{ margin: "0 0 16px", opacity: 0.85, fontSize: 15, maxWidth: 640 }}>{cr.explanation || "Overall career readiness combines ATS readiness, skill evidence, and experience depth."}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "ATS Readiness",       val: cr.resume_ats_readiness },
                { label: "Job Match",           val: cr.job_match },
                { label: "Skill Readiness",     val: cr.skill_readiness },
                { label: "Experience Readiness",val: cr.experience_readiness },
              ].map((b) => (
                <div key={b.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", minWidth: 100, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{b.val ?? "—"}</div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "14px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "var(--teal-700)" : "var(--gray-500)",
                borderBottom: activeTab === tab.id ? "2px solid var(--teal-700)" : "2px solid transparent",
                whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "overview"  && <OverviewTab r={r} />}
        {activeTab === "evidence"  && <EvidenceTab r={r} />}
        {activeTab === "personas"  && (
          <PersonaView
            data={{
              ats_bot: {
                score: r.persona_analysis?.ats?.score,
                issues: r.persona_analysis?.ats?.concerns,
                passed_checks: r.persona_analysis?.ats?.strengths,
              },
              hr_recruiter: {
                score: r.persona_analysis?.hr_recruiter?.score,
                red_flags: r.persona_analysis?.hr_recruiter?.concerns,
                green_flags: r.persona_analysis?.hr_recruiter?.strengths,
              },
              hiring_manager: {
                score: r.persona_analysis?.hiring_manager?.score,
                credibility_gaps: r.persona_analysis?.hiring_manager?.concerns,
                strengths: r.persona_analysis?.hiring_manager?.strengths,
              },
            }}
            r={{ ats: { score: r.universal_ats?.universal_ats_score } }}
          />
        )}
        {activeTab === "career"    && <CareerTab r={r} />}
        {activeTab === "roadmap"   && <RoadmapTab r={r} />}
        {activeTab === "bullets"   && <BulletsTab r={r} />}
        {activeTab === "interview" && <InterviewTab r={r} />}
        {activeTab === "actions"   && <ActionsTab r={r} />}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "Syne, sans-serif" }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--gray-500)" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function OverviewTab({ r }: { r: any }) {
  const ats = r.universal_ats ?? {};
  const jm = r.job_match ?? {};
  const profile = r.candidate_profile ?? {};

  return (
    <div>
      <Card title="Universal ATS Readiness" subtitle="How reliably a typical ATS can parse and understand this resume">
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>{ats.universal_ats_score ?? "—"}<span style={{ fontSize: 16, color: "var(--gray-400)" }}>/100</span></div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--gray-600)", flex: 1 }}>{ats.explanation}</p>
        </div>
        {ats.issues?.length > 0 && (
          <div>
            {ats.issues.map((issue: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--coral-700)", background: "var(--coral-50)", padding: "8px 12px", borderRadius: 8, marginBottom: 6 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {issue}
              </div>
            ))}
          </div>
        )}
      </Card>

      {jm.job_match_score !== null && jm.job_match_score !== undefined && (
        <Card title="Job Match" subtitle="Separate from ATS readiness — how well this resume matches the target job description">
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne", marginBottom: 12 }}>{jm.job_match_score}/100</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <KeywordGroup label="Matched" items={jm.matched} color="var(--teal-700)" bg="var(--teal-50)" />
            <KeywordGroup label="Missing" items={jm.missing} color="var(--coral-700)" bg="var(--coral-50)" />
          </div>
        </Card>
      )}

      <Card title="Candidate Career Profile" subtitle={`Career level: ${profile.career_level?.level ?? "Unknown"} (${profile.career_level?.confidence ?? "—"} confidence)`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <ProfileStat label="Experience entries" value={profile.experience?.length ?? 0} />
          <ProfileStat label="Projects" value={profile.projects?.length ?? 0} />
          <ProfileStat label="Skills listed" value={
            Object.values(profile.skills ?? {}).reduce((sum: number, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) as number
          } />
          <ProfileStat label="Certifications" value={profile.certifications?.length ?? 0} />
        </div>
      </Card>
    </div>
  );
}

function KeywordGroup({ label, items, color, bg }: { label: string; items?: string[]; color: string; bg: string }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 8 }}>{label} ({items?.length ?? 0})</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(items ?? []).map((kw, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: bg, color }}>{kw}</span>
        ))}
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne", color: "var(--gray-900)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{label}</div>
    </div>
  );
}

function EvidenceTab({ r }: { r: any }) {
  const graph = r.evidence_graph ?? [];
  return (
    <Card title="Skill Evidence Graph" subtitle="Every skill checked against real supporting evidence in your experience and projects — not just whether it's listed">
      {graph.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No skills found to evaluate.</p>
      ) : (
        <div>
          {graph.map((e: any, i: number) => {
            const meta = EVIDENCE_META[e.status] ?? EVIDENCE_META.UNSUPPORTED;
            const Icon = meta.Icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < graph.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{e.skill}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
                  <Icon size={13} /> {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function CareerTab({ r }: { r: any }) {
  const positioning = r.career_positioning ?? {};
  const target = r.target_role ?? {};
  const path = r.career_path?.steps ?? [];

  return (
    <div>
      <Card title="Career Positioning" subtitle={positioning.market_positioning}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <TagList label="Strongest skills" items={positioning.strongest_skills} color="var(--teal-700)" bg="var(--teal-50)" />
          <TagList label="Weak areas" items={positioning.weak_areas} color="var(--coral-700)" bg="var(--coral-50)" />
        </div>
      </Card>

      {positioning.best_fit_roles?.length > 0 && (
        <Card title="Best-Fit Roles">
          {positioning.best_fit_roles.map((role: any, i: number) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: i < positioning.best_fit_roles.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{role.role}</span>
                <span style={{ color: "var(--teal-700)", fontWeight: 700 }}>{role.match_score}/100</span>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--gray-600)" }}>{role.why_it_fits}</p>
              {role.missing_requirements?.length > 0 && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--coral-700)" }}>Missing: {role.missing_requirements.join(", ")}</p>
              )}
            </div>
          ))}
        </Card>
      )}

      {(target.strengths?.length > 0 || target.gaps?.length > 0) && (
        <Card title="Target Role Analysis" subtitle={`Readiness: ${target.readiness ?? "—"}`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <TagList label="Strengths" items={target.strengths} color="var(--teal-700)" bg="var(--teal-50)" />
            <TagList label="Gaps" items={target.gaps} color="var(--coral-700)" bg="var(--coral-50)" />
          </div>
        </Card>
      )}

      {path.length > 0 && (
        <Card title="Career Pathway">
          {path.map((step: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--teal-100)", color: "var(--teal-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{step.stage}: {step.role}</div>
                <p style={{ margin: "4px 0", fontSize: 13, color: "var(--gray-600)" }}>{step.why_this_step}</p>
                {step.whats_missing && step.whats_missing !== "N/A" && (
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--coral-700)" }}>Missing: {step.whats_missing}</p>
                )}
                {step.what_to_do && step.what_to_do !== "N/A" && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)" }}>Next: {step.what_to_do}</p>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function TagList({ label, items, color, bg }: { label: string; items?: string[]; color: string; bg: string }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(items ?? []).length === 0 ? <span style={{ fontSize: 13, color: "var(--gray-400)" }}>None identified</span> :
          items!.map((it, i) => <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: bg, color }}>{it}</span>)}
      </div>
    </div>
  );
}

function RoadmapTab({ r }: { r: any }) {
  const roadmap = r.career_roadmap ?? {};
  const stages = [
    { key: "0_30_days", label: "0–30 Days" }, { key: "31_60_days", label: "31–60 Days" },
    { key: "61_90_days", label: "61–90 Days" }, { key: "3_6_months", label: "3–6 Months" },
    { key: "6_12_months", label: "6–12 Months" }, { key: "1_3_years", label: "1–3 Years" },
  ];

  return (
    <Card title="Career Roadmap" subtitle="Actionable steps mapped to a realistic timeline">
      {stages.map(({ key, label }) => {
        const stage = roadmap[key] ?? {};
        const hasContent = Object.values(stage).some((v: any) => Array.isArray(v) ? v.length > 0 : !!v);
        if (!hasContent) return null;
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Map size={15} color="var(--teal-700)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
            </div>
            {stage.skills_to_learn?.length > 0 && <RoadmapLine label="Learn" items={stage.skills_to_learn} />}
            {stage.projects_to_build?.length > 0 && <RoadmapLine label="Build" items={stage.projects_to_build} />}
            {stage.resume_changes?.length > 0 && <RoadmapLine label="Resume" items={stage.resume_changes} />}
            {stage.interview_prep?.length > 0 && <RoadmapLine label="Interview prep" items={stage.interview_prep} />}
          </div>
        );
      })}
    </Card>
  );
}

function RoadmapLine({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 4, paddingLeft: 23 }}>
      <strong>{label}:</strong> {items.join(", ")}
    </div>
  );
}

function BulletsTab({ r }: { r: any }) {
  const rewrites = r.bullet_rewrites ?? [];
  return (
    <Card title="Bullet Rewrites" subtitle="Weak bullets rewritten — metrics are never invented; add real numbers where marked">
      {rewrites.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No weak bullets identified.</p>
      ) : rewrites.map((b: any, i: number) => (
        <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < rewrites.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--coral-700)" }}><strong>Before:</strong> {b.current_bullet}</p>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--teal-700)" }}><strong>After:</strong> {b.improved_version}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)" }}>{b.why_better}</p>
        </div>
      ))}
    </Card>
  );
}

function InterviewTab({ r }: { r: any }) {
  const questions = r.interview_prediction?.questions ?? [];
  return (
    <Card title="Predicted Interview Questions" subtitle="Generated from claims on your resume that lack full supporting evidence">
      {questions.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No high-risk areas identified.</p>
      ) : questions.map((q: any, i: number) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
          <MessageSquareQuote size={16} color="var(--teal-700)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14 }}>{q.question}</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)" }}>{q.why_this_question}</p>
          </div>
          {q.high_risk && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--coral-700)", background: "var(--coral-50)", padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>HIGH RISK</span>}
        </div>
      ))}
    </Card>
  );
}

function ActionsTab({ r }: { r: any }) {
  const actions = r.priority_actions ?? [];
  return (
    <Card title="Top Priority Actions" subtitle="The highest-impact changes to make first">
      {actions.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No priority actions identified — resume looks solid.</p>
      ) : actions.map((a: any, i: number) => (
        <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: i < actions.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--teal-100)", color: "var(--teal-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.problem}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--coral-700)", background: "var(--coral-50)", padding: "2px 8px", borderRadius: 20 }}>{a.priority}</span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--gray-500)" }}>{a.evidence}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--gray-700)" }}>{a.what_to_do}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

function scoreToGrade(s: number) {
  if (s >= 90) return "A+"; if (s >= 85) return "A"; if (s >= 80) return "A-";
  if (s >= 75) return "B+"; if (s >= 70) return "B"; if (s >= 65) return "B-";
  if (s >= 60) return "C+"; if (s >= 55) return "C"; return "D";
}

function ProcessingScreen({ step }: { step: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", padding: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Loader2 size={28} color="var(--teal-700)" style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Building your career intelligence report</h2>
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
