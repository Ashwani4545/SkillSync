"use client";

import React, { useEffect, useState } from "react";

interface BarRowProps {
  label: string;
  value: number;
  comparisonValue?: number;
  comparisonLabel?: string;
  subtext?: string;
  animate?: boolean;
  colorThreshold?: boolean;
  customColor?: string;
  showValue?: boolean;
  unit?: string;
  className?: string;
}

export function BarRow({
  label,
  value,
  comparisonValue,
  comparisonLabel = "Top 10%",
  subtext,
  animate = true,
  colorThreshold = true,
  customColor,
  showValue = true,
  unit = "%",
  className = "",
}: BarRowProps) {
  const [width, setWidth] = useState(animate ? 0 : value);
  const [compWidth, setCompWidth] = useState(animate ? 0 : comparisonValue ?? 0);

  useEffect(() => {
    if (!animate) {
      setWidth(value);
      if (comparisonValue !== undefined) setCompWidth(comparisonValue);
      return;
    }

    const timer = setTimeout(() => {
      setWidth(value);
      if (comparisonValue !== undefined) setCompWidth(comparisonValue);
    }, 120);

    return () => clearTimeout(timer);
  }, [value, comparisonValue, animate]);

  const getColor = (val: number) => {
    if (customColor) return customColor;
    if (!colorThreshold) return "var(--color-primary, #1D9E75)";
    if (val >= 75) return "var(--color-success, #10B981)";
    if (val >= 60) return "var(--color-warning, #F59E0B)";
    return "var(--color-danger, #EF4444)";
  };

  const barColor = getColor(value);

  return (
    <div className={`w-full mb-3.5 ${className}`}>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {label}
        </span>
        {showValue && (
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-sm"
              style={{ color: barColor }}
            >
              {value}{unit}
            </span>
            {comparisonValue !== undefined && (
              <span className="text-xs text-gray-400 dark:text-gray-400">
                vs {comparisonValue}{unit} ({comparisonLabel})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Bar Track */}
      <div
        className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}${unit}`}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(Math.max(width, 0), 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Optional Benchmark Comparison Bar */}
      {comparisonValue !== undefined && (
        <div className="mt-1 flex items-center justify-between">
          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500/80 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Math.max(compWidth, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {subtext && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
