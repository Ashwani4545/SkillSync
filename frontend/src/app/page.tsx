"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Bot,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Wand2,
  GitCompare,
  MessageSquare,
  TrendingUp,
  BarChart2,
  Calendar,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ResumeScene3D, ReviewerId } from "@/components/hero/ResumeScene3D";

// ─── READER DATA FOR HERO & PICK A READER PANEL ──────────────────────────────
interface ReaderDetail {
  id: ReviewerId;
  label: string;
  badge: string;
  score: number;
  tagline: string;
  headline: string;
  body: string;
  stopAt: string;
  fixTitle: string;
  fixDescription: string;
  fixCodeBefore: string;
  fixCodeAfter: string;
  accentColor: string;
}

const READERS: Record<ReviewerId, ReaderDetail> = {
  ats: {
    id: "ats",
    label: "ATS Bot",
    badge: "LAYER 1 AUDIT",
    score: 61,
    tagline: "Keyword Density & Schema Parser",
    headline: "Your resume never reaches a human reviewer.",
    body: "The ATS parser stopped scanning at keyword density. It detected 3 missing required role qualifications, an unparseable two-column table layout, and an ambiguous job-title match.",
    stopAt: "Line 4 — Skills & Certifications section",
    fixTitle: "Fix Layout & Match Core Keywords",
    fixDescription: "Convert to clean single-column format and inject required primary keywords with verifiable project bullets.",
    fixCodeBefore: "• Skills: React, Node, Web tech, fast learner",
    fixCodeAfter: "• Built microservices using TypeScript, Node.js, and React, reducing latency by 34%.",
    accentColor: "#1D9E75",
  },
  recruiter: {
    id: "recruiter",
    label: "HR Recruiter",
    badge: "LAYER 2 AUDIT",
    score: 54,
    tagline: "6-Second Human Screen",
    headline: "She skimmed for 6 seconds and moved on.",
    body: "A 7-month unexplained employment gap in 2022. No seniority signal in the job title. Three passive bullets that describe company features instead of what you actually built.",
    stopAt: "Line 11 — First experience bullet",
    fixTitle: "Reframe Employment Gap & Lead with Metrics",
    fixDescription: "Add professional development context to the gap and restructure your first bullet with an active verb + metric.",
    fixCodeBefore: "• Responsible for maintaining dashboard features and attending daily team standups.",
    fixCodeAfter: "• Spearheaded redesign of core analytics dashboard used by 12,000+ daily active enterprise users.",
    accentColor: "#38BDF8",
  },
  hiring_manager: {
    id: "hiring_manager",
    label: "Hiring Manager",
    badge: "LAYER 3 AUDIT",
    score: 48,
    tagline: "Deep Technical Competence Check",
    headline: "He wanted technical evidence. You gave him generic claims.",
    body: "'Led a cross-functional team' — how large? 'Improved system performance' — by how much? Every bullet is a claim without a baseline number. He is skeptical you can perform at the level required.",
    stopAt: "Line 18 — Project architecture description",
    fixTitle: "Back Claims with Hard Evidence Graph",
    fixDescription: "Map every high-level skill claim to an explicit architectural tradeoff, team size, and quantified business outcome.",
    fixCodeBefore: "• Optimized database performance for heavy traffic operations.",
    fixCodeAfter: "• Re-indexed PostgreSQL database and implemented Redis caching, reducing query time from 420ms to 45ms.",
    accentColor: "#A855F7",
  },
};

