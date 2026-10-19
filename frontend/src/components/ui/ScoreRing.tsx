"use client";

import React, { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showGrade?: boolean;
  animate?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 9,
  label,
  sublabel,
  showGrade = false,
  animate = true,
  className = "",
}: ScoreRingProps) {
  const [displayedScore, setDisplayedScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayedScore(score);
      return;
    }

    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(ease * score));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  // Color thresholds: >=75 success, 60-74 warning, <60 danger
  const getColor = (val: number) => {
    if (val >= 75) return "var(--color-success, #10B981)";
    if (val >= 60) return "var(--color-warning, #F59E0B)";
    return "var(--color-danger, #EF4444)";
  };

  const getGrade = (val: number) => {
    if (val >= 90) return "A";
    if (val >= 80) return "B+";
    if (val >= 75) return "B";
    if (val >= 65) return "C+";
    if (val >= 60) return "C";
    return "Needs Work";
  };

  const ringColor = getColor(score);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${score} out of 100` : `Score: ${score} out of 100`}
    >
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: animate ? "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span
              className="font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-heading, 'Syne', sans-serif)",
                fontSize: size >= 130 ? "2.25rem" : size >= 100 ? "1.75rem" : "1.25rem",
                color: ringColor,
                lineHeight: 1,
              }}
            >
              {displayedScore}
            </span>
            <span
              className="text-xs font-semibold text-gray-400 dark:text-gray-400 ml-0.5"
              style={{ fontSize: size >= 100 ? "0.75rem" : "0.65rem" }}
            >
              /100
            </span>
          </div>

          {showGrade && (
            <span
              className="text-xs font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-full"
              style={{
                fontSize: "0.65rem",
                backgroundColor: `${ringColor}22`,
                color: ringColor,
              }}
            >
              {getGrade(score)}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span
          className="mt-2 text-sm font-bold text-gray-800 dark:text-gray-200 text-center"
          style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
        >
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
}
