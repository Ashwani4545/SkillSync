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
import { Navbar } from "../../../../components/layout/Navbar";

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
  EVIDENCED:            { color: "#2DD4BF", bg: "rgba(29, 158, 117, 0.2)",  Icon: ShieldCheck, label: "Evidenced" },
  PARTIALLY_EVIDENCED:  { color: "#FBBF24", bg: "rgba(245, 158, 11, 0.2)", Icon: ShieldAlert, label: "Partially evidenced" },
  UNSUPPORTED:          { color: "#F87171", bg: "rgba(248, 113, 113, 0.2)", Icon: ShieldX,     label: "Unsupported" },
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <Navbar />

      {/* Sub-bar */}
      <div style={{ background: "rgba(10, 15, 30, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, height: 56 }}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "#2DD4BF" }}>SkillSync</span>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>/</span>
          <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)" }}>Career Intelligence Report</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={15} color="#2DD4BF" />
            <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)" }}>
              Completed {new Date(analysis.completed_at!).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>
        {/* Score hero */}
        <div style={{ background: "linear-gradient(135deg, rgba(6, 64, 53, 0.85) 0%, rgba(15, 110, 86, 0.7) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(45, 212, 191, 0.25)", borderRadius: 20, color: "#fff", padding: "36px 32px", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            <ScoreRing score={overallScore} grade={scoreToGrade(overallScore)} size={120} />
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ fontSize: 28, margin: "0 0 8px", color: "#fff", fontFamily: "Syne, sans-serif" }}>
                {overallScore >= 80 ? "Strong Career Readiness" : overallScore >= 60 ? "Good Foundation — Room to Grow" : "Significant Gaps to Close"}
              </h1>
              <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.8)", fontSize: 14, maxWidth: 640, lineHeight: 1.6 }}>{cr.explanation || "Overall career readiness combines ATS readiness, skill evidence, and experience depth."}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { label: "ATS Readiness",       val: cr.resume_ats_readiness },
                  { label: "Job Match",           val: cr.job_match },
                  { label: "Skill Readiness",     val: cr.skill_readiness },
                  { label: "Experience Readiness",val: cr.experience_readiness },
                ].map((b) => (
                  <div key={b.label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 16px", minWidth: 100, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne, sans-serif" }}>{b.val ?? "—"}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {r.warnings?.length > 0 && (
        <div style={{ maxWidth: 1100, margin: "16px auto 0", padding: "0 24px" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#FBBF24", marginBottom: 4 }}>
                Analysis confidence reduced
              </div>
              {r.warnings.map((w: string, i: number) => (
                <div key={i} style={{ fontSize: 12.5, color: "rgba(255, 255, 255, 0.7)" }}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: "rgba(10, 15, 30, 0.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginTop: 24, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", overflowX: "auto", gap: 4 }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "14px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#2DD4BF" : "rgba(255, 255, 255, 0.55)",
                borderBottom: activeTab === tab.id ? "2px solid #2DD4BF" : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 0.2s" }}>
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
    <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255, 255, 255, 0.55)" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function OverviewTab({ r }: { r: any }) {
  const ats = r.ats_readiness ?? {};
  const jm = r.job_match ?? {};
  const profile = r.candidate_profile ?? {};
  const proof = r.proof_coverage ?? {};

  return (
    <div>
      {proof.total_skills > 0 && (
        <Card title="Resume Trust & Evidence Report" subtitle="How many of your claimed skills actually have supporting evidence, not just a keyword count">
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: proof.proof_coverage_pct >= 70 ? "var(--teal-700)" : proof.proof_coverage_pct >= 40 ? "var(--amber-700)" : "var(--coral-700)", fontFamily: "Syne" }}>
              {proof.proof_coverage_pct}%<span style={{ fontSize: 14, color: "var(--gray-400)", fontWeight: 500 }}> proof coverage</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <MiniStat label="Strongly evidenced" value={proof.strongly_evidenced} color="var(--teal-700)" />
              <MiniStat label="Weakly evidenced" value={proof.weakly_evidenced} color="var(--amber-700)" />
              <MiniStat label="Unsupported" value={proof.unsupported} color="var(--coral-700)" />
            </div>
          </div>
        </Card>
      )}

      <Card title="ATS Readiness" subtitle="How reliably a typical ATS can parse and understand this resume — not a claim about any specific ATS product">
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>{ats.ats_readiness_score ?? "—"}<span style={{ fontSize: 16, color: "var(--gray-400)" }}>/100</span></div>
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

      {(jm.job_match_score === null || jm.job_match_score === undefined) ? (
        <Card title="Job Match">
          <p style={{ margin: 0, fontSize: 14, color: "var(--gray-500)" }}>Add a job description to calculate role match.</p>
        </Card>
      ) : (
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
          <ProfileStat label="Skills listed" value={r.evidence_graph?.length ?? 0} />
          <ProfileStat label="Certifications" value={profile.certifications?.length ?? 0} />
        </div>
        {profile.career_level_basis && (
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--gray-400)" }}>{profile.career_level_basis}</p>
        )}
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
    <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne", color: "#ffffff" }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.55)" }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "Syne" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{label}</div>
    </div>
  );
}

function EvidenceTab({ r }: { r: any }) {
  const graph = r.evidence_graph ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card title="Skill Evidence Graph" subtitle="Every skill checked against real supporting text in your experience and projects — not just whether it's listed. Click a skill to see the exact evidence.">
      {graph.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No skills found to evaluate.</p>
      ) : (
        <div>
          {graph.map((e: any, i: number) => {
            const meta = EVIDENCE_META[e.status] ?? EVIDENCE_META.UNSUPPORTED;
            const Icon = meta.Icon;
            const isOpen = expanded === e.canonical_name;
            const source = e.evidence?.[0];
            return (
              <div key={i} style={{ borderBottom: i < graph.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : e.canonical_name)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{e.canonical_name}</span>
                    {e.category && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--gray-400)" }}>{e.category}</span>}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
                    <Icon size={13} /> {meta.label}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 0 14px", fontSize: 13 }}>
                    {source ? (
                      <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>
                          Found in: {source.source_name} ({source.source_type.replace("_", " ")})
                        </div>
                        <div style={{ color: "var(--gray-700)", fontStyle: "italic" }}>"{source.text}"</div>
                      </div>
                    ) : (
                      <div style={{ background: "var(--coral-50)", borderRadius: 8, padding: "10px 14px", color: "var(--coral-700)" }}>
                        No supporting project or experience evidence detected. Add genuine project evidence if applicable.
                      </div>
                    )}
                    <div style={{ marginTop: 6, fontSize: 12, color: "var(--gray-400)" }}>Confidence: {Math.round(e.confidence * 100)}%</div>
                  </div>
                )}
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 40%, rgba(29, 158, 117, 0.15) 0%, transparent 60%), #0A0F1E", color: "#ffffff", padding: 24, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 0 30px rgba(29, 158, 117, 0.3)" }}>
        <Loader2 size={32} color="#2DD4BF" style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Building your career intelligence report</h2>
      <p style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: 16, marginBottom: 8, maxWidth: 480 }}>{step}</p>
      <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 13 }}>This takes about 20 seconds</p>
    </div>
  );
}

function FailedScreen({ error }: { error: string | null }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 40%, rgba(248, 113, 113, 0.15) 0%, transparent 60%), #0A0F1E", color: "#ffffff", padding: 24, textAlign: "center" }}>
      <AlertCircle size={52} color="#F87171" style={{ marginBottom: 20 }} />
      <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Analysis failed</h2>
      <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: 24, maxWidth: 440 }}>{error || "Something went wrong. Please try again."}</p>
      <a href="/analyze/upload" style={{ padding: "12px 28px", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 700, boxShadow: "0 0 20px rgba(29, 158, 117, 0.3)" }}>Try again</a>
    </div>
  );
}
