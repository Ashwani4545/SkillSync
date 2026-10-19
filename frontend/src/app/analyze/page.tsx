"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Zap,
  HelpCircle,
  BarChart3,
  Sliders,
  Layers,
  Award,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BarRow } from "@/components/ui/BarRow";
import { Chip } from "@/components/ui/Chip";
import { UploadCard } from "@/components/analysis/UploadCard";
import { ScanProgress } from "@/components/analysis/ScanProgress";
import { ReviewerLensSimulator } from "@/components/analysis/ReviewerLensSimulator";
import { apiClient } from "@/lib/api";

type FlowStep = "upload" | "scanning" | "results";

// ─── SAMPLE AUDIT RESULTS DATA ───────────────────────────────────────────────
const SAMPLE_RESULTS = {
  atsScore: 84,
  candidateRole: "Senior Full Stack Engineer",
  seniority: "Senior (5+ Years)",
  summary:
    "Your resume parses cleanly across major ATS systems (Workday, Greenhouse, Lever). Strong keyword density in frontend engineering, but recruiter skimmers flag 2 unquantified bullets in your current role.",
  sectionGrades: [
    { name: "Contact & Links", score: 95, status: "Pass", note: "Standard email, LinkedIn, location detected" },
    { name: "Executive Summary", score: 72, status: "Warning", note: "Missing explicit target title in line 1" },
    { name: "Work Experience", score: 86, status: "Pass", note: "Active verbs lead 88% of bullets" },
    { name: "Technical Skills", score: 78, status: "Pass", note: "5 core skills verified with project evidence" },
    { name: "Education & Certs", score: 90, status: "Pass", note: "Proper degree hierarchy and graduation date" },
  ],
  formatAudits: [
    { label: "Single-column layout", variant: "success" as const },
    { label: "Standard fonts (Inter/Arial)", variant: "success" as const },
    { label: "Standard section headers", variant: "success" as const },
    { label: "Parseable date formats (MM/YYYY)", variant: "success" as const },
    { label: "Zero unparseable tables/graphics", variant: "success" as const },
    { label: "Missing GitHub profile link", variant: "warning" as const },
    { label: "2 unquantified impact claims", variant: "warning" as const },
    { label: "Overused passive verb 'assisted'", variant: "danger" as const },
  ],
  toneMetrics: {
    activeVoicePct: 86,
    passiveHedgingCount: 2,
    hedgingPhrases: [
      { found: "helped to maintain", suggestion: "engineered and maintained" },
      { found: "responsible for testing", suggestion: "automated comprehensive unit tests" },
    ],
  },
  bulletRewrites: [
    {
      role: "Lead Full Stack Engineer",
      company: "CloudTech Systems",
      before: "Worked on frontend features for the client dashboard and helped improve page load times.",
      after: "Architected component library in Next.js and strict TypeScript, reducing initial page load by 42% across 18,000 monthly active users.",
      metricGained: "+42% speed / 18k users",
      reason: "Replaces vague verb 'worked on' with active verb 'Architected', introduces exact stack, and benchmarks quantifiable impact.",
    },
    {
      role: "Senior Software Developer",
      company: "NexaSoft Labs",
      before: "Handled database queries and backend microservices using Node.js.",
      after: "Engineered 14 event-driven microservices using Node.js and PostgreSQL, sustaining 3,200 RPS during peak production traffic.",
      metricGained: "14 services / 3.2k RPS",
      reason: "Converts passive maintenance task into measurable throughput scale and architectural complexity.",
    },
  ],
  skillAuthenticity: [
    { skill: "React.js", status: "EVIDENCED", occurrences: 6, proof: "Evidenced in 3 production bullet items" },
    { skill: "TypeScript", status: "EVIDENCED", occurrences: 5, proof: "Evidenced in codebase migration bullet" },
    { skill: "Node.js", status: "EVIDENCED", occurrences: 4, proof: "Evidenced in microservice architecture bullet" },
    { skill: "Docker", status: "PARTIALLY_EVIDENCED", occurrences: 2, proof: "Mentioned briefly, needs quantified deployment context" },
    { skill: "Kubernetes", status: "UNSUPPORTED", occurrences: 0, proof: "Listed in skills section but zero experience bullets back this claim" },
  ],
  benchmarks: [
    { label: "Overall ATS Readiness", you: 84, top10: 92, unit: "%" },
    { label: "Action Verb Strength", you: 82, top10: 94, unit: "%" },
    { label: "Role Keyword Alignment", you: 78, top10: 90, unit: "%" },
    { label: "Quantified Metric Ratio", you: 68, top10: 88, unit: "%" },
    { label: "Seniority & Scope Signal", you: 85, top10: 89, unit: "%" },
  ],
};

