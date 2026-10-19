"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  DollarSign,
  Briefcase,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building,
  MapPin,
  Clock,
  Compass,
  FileText,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Chip } from "@/components/ui/Chip";
import { BarRow } from "@/components/ui/BarRow";

interface RoleCardData {
  id: string;
  title: string;
  department: string;
  timeline: string;
  fitScore: number;
  difficulty: "Direct" | "Moderate" | "Stretch";
  salaryRange: string;
  estimatedBump: string;
  rationale: string;
  skillGaps: { name: string; severity: "critical" | "recommended" }[];
  existingStrengths: string[];
  actionMilestones: string[];
}

const SAMPLE_ROLES: RoleCardData[] = [
  {
    id: "role-1",
    title: "Staff Full-Stack Engineer / Tech Lead",
    department: "Platform & Product Engineering",
    timeline: "6 – 12 months",
    fitScore: 88,
    difficulty: "Direct",
    salaryRange: "$185,000 – $225,000",
    estimatedBump: "+$35,000 – $55,000",
    rationale:
      "Your high proficiency in React 19, TypeScript, Next.js, and PostgreSQL gives you an immediate technical foundation. The primary gap is multi-region scale architecture and cross-team RFC authoring.",
    skillGaps: [
      { name: "Distributed Systems & Kafka", severity: "critical" },
      { name: "RFC & Architecture Review Ownership", severity: "critical" },
      { name: "OpenTelemetry & Tracing at Scale", severity: "recommended" },
      { name: "Cross-team Technical Mentorship", severity: "recommended" },
    ],
    existingStrengths: [
      "Modern TypeScript / React Architecture",
      "Next.js App Router & Server Components",
      "PostgreSQL Schema & Query Optimization",
      "CI/CD Pipelines (GitHub Actions)",
      "RESTful & GraphQL API Contract Design",
    ],
    actionMilestones: [
      "Author 2 cross-team RFCs addressing service latency and data streaming in Q2.",
      "Lead a distributed systems brown-bag or implement Kafka event pub/sub in production.",
      "Mentor 2 junior or mid-level engineers through technical design document reviews.",
    ],
  },
  {
    id: "role-2",
    title: "Engineering Manager (Product Engineering)",
    department: "People & Product Delivery",
    timeline: "12 – 18 months",
    fitScore: 74,
    difficulty: "Moderate",
    salaryRange: "$195,000 – $240,000",
    estimatedBump: "+$45,000 – $70,000",
    rationale:
      "You have demonstrated project leadership, agile sprint ceremonies, and peer code reviews. Transitioning to people management requires formal 1-on-1 coaching, hiring pipeline design, and OKR roadmapping.",
    skillGaps: [
      { name: "People Management & 1:1 Coaching", severity: "critical" },
      { name: "Engineering OKRs & Capacity Planning", severity: "critical" },
      { name: "Technical Hiring & Bar-Raiser Interviewing", severity: "recommended" },
      { name: "Performance Review & PIP Handling", severity: "recommended" },
    ],
    existingStrengths: [
      "Sprint Planning & Agile Scrum Ownership",
      "Clear Cross-Functional Communication",
      "Technical Debt vs Product Tradeoff Analysis",
      "High Empathy & Collaborative Mindset",
    ],
    actionMilestones: [
      "Act as interim Scrum Master / Delivery Lead for the upcoming quarterly cycle.",
      "Shadow hiring loops and lead 5+ behavioral and technical interview panels.",
      "Complete a leadership training program on constructive feedback and career mapping.",
    ],
  },
  {
    id: "role-3",
    title: "Solutions Architect / Founding Engineer",
    department: "Enterprise & Strategic Growth",
    timeline: "2 – 3 years",
    fitScore: 66,
    difficulty: "Stretch",
    salaryRange: "$210,000 – $265,000 + 0.5–1.5% Equity",
    estimatedBump: "+$60,000 – $95,000",
    rationale:
      "This high-leverage strategic role requires broad multi-cloud depth (AWS/GCP), SOC-2 compliance knowledge, FinOps cloud cost optimization, and customer-facing architectural consultations.",
    skillGaps: [
      { name: "SOC-2 Type II & Security Auditing", severity: "critical" },
      { name: "Cloud FinOps & Infrastructure Cost Modeling", severity: "critical" },
      { name: "Enterprise Proof-of-Concept (POC) Design", severity: "recommended" },
      { name: "Executive Stakeholder Pitching", severity: "recommended" },
    ],
    existingStrengths: [
      "Full-Stack End-to-End Delivery Velocity",
      "Production Cloud Deployment (Docker / AWS ECS)",
      "API Security & JWT/OAuth Hardening",
      "Rapid Prototyping & Product Sense",
    ],
    actionMilestones: [
      "Obtain AWS Solutions Architect Professional or Google Cloud Architect certification.",
      "Lead a cost-optimization initiative reducing AWS staging/prod spend by 15%+.",
      "Participate directly in sales engineering calls with 3 enterprise clients.",
    ],
  },
];

