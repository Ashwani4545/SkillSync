"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Shield, Sparkles } from "lucide-react";

export function Footer() {
  const [language, setLanguage] = useState("en");

  return (
    <footer className="w-full bg-gray-50 dark:bg-[#070B16] border-t border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Column 1: Brand & Tagline & CTA (spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                S
              </div>
              <span
                className="text-xl font-extrabold text-teal-700 dark:text-teal-400 tracking-tight"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                SkillSync
              </span>
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed">
              Three readers. One resume. See where each one quits. Analyze your resume through the eyes of an ATS bot, a recruiter, and a hiring manager at once.
            </p>

            <div className="pt-2">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 hover:bg-teal-600 text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Start Free Scan <ArrowRight size={13} />
              </Link>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-400 pt-2 leading-relaxed">
              Note: SkillSync uses realistic placeholder benchmarks for illustrative purposes. No fabricated user counts, inflated pass rates, or simulated awards.
            </p>
          </div>

          {/* Column 2: Tools */}
          <div>
            <h4
              className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/analyze"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link
                  href="/jd-adapter"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  JD Adapter
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  A/B Tester
                </Link>
              </li>
              <li>
                <Link
                  href="/interview-prep"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Interview Predictor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Career */}
          <div>
            <h4
              className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Career
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/career-path"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Career Path
                </Link>
              </li>
              <li>
                <Link
                  href="/benchmark"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Industry Benchmark
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze#skills"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Skill Authenticity
                </Link>
              </li>
              <li>
                <Link
                  href="/salary"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Salary Calibration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4
              className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze#faq"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold text-teal-700 dark:text-teal-400"
                >
                  Free Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            &copy; {new Date().getFullYear()} Ashwani Pandey. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/accessibility" className="hover:underline">
              Accessibility
            </Link>

            {/* Language Selector: only show verified translated languages */}
            <div className="flex items-center gap-1.5 ml-2">
              <Globe size={14} className="text-teal-600 dark:text-teal-400" />
              <label htmlFor="language-select" className="sr-only">
                Select language
              </label>
              <select
                id="language-select"
                value="en"
                disabled
                title="SkillSync is currently localized in English (US). Try Cultural CV Adapter for US/EU/JP formats."
                className="bg-transparent text-xs text-gray-600 dark:text-gray-300 border-none cursor-default p-0 focus:outline-none"
              >
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