// ─── 9 FEATURE CARDS DATA ───────────────────────────────────────────────────
const NINE_FEATURES = [
  {
    title: "Persona Analysis",
    description: "Simulate ATS bot keyword filters, recruiter 6-second skim scans, and hiring manager depth audits simultaneously.",
    icon: <Users size={22} className="text-teal-600 dark:text-teal-400" />,
    badge: "Core AI",
    href: "/analyze",
  },
  {
    title: "Tone & Confidence Analyzer",
    description: "Detect passive hedging phrases ('helped with', 'responsible for') and replace them with confident action verbs.",
    icon: <Sparkles size={22} className="text-sky-600 dark:text-sky-400" />,
    badge: "Tone",
    href: "/analyze#tone",
  },
  {
    title: "Interview Question Predictor",
    description: "Map vague resume claims to the exact probing technical and behavioral questions hiring managers will ask.",
    icon: <MessageSquare size={22} className="text-violet-600 dark:text-violet-400" />,
    badge: "Interview",
    href: "/interview-prep",
  },
  {
    title: "JD Adapter",
    description: "Paste any target job description and tailor your bullets, keywords, and summary to match in one click.",
    icon: <Wand2 size={22} className="text-emerald-600 dark:text-emerald-400" />,
    badge: "Match",
    href: "/jd-adapter",
  },
  {
    title: "Resume A/B Tester",
    description: "Compare two versions of your resume head-to-head. AI declares the winning version with clear comparative criteria.",
    icon: <GitCompare size={22} className="text-amber-600 dark:text-amber-400" />,
    badge: "Compare",
    href: "/compare",
  },
  {
    title: "Skill Authenticity Checker",
    description: "Verify which listed skills are backed by verifiable evidence in your bullets versus unevidenced keywords.",
    icon: <ShieldCheck size={22} className="text-teal-600 dark:text-teal-400" />,
    badge: "Evidence",
    href: "/analyze#skills",
  },
  {
    title: "Industry Benchmark",
    description: "Benchmark your skills, bullet strength, and ATS readability against the top 10% of candidates in your field.",
    icon: <BarChart2 size={22} className="text-blue-600 dark:text-blue-400" />,
    badge: "Benchmark",
    href: "/benchmark",
  },
  {
    title: "Career Gap Advisor",
    description: "Strategically address employment breaks, parental leaves, or sabbatical gaps without triggering red flags.",
    icon: <Calendar size={22} className="text-rose-600 dark:text-rose-400" />,
    badge: "Strategy",
    href: "/gap-advisor",
  },
  {
    title: "Career Trajectory Predictor",
    description: "Forecast your realistic next 2-3 roles, promotion timelines, and specific skills required to reach target bands.",
    icon: <TrendingUp size={22} className="text-purple-600 dark:text-purple-400" />,
    badge: "Path",
    href: "/career-path",
  },
];

// ─── COMPETITOR COMPARISON TABLE DATA ───────────────────────────────────────
const COMPARISON_ROWS = [
  {
    feature: "ATS Keyword & Schema Parsing",
    skillsync: true,
    jobscan: true,
    resumeWorded: true,
    rezi: true,
    enhancv: "Basic",
    teal: true,
  },
  {
    feature: "3-Reviewer Persona Simulation (ATS + HR + HM)",
    skillsync: true,
    jobscan: false,
    resumeWorded: false,
    rezi: false,
    enhancv: false,
    teal: false,
  },
  {
    feature: "Drop-Off Detection ('Stops Reading Here')",
    skillsync: true,
    jobscan: false,
    resumeWorded: false,
    rezi: false,
    enhancv: false,
    teal: false,
  },
  {
    feature: "Skill Authenticity & Evidence Graph",
    skillsync: true,
    jobscan: false,
    resumeWorded: false,
    rezi: false,
    enhancv: false,
    teal: false,
  },
  {
    feature: "Interview Question Predictor from Bullets",
    skillsync: true,
    jobscan: false,
    resumeWorded: false,
    rezi: false,
    enhancv: false,
    teal: false,
  },
  {
    feature: "1-Click Job Description Adaptation",
    skillsync: true,
    jobscan: "Manual",
    resumeWorded: false,
    rezi: "Limited",
    enhancv: false,
    teal: "Tracker only",
  },
  {
    feature: "Top 10% Candidate Benchmarking",
    skillsync: true,
    jobscan: false,
    resumeWorded: "Generic",
    rezi: false,
    enhancv: false,
    teal: false,
  },
];

// ─── 4-PHASE ROADMAP DATA ───────────────────────────────────────────────────
const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    title: "MVP Core Engine",
    timeline: "Weeks 1–8",
    completed: true,
    items: [
      { text: "Resume upload & text parser (PDF, DOCX, TXT)", done: true },
      { text: "30+ ATS schema & formatting checks", done: true },
      { text: "Section-by-section scoring & bullet rewriter", done: true },
      { text: "Active vs passive tone detector", done: true },
      { text: "3-Persona view (ATS, Recruiter, Hiring Manager)", done: true },
    ],
  },
  {
    phase: "Phase 2",
    title: "Differentiators",
    timeline: "Weeks 9–16",
    completed: false,
    active: true,
    items: [
      { text: "1-Click Job Description adapter engine", done: true },
      { text: "Interview question predictor from vague bullets", done: true },
      { text: "Head-to-head Resume A/B tester", done: true },
      { text: "Skill authenticity & evidence graph verification", done: true },
      { text: "Top 10% industry role benchmarking", done: true },
    ],
  },
  {
    phase: "Phase 3",
    title: "Career Intelligence",
    timeline: "Weeks 17–24",
    completed: false,
    items: [
      { text: "Career trajectory & promotion timeline predictor", done: true },
      { text: "Real-time salary calibration by geo & seniority", done: false },
      { text: "GitHub portfolio repository proof sync", done: true },
      { text: "LinkedIn OAuth & profile differential sync", done: false },
    ],
  },
  {
    phase: "Phase 4",
    title: "Advanced Enterprise",
    timeline: "Month 7+",
    completed: false,
    items: [
      { text: "Recruiter multi-candidate bulk screening", done: true },
      { text: "Bias & exclusionary language scanner", done: true },
      { text: "Cross-border cultural CV adapter", done: true },
      { text: "White-label enterprise reports & API keys", done: true },
    ],
  },
];

