"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Plus,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Chip } from "@/components/ui/Chip";

interface BulletQuestionMap {
  id: string;
  category: string;
  vagueBullet: string;
  interviewerIntent: string;
  predictedQuestions: string[];
  recommendedRewrite: string;
  metricsGained: string;
}

const SAMPLE_BULLET_MAPS: BulletQuestionMap[] = [
  {
    id: "1",
    category: "Leadership & Scope",
    vagueBullet: "Led a cross-functional team to improve software delivery speed.",
    interviewerIntent:
      "Interviewer skepticism: The phrase 'led a team' without headcount or deliverables sounds like passive coordination rather than technical leadership.",
    predictedQuestions: [
      "How large was the team, which roles were represented, and were you their direct manager or tech lead?",
      "What was your deployment cycle time before you intervened, and what was it after?",
      "Can you walk me through the specific architectural bottlenecks that were slowing down delivery?",
    ],
    recommendedRewrite:
      "Directed 8 engineers and UX designers in architecting automated CI/CD pipelines, slashing sprint deployment cycle time from 14 days to 4 hours.",
    metricsGained: "8 headcount / 14 days -> 4 hrs",
  },
  {
    id: "2",
    category: "Backend & Performance",
    vagueBullet: "Responsible for improving database queries and backend reliability.",
    interviewerIntent:
      "Interviewer skepticism: 'Responsible for' indicates passive job duty rather than engineering accomplishment. No database engine or baseline latency is stated.",
    predictedQuestions: [
      "Which database system was this, and how did you measure query performance before optimizing?",
      "Did you use indexing, query restructuring, connection pooling, or caching? Walk me through the tradeoffs.",
      "What did P95 and P99 latency look like under peak production load?",
    ],
    recommendedRewrite:
      "Profiled and restructured 14 high-cardinality PostgreSQL queries using composite indexes and Redis caching, reducing P99 latency from 420ms to 45ms.",
    metricsGained: "14 queries / -89% latency",
  },
  {
    id: "3",
    category: "Product & Impact",
    vagueBullet: "Worked closely with product managers to launch new user-facing features.",
    interviewerIntent:
      "Interviewer skepticism: Every engineer works with product managers. What was your personal contribution, and did users actually adopt the feature?",
    predictedQuestions: [
      "What specific user-facing features did you build, and what business metrics were used to gauge success?",
      "How did you handle pushback when product asked for a tight deadline that conflicted with technical debt?",
      "What telemetry or tracking did you add to verify feature adoption post-launch?",
    ],
    recommendedRewrite:
      "Engineered frontend architecture for 3 core enterprise workflow modules, driving a 28% increase in 30-day user onboarding completion.",
    metricsGained: "+28% conversion / 3 modules",
  },
];

export default function InterviewPrepPage() {
  const [bulletMaps, setBulletMaps] = useState<BulletQuestionMap[]>(SAMPLE_BULLET_MAPS);
  const [inputBullet, setInputBullet] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePredictCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBullet.trim() || inputBullet.trim().length < 15) return;

    setIsPredicting(true);
    setTimeout(() => {
      const newMap: BulletQuestionMap = {
        id: Date.now().toString(),
        category: "Custom Tested Claim",
        vagueBullet: inputBullet.trim(),
        interviewerIntent:
          "Interviewer skepticism: The claim requires deeper baseline data, explicit tools, and verified team boundaries.",
        predictedQuestions: [
          `Can you provide the exact baseline numbers for "${inputBullet.slice(0, 45)}..."?`,
          "What specific trade-offs or technical decisions did you personally make during this initiative?",
          "How did you measure the business or customer impact of this work after shipping?",
        ],
        recommendedRewrite: `Spearheaded end-to-end implementation of ${inputBullet.trim().toLowerCase().replace(/^managed |^worked on |^responsible for /i, "")}, achieving quantifiable 35% efficiency gains and verified uptime.`,
        metricsGained: "+35% verified outcome",
      };

      setBulletMaps([newMap, ...bulletMaps]);
      setInputBullet("");
      setIsPredicting(false);
    }, 600);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      {/* Hero Section */}
      <section className="pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shadow-xs">
            <MessageSquare size={13} className="text-violet-600 dark:text-violet-400" />
            Interview Question Predictor
          </div>

          <h1
            className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Vague bullets trigger{" "}
            <span className="bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent">
              interviewer skepticism.
            </span>
          </h1>

          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Hiring managers don&apos;t just read your bullets—they formulate probing interview questions based on what you left unquantified. See the questions in advance and upgrade your resume.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Interactive Input: Test Your Own Resume Bullet */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2.5 mb-2">
            <Zap size={18} className="text-teal-600 dark:text-teal-400" />
            <h2
              className="text-lg font-bold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Test Any Resume Bullet
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Paste one of your current bullet points below to predict the exact questions interviewers will ask.
          </p>

          <form onSubmit={handlePredictCustom} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputBullet}
              onChange={(e) => setInputBullet(e.target.value)}
              placeholder="e.g. Responsible for collaborating with team to improve website performance..."
              className="flex-1 text-sm p-3.5 rounded-xl border border-gray-200 dark:border-white/15 bg-gray-50/50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={isPredicting || inputBullet.trim().length < 15}
              className="py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 disabled:opacity-50 text-white shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <>Predicting...</>
              ) : (
                <>
                  Predict Questions <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mapped Bullet List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Simulated Interview Maps ({bulletMaps.length})
            </h3>
            <span className="text-xs text-gray-500">
              Cross-referenced against tech hiring rubrics
            </span>
          </div>

          {bulletMaps.map((map) => (
            <div
              key={map.id}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Top: Category & Original Bullet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                    {map.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {map.metricsGained}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/50 text-red-950 dark:text-red-200 text-sm font-medium">
                  <span className="font-extrabold text-red-600 dark:text-red-400 uppercase text-[10px] block mb-0.5">
                    Your Current Bullet:
                  </span>
                  &ldquo;{map.vagueBullet}&rdquo;
                </div>
              </div>

              {/* Skepticism Intent */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{map.interviewerIntent}</span>
              </div>

              {/* Predicted Questions Triggered */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-violet-500" /> Questions Triggered in Interview:
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                  {map.predictedQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-start gap-2.5 font-medium"
                    >
                      <span className="font-bold text-violet-600 dark:text-violet-400 shrink-0">
                        Q{idx + 1}:
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Rewrite */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={13} /> Recommended Quantified Rewrite
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(map.recommendedRewrite, map.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900"
                  >
                    {copiedId === map.id ? (
                      <>
                        <Check size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy Rewrite
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium">
                  {map.recommendedRewrite}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