export default function CareerPathPage() {
  const [activeResume, setActiveResume] = useState<string>("sample-alex-morgan");
  const [expandedRole, setExpandedRole] = useState<string | null>("role-1");
  const [selectedGeo, setSelectedGeo] = useState<"sf-ny" | "remote-us" | "lon-eu" | "in-apac">("sf-ny");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Salary multipliers by geo
  const geoMultipliers = {
    "sf-ny": { label: "San Francisco / New York (1.0x)", base: 1.0, cost: "Very High" },
    "remote-us": { label: "US Remote Tier 2/3 (0.88x)", base: 0.88, cost: "Moderate" },
    "lon-eu": { label: "London / Western Europe (0.75x)", base: 0.75, cost: "Moderate" },
    "in-apac": { label: "India / APAC Tier 1 (0.42x)", base: 0.42, cost: "Emerging" },
  };

  const currentMultiplier = geoMultipliers[selectedGeo].base;

  const formatSalary = (val: number) => {
    const adjusted = Math.round((val * currentMultiplier) / 1000) * 1000;
    if (selectedGeo === "in-apac") {
      const inLakhs = (adjusted * 83) / 100000;
      return `₹${inLakhs.toFixed(1)}L`;
    }
    if (selectedGeo === "lon-eu") {
      const inPounds = Math.round(adjusted * 0.78 / 1000) * 1000;
      return `£${(inPounds / 1000).toFixed(0)}k`;
    }
    return `$${(adjusted / 1000).toFixed(0)}k`;
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) return;
    setWaitlistSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb & Hero */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            Career Intelligence & Trajectory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight mb-4 text-text">
            Predict your next 3 career moves before recruiters do
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            SkillSync analyzes your resume against 500,000+ career trajectories. Discover your next realistic promotions, exact skill gaps to close, and realistic compensation jumps.
          </p>

          {/* Profile Switcher */}
          <div className="mt-6 inline-flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border shadow-sm text-xs font-medium">
            <span className="text-text-muted px-2">Active Resume:</span>
            <button
              onClick={() => setActiveResume("sample-alex-morgan")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeResume === "sample-alex-morgan"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text hover:bg-surface-hover"
              }`}
            >
              Alex Morgan (Senior Full-Stack)
            </button>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Upload className="w-3 h-3" />
              Upload Yours
            </Link>
          </div>
        </div>

        {/* Current Standing Summary Bar */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:border-r border-border md:pr-6">
              <span className="text-xs uppercase font-bold text-text-muted tracking-wider block mb-1">
                Current Level Assessed
              </span>
              <div className="text-xl font-extrabold font-heading text-text">Senior Full-Stack</div>
              <div className="text-xs text-text-muted mt-1">6.5 years verified engineering experience</div>
            </div>

            <div className="md:border-r border-border md:pr-6">
              <span className="text-xs uppercase font-bold text-text-muted tracking-wider block mb-1">
                Primary Strength Index
              </span>
              <div className="text-xl font-extrabold font-heading text-success flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> 92nd Percentile
              </div>
              <div className="text-xs text-text-muted mt-1">Web Architecture & TypeScript</div>
            </div>

            <div className="md:border-r border-border md:pr-6">
              <span className="text-xs uppercase font-bold text-text-muted tracking-wider block mb-1">
                Market Readiness
              </span>
              <div className="text-xl font-extrabold font-heading text-primary">High Mobility</div>
              <div className="text-xs text-text-muted mt-1">Ready for promotion in 6–12 months</div>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-text-muted tracking-wider block mb-1">
                Estimated Growth Ceiling
              </span>
              <div className="text-xl font-extrabold font-heading text-text">+$75,000/yr</div>
              <div className="text-xs text-text-muted mt-1">With 2 targeted architectural skills</div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading text-text flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Your Next 3 Realistic Roles
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Ranked by transition probability, skill overlap, and market hiring velocity.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted self-start sm:self-auto">
            Updated with Q3 2026 Hiring Trends
          </span>
        </div>

        {/* 3 Role Cards */}
        <div className="space-y-6 mb-16">
          {SAMPLE_ROLES.map((role, idx) => {
            const isExpanded = expandedRole === role.id;
            const difficultyBadge =
              role.difficulty === "Direct"
                ? "bg-success/10 text-success border-success/25"
                : role.difficulty === "Moderate"
                ? "bg-warning/10 text-warning border-warning/25"
                : "bg-primary/10 text-primary border-primary/25";

            return (
              <div
                key={role.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-surface ${
                  isExpanded ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border hover:border-border/80"
                }`}
              >
                {/* Role Card Header */}
                <div
                  onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  className="p-6 sm:p-7 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-heading font-extrabold text-lg shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          {role.department}
                        </span>
                        <span className="text-text-muted/40">•</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${difficultyBadge}`}>
                          {role.difficulty} Transition
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface border border-border text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {role.timeline}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-heading text-text">
                        {role.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
                        <span className="flex items-center gap-1 font-semibold text-text">
                          <DollarSign className="w-3.5 h-3.5 text-success" />
                          Est. Range: <span className="text-success font-bold">{role.salaryRange}</span>
                        </span>
                        <span>Potential Bump: <span className="font-bold text-primary">{role.estimatedBump}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Fit Bar Column */}
                  <div className="lg:w-80 shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-text-muted">Role Fit Match</span>
                      <span
                        className={
                          role.fitScore >= 75
                            ? "text-success"
                            : role.fitScore >= 60
                            ? "text-warning"
                            : "text-danger"
                        }
                      >
                        {role.fitScore}% Match
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          role.fitScore >= 75
                            ? "bg-success"
                            : role.fitScore >= 60
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${role.fitScore}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-1.5">
                      <span>{role.skillGaps.length} gaps identified</span>
                      <span className="text-primary font-medium flex items-center gap-0.5">
                        {isExpanded ? "Collapse details" : "View roadmap"}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 border-t border-border pt-6 animate-fade-in">
                    <p className="text-sm text-text-muted leading-relaxed mb-6">
                      <strong className="text-text font-semibold">AI Assessment: </strong>
                      {role.rationale}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Skill Gaps to Fill */}
                      <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-danger" />
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-danger">
                            Skill Gaps To Close
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.skillGaps.map((gap, gIdx) => (
                            <Chip
                              key={gIdx}
                              label={gap.name}
                              variant={gap.severity === "critical" ? "danger" : "warning"}
                              size="sm"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-text-muted mt-3">
                          Closing critical gaps raises fit score by an estimated +12 points in ATS filtering.
                        </p>
                      </div>

                      {/* Existing Strengths */}
                      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-success">
                            Verified Strengths in Resume
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.existingStrengths.map((str, sIdx) => (
                            <Chip
                              key={sIdx}
                              label={str}
                              variant="success"
                              size="sm"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-text-muted mt-3">
                          These verified resume bullets directly fulfill core qualifications for this role.
                        </p>
                      </div>
                    </div>

                    {/* Step-by-Step Action Milestones */}
                    <div className="p-5 rounded-xl bg-surface border border-border">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-primary mb-3 flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> Recommended 90-Day Execution Milestones
                      </h4>
                      <ol className="space-y-2.5 text-xs sm:text-sm text-text-muted">
                        {role.actionMilestones.map((ms, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {mIdx + 1}
                            </span>
                            <span className="text-text leading-snug">{ms}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Salary Range Card marked "V2 preview" */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-surface via-surface to-primary/5 p-6 sm:p-8 relative overflow-hidden shadow-lg mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                V2 Preview — Live Salary Calibration
              </div>
              <h2 className="text-2xl font-bold font-heading text-text">
                Salary Benchmark & Percentile Distribution
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Calibrated against real H-1B filings, verified W-2 surveys, and verified offer letters across 1,200+ tech employers.
              </p>
            </div>

            {/* Geo Selector */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-surface border border-border rounded-xl p-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-text-muted ml-2" />
              <select
                value={selectedGeo}
                onChange={(e) => setSelectedGeo(e.target.value as any)}
                className="bg-transparent border-none text-text font-semibold focus:outline-none pr-3 py-1 cursor-pointer"
              >
                <option value="sf-ny" className="bg-surface text-text">San Francisco / NYC (1.0x)</option>
                <option value="remote-us" className="bg-surface text-text">US Remote (0.88x)</option>
                <option value="lon-eu" className="bg-surface text-text">London / Europe (0.75x)</option>
                <option value="in-apac" className="bg-surface text-text">India / APAC (0.42x)</option>
              </select>
            </div>
          </div>

          {/* Percentile Table / Comparison */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                25th Percentile
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-heading text-text">
                {formatSalary(165000)}
              </div>
              <span className="text-[11px] text-text-muted">Early-stage startups</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-primary/30 shadow-sm ring-1 ring-primary/20">
              <span className="text-[11px] uppercase font-bold text-primary tracking-wider block mb-1">
                50th Median
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-heading text-primary">
                {formatSalary(198000)}
              </div>
              <span className="text-[11px] text-text-muted">Mid-market tech companies</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                75th Percentile
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-heading text-text">
                {formatSalary(235000)}
              </div>
              <span className="text-[11px] text-text-muted">Tier-1 high growth & unicorns</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                90th Top Tier
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-heading text-success">
                {formatSalary(285000)}
              </div>
              <span className="text-[11px] text-text-muted">FAANG & Pre-IPO Giants</span>
            </div>
          </div>

          {/* Compensation Breakdown Bars */}
          <div className="p-5 rounded-xl bg-surface border border-border mb-6">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-text-muted mb-4">
              Estimated Target Compensation Mix (Staff Full-Stack)
            </h3>
            <div className="space-y-4">
              <BarRow
                label="Base Salary (Guaranteed Cash)"
                value={72}
                comparisonValue={70}
                comparisonLabel="Target Benchmark"
                subtext={`Est. Base: ${formatSalary(185000)}/yr`}
              />
              <BarRow
                label="Equity Grants (RSU / Stock Options)"
                value={65}
                comparisonValue={60}
                comparisonLabel="Target Benchmark"
                subtext={`Est. Equity: ${formatSalary(60000)}/yr`}
              />
              <BarRow
                label="Annual Performance Bonus"
                value={45}
                comparisonValue={40}
                comparisonLabel="Target Benchmark"
                subtext={`Est. Bonus: ${formatSalary(25000)}/yr`}
              />
            </div>
          </div>

          {/* Waitlist Callout for V2 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div>
              <div className="text-xs font-bold text-primary uppercase tracking-wide">
                Join the V2 Live Compensation Sync Beta
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Get real-time offer negotiation coaching and live H-1B company salary intelligence.
              </p>
            </div>

            {waitlistSubmitted ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/15 px-3 py-2 rounded-lg border border-success/30">
                <CheckCircle2 className="w-4 h-4" /> You're on the priority V2 waitlist!
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  required
                  placeholder="name@work-email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-56"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shrink-0"
                >
                  Join V2 Beta
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text mb-3">
            Want to test how your actual resume scores?
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-6">
            Upload your resume to run the 30+ ATS criteria audit, benchmark against top candidates, and get AI bullet rewrites.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all hover:shadow-lg inline-flex items-center gap-2"
            >
              Run Free ATS Audit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/interview-prep"
              className="px-6 py-3 rounded-full bg-surface hover:bg-surface-hover border border-border text-text font-bold text-sm transition-colors"
            >
              Explore Interview Predictor
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