export default function OverviewPage() {
  const [selectedReader, setSelectedReader] = useState<ReviewerId>("ats");
  const reader = READERS[selectedReader];

  // 3D Tilt State for "Pick a Reader" panel
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      {/* ── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 shadow-xs">
                <Zap size={13} className="text-teal-600 dark:text-teal-400" />
                Next-Gen Multi-Persona Resume Audit
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                Three readers. One resume.{" "}
                <span className="bg-gradient-to-r from-teal-700 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                  See where each one quits.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                SkillSync analyzes your resume through the eyes of an ATS bot, an HR recruiter, and a hiring manager at once. Get instant AI fixes, predicted interview questions, and benchmarks against top candidates in your field.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/analyze"
                  id="hero-start-scan-btn"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-extrabold bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-xl shadow-teal-700/25 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  Check your resume free <ArrowRight size={18} />
                </Link>

                <a
                  href="#pick-a-reader"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-base font-bold bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  Explore sample audit
                </a>
              </div>

              {/* Trust signals */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400" />
                  <span>30+ ATS schema criteria</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400" />
                  <span>Confidential & encrypted</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Interactive 3D Stacked Scene */}
            <div className="lg:col-span-5 relative">
              <ResumeScene3D
                activeReviewer={selectedReader}
                onSelectReviewer={(id) => setSelectedReader(id)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. "PICK A READER" INTERACTIVE PANEL WITH 3D TILT ───────────── */}
      <section
        id="pick-a-reader"
        className="py-16 lg:py-24 bg-gray-100/60 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Interactive Persona Simulation
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold mt-2 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Pick a Reader. See Where They Stop.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3">
              Each reviewer looks for entirely different signals. Choose a reader below to inspect their score, failure trigger, and instant AI fix.
            </p>
          </div>

          {/* Reader Tabs */}
          <div className="flex justify-center mb-8">
            <div
              role="tablist"
              aria-label="Reviewer Persona Tabs"
              className="inline-flex p-1.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm gap-1"
            >
              {(Object.keys(READERS) as ReviewerId[]).map((id) => {
                const r = READERS[id];
                const isSelected = selectedReader === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    id={`tab-reader-${id}`}
                    aria-selected={isSelected}
                    aria-controls={`panel-reader-${id}`}
                    onClick={() => setSelectedReader(id)}
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      isSelected
                        ? "bg-teal-700 text-white shadow-md shadow-teal-700/20 scale-[1.02]"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {id === "ats" ? <Bot size={16} /> : id === "recruiter" ? <Users size={16} /> : <Briefcase size={16} />}
                    <span>{r.label}</span>
                    <span className="text-xs opacity-80">({r.score})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Tilting Reader Card */}
          <div
            id={`panel-reader-${selectedReader}`}
            role="tabpanel"
            aria-labelledby={`tab-reader-${selectedReader}`}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
            }}
            className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 dark:border-teal-500/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-start gap-5">
                <ScoreRing score={reader.score} size={110} strokeWidth={9} showGrade label="Audit Score" />
                <div>
                  <span
                    className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full text-white mb-2"
                    style={{ backgroundColor: reader.accentColor }}
                  >
                    {reader.badge}
                  </span>
                  <h3
                    className="text-2xl font-extrabold text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    {reader.label} View
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                    {reader.tagline}
                  </p>
                </div>
              </div>

              {/* Stop indicator badge */}
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 sm:max-w-xs">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-red-600 dark:text-red-400">
                  <AlertTriangle size={15} />
                  <span>Drop-Off Point</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {reader.stopAt}
                </p>
              </div>
            </div>

            {/* Critique & Why it fails */}
            <div className="py-6 space-y-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                &ldquo;{reader.headline}&rdquo;
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {reader.body}
              </p>
            </div>

            {/* Actionable AI Fix Preview */}
            <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  <Sparkles size={15} /> Recommended AI Fix
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +18 pts Potential Gain
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {reader.fixTitle}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {reader.fixDescription}
                </p>
              </div>

              {/* Before / After comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-red-900 dark:text-red-200">
                  <span className="font-extrabold uppercase text-[10px] text-red-600 dark:text-red-400 block mb-1">
                    Before (Rejected)
                  </span>
                  <code>{reader.fixCodeBefore}</code>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                  <span className="font-extrabold uppercase text-[10px] text-emerald-600 dark:text-emerald-400 block mb-1">
                    SkillSync AI Rewrite (Pass)
                  </span>
                  <code>{reader.fixCodeAfter}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 9 FEATURE CARDS ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Comprehensive Career Stack
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mt-2 text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Everything You Need to Pass Every Filter
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3">
            SkillSync is not just another keyword counter. It is a full career intelligence engine built for ambitious engineers and professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NINE_FEATURES.map((feat, idx) => (
            <Link
              key={idx}
              href={feat.href}
              className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 hover:border-teal-500/60 dark:hover:border-teal-400/60 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                    {feat.badge}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                  style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Explore capability</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. COMPETITOR COMPARISON TABLE ─────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Honest Platform Comparison
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold mt-2 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Why Generic Resume Tools Fall Short
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3">
              Most resume tools only check if keyword &ldquo;X&rdquo; appears in your text. SkillSync evaluates the human reading psychology and technical authenticity behind each bullet.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.04]">
                  <th className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">Capability</th>
                  <th className="p-4 sm:p-5 font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/40 border-x border-teal-200 dark:border-teal-800/40">
                    SkillSync
                  </th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-600 dark:text-gray-300">Jobscan</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-600 dark:text-gray-300">Resume Worded</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-600 dark:text-gray-300">Rezi.ai</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-600 dark:text-gray-300">Enhancv</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-600 dark:text-gray-300">Teal HQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 bg-teal-50/30 dark:bg-teal-950/20 border-x border-teal-200/60 dark:border-teal-800/30 font-bold text-teal-700 dark:text-teal-300">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Yes
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-300">
                      {typeof row.jobscan === "boolean" ? (
                        row.jobscan ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        row.jobscan
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-300">
                      {typeof row.resumeWorded === "boolean" ? (
                        row.resumeWorded ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        row.resumeWorded
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-300">
                      {typeof row.rezi === "boolean" ? (
                        row.rezi ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        row.rezi
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-300">
                      {typeof row.enhancv === "boolean" ? (
                        row.enhancv ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        row.enhancv
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-300">
                      {typeof row.teal === "boolean" ? (
                        row.teal ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        row.teal
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. ROADMAP IN 4 PHASE CARDS ──────────────────────────────────── */}
      <section id="roadmap" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Transparent Engineering Plan
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mt-2 text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Product Development Roadmap
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3">
            Track our progress from MVP launch to enterprise grade career intelligence. Finished items are actively deployed in this build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROADMAP_PHASES.map((phase, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl flex flex-col justify-between border ${
                phase.active
                  ? "bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-xl shadow-teal-500/10"
                  : "bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {phase.phase}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {phase.timeline}
                  </span>
                </div>

                <h3
                  className="text-lg font-bold text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                >
                  {phase.title}
                </h3>

                <ul className="mt-5 space-y-2.5 text-xs">
                  {phase.items.map((item, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 leading-snug ${
                        item.done
                          ? "text-gray-800 dark:text-gray-200 font-medium"
                          : "text-gray-400 dark:text-gray-400"
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-white/20 shrink-0 mt-0.5" />
                      )}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    phase.completed
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : phase.active
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                      : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400"
                  }`}
                >
                  {phase.completed ? "Done" : phase.active ? "Active Release" : "Upcoming"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. FINAL BOTTOM CTA BANNER ───────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl font-black"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Ready to See Why Recruiters Are Passing?
          </h2>
          <p className="mt-3 text-teal-100 text-base max-w-xl mx-auto">
            Upload your resume or paste text. In 10 seconds, get actionable multi-persona feedback that gets you interviews.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/analyze"
              className="px-8 py-4 rounded-full text-base font-extrabold bg-white text-teal-900 hover:bg-gray-100 shadow-xl transition-all"
            >
              Analyze My Resume Free &rarr;
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