// ─── FAQ ACCORDION DATA ──────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How does SkillSync's ATS checker differ from standard keyword counters?",
    a: "Standard resume scanners only search for literal keyword matching against a job description. SkillSync uses a multi-persona intelligence engine that evaluates keyword density, ATS schema readability, HR recruiter 6-second skim triggers (like unexplained employment gaps), and hiring manager competence evidence.",
  },
  {
    q: "What file formats parse best across Workday, Greenhouse, and Lever?",
    a: "Clean, single-column PDF or DOCX files are the gold standard. SkillSync verifies that your file uses standard UTF-8 text encoding, standard headers (Experience, Education, Skills), and contains no embedded graphic text, two-column sidebars, or floating tables that ATS bots drop.",
  },
  {
    q: "What does 'Skill Authenticity with Evidence' mean?",
    a: "ATS bots and hiring managers penalize candidates who list 30 skills in a bottom cloud without providing evidence of how they used those skills in their work experience. SkillSync builds an evidence graph that cross-references your skills list against your actual bullet points.",
  },
  {
    q: "Is my resume data kept confidential?",
    a: "Yes. SkillSync enforces 256-bit TLS encryption in transit and never sells or shares your uploaded resumes with third-party recruiters without your explicit permission.",
  },
  {
    q: "Can I tailor my resume to a specific job description?",
    a: "Yes! Use our JD Adapter tool (/jd-adapter). Simply paste any job posting, and SkillSync will compare your resume against that specific role, calculate a match score, and generate tailored bullet points in seconds.",
  },
];

