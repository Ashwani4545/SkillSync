"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Eye,
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Chip } from "@/components/ui/Chip";

export type LensMode = "ats" | "recruiter" | "hiring_manager";

interface ReviewerLensSimulatorProps {
  candidateName?: string;
  candidateRole?: string;
  className?: string;
}

export function ReviewerLensSimulator({
  candidateName = "Alex Morgan",
  candidateRole = "Senior Full-Stack Engineer",
  className = "",
}: ReviewerLensSimulatorProps) {
  const [activeLens, setActiveLens] = useState<LensMode>("recruiter");
  const [isPlayingTimer, setIsPlayingTimer] = useState(false);
  const [scanSeconds, setScanSeconds] = useState(0);
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<number | null>(null);

  // 6-Second Eye Tracking Timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingTimer) {
      interval = setInterval(() => {
        setScanSeconds((prev) => {
          if (prev >= 6.0) {
            setIsPlayingTimer(false);
            return 6.0;
          }
          return parseFloat((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimer]);

  const resetTimer = () => {
    setIsPlayingTimer(false);
    setScanSeconds(0);
  };

  return (
    <div
      id="reviewer-lens-simulator"
      className={`rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1526] shadow-xl overflow-hidden ${className}`}
    >
      {/* Top Banner & Mode Switcher */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-purple-500/10 border-b border-gray-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Exclusive Multi-Persona Vision
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              See Your Resume Through All 3 Reviewer Lenses
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
              Switch between the raw ATS schema parser, the real human 6-second eye-tracking heat map, and the hiring manager’s evidence audit.
            </p>
          </div>

          {/* Mode Tabs */}
          <div
            role="tablist"
            className="flex p-1.5 rounded-2xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 self-start md:self-auto shrink-0 shadow-inner"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "ats"}
              onClick={() => {
                setActiveLens("ats");
                setIsPlayingTimer(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeLens === "ats"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Bot size={15} />
              <span>ATS Parser</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "recruiter"}
              onClick={() => {
                setActiveLens("recruiter");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeLens === "recruiter"
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Eye size={15} />
              <span>Recruiter Heatmap</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "hiring_manager"}
              onClick={() => {
                setActiveLens("hiring_manager");
                setIsPlayingTimer(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeLens === "hiring_manager"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Briefcase size={15} />
              <span>HM Evidence</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode Explainer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-xs">
          {activeLens === "ats" && (
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                <strong>Simulating ATS Lexical Parser:</strong> Showing tokens recognized as entity schemas (Job Title, Date, Skills, Companies).
              </span>
            </div>
          )}

          {activeLens === "recruiter" && (
            <div className="flex flex-wrap items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  <strong>6-Second Eye-Tracking Simulation:</strong> Human eyes fixate in an F-pattern on titles and metrics, skimming past blocks of text.
                </span>
              </div>

              {/* 6-Second Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlayingTimer(!isPlayingTimer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-sm"
                >
                  {isPlayingTimer ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlayingTimer ? "Pause Scan" : scanSeconds > 0 && scanSeconds < 6 ? "Resume" : "Play 6s Eye Scan"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  title="Reset Scan Timer"
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 min-w-[38px] text-right">
                  {scanSeconds.toFixed(1)}s
                </span>
              </div>
            </div>
          )}

          {activeLens === "hiring_manager" && (
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                <strong>Hiring Manager Skepticism Audit:</strong> Green indicates quantified evidence; red flags unbacked claims that trigger interview grill questions.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body: Interactive Resume Sheet with Simulated Overlays */}
      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Visual Simulated Resume Sheet (8 cols) */}
        <div className="lg:col-span-8 relative">
          <div className="rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 p-6 sm:p-10 shadow-lg text-gray-800 dark:text-gray-200 font-sans relative overflow-hidden select-none">
            {/* ── MODE 2: RECRUITER EYE-TRACKING HEATMAP OVERLAYS ── */}
            {activeLens === "recruiter" && (
              <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
                {/* Fixation 1: Header & Role (0.0s - 1.2s) */}
                <div
                  className="absolute top-6 left-8 w-44 h-24 rounded-full blur-2xl transition-all duration-500"
                  style={{
                    background:
                      scanSeconds >= 0.5
                        ? "radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(245, 158, 11, 0.3) 60%, transparent 90%)"
                        : "transparent",
                  }}
                />

                {/* Fixation 2: Most Recent Job Title & Company (1.2s - 2.8s) */}
                <div
                  className="absolute top-44 left-8 w-60 h-28 rounded-full blur-2xl transition-all duration-500"
                  style={{
                    background:
                      scanSeconds >= 1.4
                        ? "radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(245, 158, 11, 0.25) 60%, transparent 90%)"
                        : "transparent",
                  }}
                />

                {/* Fixation 3: First bullet metric (2.8s - 4.2s) */}
                <div
                  className="absolute top-64 left-16 w-52 h-20 rounded-full blur-xl transition-all duration-500"
                  style={{
                    background:
                      scanSeconds >= 2.8
                        ? "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(245, 158, 11, 0.2) 60%, transparent 90%)"
                        : "transparent",
                  }}
                />

                {/* Fixation 4: Second Job Title & Dates (4.2s - 5.5s) */}
                <div
                  className="absolute top-96 left-8 w-48 h-20 rounded-full blur-2xl transition-all duration-500"
                  style={{
                    background:
                      scanSeconds >= 4.2
                        ? "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 80%)"
                        : "transparent",
                  }}
                />

                {/* Live Scanning Eye Target Pointer */}
                {isPlayingTimer && scanSeconds < 6.0 && (
                  <div
                    className="absolute z-20 w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/20 shadow-lg flex items-center justify-center transition-all duration-200 pointer-events-none"
                    style={{
                      top:
                        scanSeconds < 1.5
                          ? "8%"
                          : scanSeconds < 3.0
                          ? "28%"
                          : scanSeconds < 4.5
                          ? "45%"
                          : "70%",
                      left:
                        scanSeconds < 1.5
                          ? "20%"
                          : scanSeconds < 3.0
                          ? "30%"
                          : scanSeconds < 4.5
                          ? "25%"
                          : "18%",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  </div>
                )}
              </div>
            )}

            {/* ── RESUME DOCUMENT CONTENT ── */}
            {/* Header Block */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 mb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {candidateName}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  San Francisco, CA • alex.morgan@email.com • github.com/alexmorgan
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                  {candidateRole}
                </span>
                {activeLens === "ats" && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-300 font-mono font-bold">
                    [TOKEN: TARGET_ROLE_MATCH_100%]
                  </span>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                <span>Executive Summary</span>
                {activeLens === "ats" && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-300 font-mono font-bold">
                    [SECTION: SUMMARY_VALIDATED]
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Full-Stack Engineer with 6+ years specializing in distributed systems, Next.js architecture, and high-throughput PostgreSQL databases. Proven record scaling microservices from MVP to 3,200 requests/sec.
              </p>
            </div>

            {/* Experience Section */}
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span>Work Experience</span>
                {activeLens === "ats" && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-300 font-mono font-bold">
                    [SECTION: CHRONOLOGICAL_VERIFIED]
                  </span>
                )}
              </div>

              {/* Job 1 */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  <span>Lead Full-Stack Engineer — Acme Cloud Inc.</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">2023 — Present</span>
                </div>

                <ul className="space-y-2 mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {/* Bullet 1 */}
                  <li
                    onClick={() => setSelectedBulletIndex(1)}
                    className={`cursor-pointer p-2 rounded-lg transition-all ${
                      activeLens === "hiring_manager"
                        ? "border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    • Architected Next.js App Router design system and distributed Node.js microservices, cutting page load latency by <strong className="text-emerald-700 dark:text-emerald-300">42%</strong> across 18,000 monthly active users.
                    {activeLens === "hiring_manager" && (
                      <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Evidence Verified: Quantified outcome (42% latency cut) with scale (18k users).
                      </span>
                    )}
                  </li>

                  {/* Bullet 2 */}
                  <li
                    onClick={() => setSelectedBulletIndex(2)}
                    className={`cursor-pointer p-2 rounded-lg transition-all ${
                      activeLens === "hiring_manager"
                        ? "border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    • Optimized PostgreSQL database queries and added Redis caching, reducing p99 database response times from 1,200ms to <strong className="text-emerald-700 dark:text-emerald-300">65ms</strong>.
                    {activeLens === "hiring_manager" && (
                      <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Evidence Verified: Specific technical mechanism (Redis caching) + hard SLA benchmark.
                      </span>
                    )}
                  </li>

                  {/* Bullet 3 (Skepticism trigger) */}
                  <li
                    onClick={() => setSelectedBulletIndex(3)}
                    className={`cursor-pointer p-2 rounded-lg transition-all ${
                      activeLens === "hiring_manager"
                        ? "border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/20"
                        : activeLens === "recruiter" && scanSeconds >= 5.0
                        ? "text-gray-400 line-through"
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    • Led a cross-functional team to improve software delivery speed and helped with code deployment.
                    {activeLens === "hiring_manager" && (
                      <span className="block text-[11px] font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Skepticism Trigger: "Led a team" without headcount or metrics. Recruiter quits here!
                      </span>
                    )}
                  </li>
                </ul>
              </div>

              {/* Job 2 */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  <span>Software Engineer — Horizon Labs</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">2020 — 2023</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  • Maintained REST APIs and built frontend features using React, Docker, and GitHub Actions.
                </p>
              </div>
            </div>

            {/* Skills Block */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <span>Core Skills</span>
                {activeLens === "ats" && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-300 font-mono font-bold">
                    [TOKEN_EXTRACTION_CONFIDENCE: 96%]
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "React 19", "Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS"].map(
                  (sk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                      {sk}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Perspective Audit Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {activeLens === "ats" && (
            <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  ATS Parser Audit
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                  94% Parsable
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Clean Single-Column Structure
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Workday and Greenhouse parser simulation confirms zero table traps, standard chronological dates, and accurate role token mapping.
              </p>
              <div className="space-y-2 pt-2 border-t border-teal-200 dark:border-teal-800/40 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 size={14} /> Section headers standard
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 size={14} /> Zero non-standard UTF-8 symbols
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 size={14} /> Contact info in body (not header)
                </div>
              </div>
            </div>
          )}

          {activeLens === "recruiter" && (
            <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Recruiter 6-Sec Scan
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                  F-Pattern Fixation
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Where Human Eyes Drop Off
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Recruiters spend an average of 1.4 seconds on your name and current title, 2.8 seconds on your first 2 bullets, and skim or skip dense paragraphs.
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-amber-300 dark:border-amber-900/50 text-xs space-y-1.5">
                <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Attention Drop Point:
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  By Bullet 3 of Job 1, passive phrasing (&ldquo;helped with&rdquo;) causes 78% of recruiters to abandon and jump to the next applicant.
                </p>
              </div>
            </div>
          )}

          {activeLens === "hiring_manager" && (
            <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                  Hiring Manager Lens
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                  Depth Audit
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Claims vs. Hard Evidence
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Hiring managers grill candidates on bullets lacking numbers. Every bullet without a metric is assumed to be exaggerated.
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-purple-300 dark:border-purple-900/50 text-xs space-y-2">
                <div className="font-bold text-purple-700 dark:text-purple-300">
                  Predicted Technical Grill Question:
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  &ldquo;You mentioned you led a team to improve delivery speed. How did you measure speed, and what specific architectural bottlenecks did you remove?&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Value Callout */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-600" />
              Why SkillSync Is Unique
            </div>
            <p>
              Traditional checkers only check keyword frequency against job postings. SkillSync is the only platform simulating the exact moment each human reviewer loses interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
