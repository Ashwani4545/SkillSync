"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isHighlighted?: boolean;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  badge?: string;
  billingNote?: string;
}

export function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  isHighlighted = false,
  ctaText = "Get Started",
  ctaHref = "/signup",
  onCtaClick,
  badge = "MOST POPULAR",
  billingNote,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl transition-all duration-300 p-6 md:p-8 ${
        isHighlighted
          ? "bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-2xl shadow-teal-500/10 md:-translate-y-2 ring-1 ring-teal-500/30"
          : "bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md">
            <Sparkles size={12} /> {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-xl font-extrabold text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
        >
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[40px]">
          {description}
        </p>
      </div>

      {/* Pricing display */}
      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-baseline">
          <span
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            {price}
          </span>
          {price !== "Free" && price !== "$0" && (
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1.5">
              {period}
            </span>
          )}
        </div>
        {billingNote && (
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
            {billingNote}
          </p>
        )}
      </div>

      {/* Feature List */}
      <div className="flex-1 mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-4">
          What&apos;s Included
        </p>
        <ul className="space-y-3 text-sm">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <div
                className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                  isHighlighted
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                }`}
              >
                <Check size={14} strokeWidth={2.5} />
              </div>
              <span className="leading-snug">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div>
        {onCtaClick ? (
          <button
            type="button"
            onClick={onCtaClick}
            className={`w-full py-3 px-6 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isHighlighted
                ? "bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-lg shadow-teal-700/25"
                : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white"
            }`}
          >
            {ctaText} <ArrowRight size={15} />
          </button>
        ) : (
          <Link
            href={ctaHref}
            className={`w-full py-3 px-6 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isHighlighted
                ? "bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-lg shadow-teal-700/25"
                : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white"
            }`}
          >
            {ctaText} <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