export default function AnalyzePage() {
  const [step, setStep] = useState<FlowStep>("upload");
  const [results, setResults] = useState(SAMPLE_RESULTS);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleStartScan = () => {
    setStep("scanning");
  };

  const handleScanComplete = () => {
    setStep("results");
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      {/* ── 1. TWO-COLUMN HERO WITH 3-STEP INDICATOR ──────────────────────── */}
      <section className="pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & 3-Step Indicator */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs">
                <ShieldCheck size={13} className="text-teal-600 dark:text-teal-400" />
                Industry Standard ATS Audit
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.12]"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                Check your resume against{" "}
                <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                  30+ ATS criteria
                </span>
              </h1>

              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Upload your resume or paste text to uncover keyword gaps, unparseable layouts, passive tone, and missing competence proof before applying.
              </p>

              {/* 3-Step Process Indicator */}
              <div className="pt-2">
                <nav aria-label="ATS Checker Steps">
                  <ol className="flex items-center gap-3 sm:gap-4 text-xs font-bold">
                    {/* Step 1 */}
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                          step === "upload"
                            ? "bg-teal-600 text-white ring-4 ring-teal-500/20"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {step === "upload" ? "1" : <Check size={13} />}
                      </span>
                      <span
                        className={
                          step === "upload"
                            ? "text-teal-700 dark:text-teal-400 font-extrabold"
                            : "text-gray-600 dark:text-gray-300"
                        }
                      >
                        Upload resume
                      </span>
                    </li>

                    <li className="w-8 sm:w-12 h-0.5 bg-gray-200 dark:bg-white/10" aria-hidden="true" />

                    {/* Step 2 */}
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                          step === "scanning"
                            ? "bg-teal-600 text-white ring-4 ring-teal-500/20 animate-pulse"
                            : step === "results"
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-white/10 text-gray-500"
                        }`}
                      >
                        {step === "results" ? <Check size={13} /> : "2"}
                      </span>
                      <span
                        className={
                          step === "scanning"
                            ? "text-teal-700 dark:text-teal-400 font-extrabold"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        ATS scan
                      </span>
                    </li>

                    <li className="w-8 sm:w-12 h-0.5 bg-gray-200 dark:bg-white/10" aria-hidden="true" />

                    {/* Step 3 */}
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                          step === "results"
                            ? "bg-teal-600 text-white ring-4 ring-teal-500/20"
                            : "bg-gray-200 dark:bg-white/10 text-gray-500"
                        }`}
                      >
                        3
                      </span>
                      <span
                        className={
                          step === "results"
                            ? "text-teal-700 dark:text-teal-400 font-extrabold"
                            : "text-gray-400 dark:text-gray-500"
                        }
                      >
                        View results
                      </span>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>

            {/* Right Column: Upload Card or Scanning or Summary */}
            <div className="lg:col-span-6">
              {step === "upload" && (
                <UploadCard
                  onUploadFile={(file) => {
                    handleStartScan();
                  }}
                  onPasteText={(text) => {
                    handleStartScan();
                  }}
                  onUseSample={() => {
                    handleStartScan();
                  }}
                />
              )}

              {step === "scanning" && (
                <ScanProgress onComplete={handleScanComplete} />
              )}

              {step === "results" && (
                <div className="rounded-2xl border border-teal-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        Scan Complete
                      </span>
                      <h2
                        className="text-xl font-extrabold text-gray-900 dark:text-white"
                        style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                      >
                        ATS Audit Overview
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("upload")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      <RotateCcw size={13} /> Re-scan new file
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <ScoreRing score={results.atsScore} size={96} strokeWidth={8} showGrade label="ATS Score" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {results.candidateRole}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {results.seniority} &bull; Good ATS compatibility
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                        &bull; Top 16% of applicants in this role band
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FULL AUDIT RESULTS DASHBOARD (Visible when step === 'results') ── */}
      {step === "results" && (
        <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Row 1: Section Grades & Format Audit Chips */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Section Grades (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-lg font-extrabold text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    Section-by-Section ATS Breakdown
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Scored on keyword density, verb strength, and standard section headers
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {results.sectionGrades.map((sec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <BarRow
                      label={sec.name}
                      value={sec.score}
                      subtext={sec.note}
                      colorThreshold
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Format Audit Chips (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3
                  className="text-lg font-extrabold text-gray-900 dark:text-white mb-1"
                  style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                >
                  ATS Formatting Audit
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Validates layout against Workday, Greenhouse, and Lever schema requirements
                </p>

                <div className="flex flex-wrap gap-2">
                  {results.formatAudits.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={item.label}
                      variant={item.variant}
                      icon={
                        item.variant === "success" ? (
                          <CheckCircle2 size={13} />
                        ) : item.variant === "warning" ? (
                          <AlertTriangle size={13} />
                        ) : (
                          <XCircle size={13} />
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Single-column linear layout parses cleanly in 100% of tested parsers.</span>
              </div>
            </div>
          </div>

          {/* Row 2: Tone & Hedging Phrases + Benchmark Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tone & Hedging Phrases (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-extrabold text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                >
                  Tone & Confidence Analyzer
                </h3>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                  {results.toneMetrics.activeVoicePct}% Active Voice
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Detects weak hedging phrases that diminish candidate seniority in recruiter screens.
              </p>

              <div className="space-y-3">
                {results.toneMetrics.hedgingPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                      <AlertTriangle size={14} /> Weak Hedging Phrase Detected
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Replaces <span className="line-through font-semibold text-red-600 dark:text-red-400">&ldquo;{phrase.found}&rdquo;</span> with{" "}
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">&ldquo;{phrase.suggestion}&rdquo;</span>.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Bars: You vs Top 10% (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3
                    className="text-lg font-extrabold text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    Role Benchmark (You vs Top 10%)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Calibrated against top candidates for {results.candidateRole}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {results.benchmarks.map((bm, idx) => (
                  <BarRow
                    key={idx}
                    label={bm.label}
                    value={bm.you}
                    comparisonValue={bm.top10}
                    comparisonLabel="Top 10%"
                    unit={bm.unit}
                    colorThreshold
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Multi-Persona Vision & 6-Second Eye-Tracking Heatmap */}
          <ReviewerLensSimulator
            candidateRole={results.candidateRole}
          />

          {/* Row 3: Skill Authenticity with Evidence */}
          <div id="skills" className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3
                  className="text-lg font-extrabold text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                >
                  Skill Authenticity & Evidence Graph
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Verifies if keywords listed in your skills section have supporting evidence in experience bullets.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Evidenced (3)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Partial (1)
                </span>
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Unsupported (1)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.skillAuthenticity.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    item.status === "EVIDENCED"
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                      : item.status === "PARTIALLY_EVIDENCED"
                      ? "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                      : "bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {item.skill}
                    </span>
                    <Chip
                      label={
                        item.status === "EVIDENCED"
                          ? "Evidenced"
                          : item.status === "PARTIALLY_EVIDENCED"
                          ? "Partial"
                          : "Unsupported"
                      }
                      variant={
                        item.status === "EVIDENCED"
                          ? "success"
                          : item.status === "PARTIALLY_EVIDENCED"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.proof}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Before / After Bullet Rewriter */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3
                className="text-lg font-extrabold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                Before / After AI Bullet Rewriter
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Converts passive claims into quantified business metrics that pass ATS and impress hiring managers.
              </p>
            </div>

            <div className="space-y-6">
              {results.bulletRewrites.map((rw, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                      {rw.role} &bull; {rw.company}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {rw.metricGained}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200/50 text-red-900 dark:text-red-200">
                      <span className="font-extrabold uppercase text-[10px] text-red-600 dark:text-red-400 block mb-1">
                        Original (Weak & Unquantified)
                      </span>
                      <p>{rw.before}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 text-emerald-900 dark:text-emerald-200 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold uppercase text-[10px] text-emerald-600 dark:text-emerald-400">
                          SkillSync AI Rewrite (Strong & Quantified)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBullet(rw.after, idx)}
                          aria-label="Copy rewritten bullet"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-white"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={12} className="text-emerald-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-medium">{rw.after}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                    Reason: {rw.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. "WHAT THE CHECKER LOOKS AT" (3 Categories x 3 Items) ──────── */}
      <section className="py-16 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Complete ATS Scope
            </span>
            <h2
              className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              What the Checker Looks At
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Every audit verifies your resume across 3 fundamental layers required for human and bot approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1: Content */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                1. Content & Keywords
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Role Keyword Alignment:</strong> Primary skill occurrences matched against industry standard job descriptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Quantified Business Outcomes:</strong> Detection of baseline numbers, percentage improvements, and throughput metrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Active Verb Strength:</strong> High ratio of high-impact lead verbs versus passive job responsibility phrasing.</span>
                </li>
              </ul>
            </div>

            {/* Category 2: Key Sections */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                2. Key Sections
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Contact Header Verification:</strong> Proper email, phone, location, and LinkedIn/GitHub URL formatting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Experience Chronology:</strong> Clear job titles, employer names, and parseable MM/YYYY date stamps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Education & Certifications:</strong> Degree recognition and accreditation verification.</span>
                </li>
              </ul>
            </div>

            {/* Category 3: Structure */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                3. Structure & Layout
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Single-Column Readability:</strong> Ensures parser parses text sequentially without scrambling sidebars.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>No Unparseable Tables/Graphics:</strong> Confirms zero vital information is hidden in images or shapes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Standard Typography & Margins:</strong> Validates line spacing, margins, and safe font encoding.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. "HOW IT WORKS" (4 Numbered Steps) ─────────────────────────── */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Step-by-Step Methodology
          </span>
          <h2
            className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            How SkillSync Works in 4 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: "01",
              title: "Upload Resume",
              desc: "Drop your PDF or DOCX file, or paste text. Our parser extracts all sections in under 2 seconds.",
            },
            {
              num: "02",
              title: "Run 30+ ATS Rules",
              desc: "We check format compliance, keyword density, and schema integrity against major ATS platforms.",
            },
            {
              num: "03",
              title: "Simulate 3 Readers",
              desc: "Inspect where the ATS bot, HR recruiter, and hiring manager stop reading and why.",
            },
            {
              num: "04",
              title: "1-Click AI Fixes",
              desc: "Copy quantified bullet rewrites and export an optimized resume that lands interviews.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 relative"
            >
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mb-3" style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}>
                {item.num}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. ACCESSIBLE ACCORDION FAQ ──────────────────────────────────── */}
      <section id="faq" className="py-16 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clear Answers
            </span>
            <h2
              className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-teal-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      className="px-5 pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
