"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitCompare,
  Trophy,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarRow } from "@/components/ui/BarRow";

const SAMPLE_COMPARISON_RESULT = {
  winner: "B",
  scoreA: 72,
  scoreB: 86,
  winnerDifference: 14,
  reason:
    "Version B wins by +14 points due to significantly higher quantified metric density (88% vs 54%), zero passive hedging phrases, and direct skill evidence for senior technical leadership.",
  dimensions: [
    { name: "ATS Schema & Format", scoreA: 82, scoreB: 92, note: "Version B uses cleaner single-column hierarchy" },
    { name: "Action Verb Strength", scoreA: 70, scoreB: 88, note: "Version B leads 90% of bullets with active verbs" },
    { name: "Quantified Metrics Ratio", scoreA: 54, scoreB: 88, note: "Version B benchmarks 12 throughput metrics" },
    { name: "Skill Evidence Match", scoreA: 74, scoreB: 84, note: "Version B backs 6 core skills with proof" },
    { name: "Recruiter 6-Sec Skim", scoreA: 68, scoreB: 80, note: "Version B highlights promotion tenure" },
  ],
  keyTakeaway:
    "Version B removes passive phrases ('responsible for', 'assisted with') and provides exact team size and business outcomes for every senior role.",
};

export default function ComparePage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumeA, setResumeA] = useState("sample_a");
  const [resumeB, setResumeB] = useState("sample_b");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [comparison, setComparison] = useState(SAMPLE_COMPARISON_RESULT);

  useEffect(() => {
    apiClient
      .get("/resume/")
      .then(({ data }) => setResumes(data.resumes ?? []))
      .catch(() => {});
  }, []);

  const handleStartCompare = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("done");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10">
        {/* Page Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <GitCompare size={13} /> Head-to-Head Testing
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Resume A/B Tester
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Unsure which resume version to submit? Compare two drafts side-by-side. Our multi-persona engine evaluates ATS readability, verb impact, and declares a clear winner.
          </p>
        </div>

        {/* Input Selectors */}
        {status !== "done" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Version A Selector */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-400/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-sky-600 dark:text-sky-400">
                    Version A (Baseline)
                  </span>
                  <span className="text-xs font-bold text-gray-400">Draft 1</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setResumeA("sample_a")}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      resumeA === "sample_a"
                        ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-950 dark:text-white font-bold"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="text-sm">Alex Morgan — Standard Draft (72 pts)</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-normal">
                      Original draft with qualitative bullet descriptions
                    </p>
                  </button>

                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setResumeA(r.id)}
                      className={`w-full p-4 rounded-xl text-left border transition-all ${
                        resumeA === r.id
                          ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-950 dark:text-white font-bold"
                          : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="text-sm font-semibold truncate">{r.filename}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Version B Selector */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400">
                    Version B (Target Revision)
                  </span>
                  <span className="text-xs font-bold text-gray-400">Draft 2</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setResumeB("sample_b")}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      resumeB === "sample_b"
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-950 dark:text-white font-bold"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="text-sm">Alex Morgan — Quantified Metrics (86 pts)</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-normal">
                      Revised with high-impact numbers and active lead verbs
                    </p>
                  </button>

                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setResumeB(r.id)}
                      className={`w-full p-4 rounded-xl text-left border transition-all ${
                        resumeB === r.id
                          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-950 dark:text-white font-bold"
                          : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="text-sm font-semibold truncate">{r.filename}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartCompare}
              disabled={status === "loading"}
              className="w-full py-4 rounded-full font-extrabold text-sm bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-xl shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Comparing Draft A vs Draft B...
                </>
              ) : (
                <>
                  <GitCompare size={16} /> Compare Both Resumes Head-to-Head <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Comparison Results */}
        {status === "done" && (
          <div className="space-y-8 animate-fade-up">
            {/* Winner Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 to-teal-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <Trophy size={32} className="text-amber-300" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 mb-1">
                    WINNER DECLARED
                  </div>
                  <h2
                    className="text-2xl sm:text-3xl font-black"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    Version B Wins (+{comparison.winnerDifference} Points)
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-1 leading-relaxed">
                    {comparison.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl shrink-0 self-start md:self-auto">
                <div className="text-center px-3">
                  <div className="text-3xl font-black">{comparison.scoreA}</div>
                  <div className="text-xs text-teal-200 font-semibold">Version A</div>
                </div>
                <div className="text-xl font-bold opacity-50">vs</div>
                <div className="text-center px-3">
                  <div className="text-3xl font-black text-amber-300">{comparison.scoreB}</div>
                  <div className="text-xs text-teal-200 font-semibold">Version B</div>
                </div>
              </div>
            </div>

            {/* Version A vs Version B Dimension Bars */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-extrabold text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    Side-by-Side Dimension Scoring
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Blue = Version A (Baseline) &bull; Green = Version B (Revision)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  <RotateCcw size={13} /> Compare Other Drafts
                </button>
              </div>

              <div className="space-y-6">
                {comparison.dimensions.map((dim, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-900 dark:text-white">{dim.name}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-sky-600 font-semibold">Ver A: {dim.scoreA}%</span>
                        <span className="text-emerald-600 font-bold">Ver B: {dim.scoreB}%</span>
                      </div>
                    </div>

                    {/* Double Bar Comparison */}
                    <div className="space-y-1.5">
                      {/* Bar A */}
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-700"
                          style={{ width: `${dim.scoreA}%` }}
                        />
                      </div>
                      {/* Bar B */}
                      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${dim.scoreB}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Why: {dim.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
