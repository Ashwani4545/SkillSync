"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Circle, Sparkles, ShieldCheck } from "lucide-react";

interface ScanProgressProps {
  onComplete?: () => void;
  speedMs?: number; // ms per step, default ~600ms
  className?: string;
}

const SCAN_STEPS = [
  "Reading contact details",
  "Importing work history",
  "Reading education",
  "Mapping skills",
  "Running the three reviewer views",
  "Scoring against the ATS checks",
];

export function ScanProgress({
  onComplete,
  speedMs = 650,
  className = "",
}: ScanProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < SCAN_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, speedMs);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, speedMs, onComplete]);

  const progressPercent = Math.min(
    Math.round(((currentStepIndex) / SCAN_STEPS.length) * 100),
    100
  );

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-8 shadow-xl max-w-xl mx-auto ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sparkles size={20} className="animate-spin text-teal-500" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <h3
              className="text-lg font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Analyzing Resume Against 30+ ATS Rules
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Simulating ATS parser, recruiter screen, and hiring manager audit
            </p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-teal-700 to-teal-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 6 Steps List */}
      <ul className="space-y-3.5">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <li
              key={idx}
              className={`flex items-center gap-3 text-sm transition-colors duration-200 ${
                isDone
                  ? "text-gray-900 dark:text-gray-200 font-semibold"
                  : isCurrent
                  ? "text-teal-700 dark:text-teal-300 font-bold"
                  : "text-gray-400 dark:text-gray-400 font-normal"
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 size={18} className="text-teal-500 animate-spin shrink-0" />
              ) : (
                <Circle size={18} className="text-gray-300 dark:text-white/20 shrink-0" />
              )}
              <span>{step}</span>
              {isDone && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ml-auto uppercase tracking-wider">
                  Complete
                </span>
              )}
              {isCurrent && (
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 ml-auto animate-pulse">
                  Scanning...
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
