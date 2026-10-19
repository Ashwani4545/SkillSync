"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingCard } from "@/components/pricing/PricingCard";

const PRICING_FAQS = [
  {
    q: "Can I try SkillSync for free?",
    a: "Yes! Our Free tier includes 3 complete resume ATS audits every month with zero credit card required.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, you can cancel or pause your subscription with one click from your account settings at any time without fees.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We support all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and PayPal through Stripe.",
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Yes! Choosing annual billing saves you 20% on Pro, Career, and Team plans.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Essential ATS checks for casual job seekers.",
      features: [
        "3 resume ATS audits per month",
        "30+ ATS schema & format checks",
        "Drop-off line detection",
        "Basic keyword match score",
        "Confidential browser session",
      ],
      isHighlighted: false,
      ctaText: "Start Free",
      ctaHref: "/signup",
    },
    {
      name: "Pro",
      price: isAnnual ? "$15" : "$19",
      period: "/month",
      billingNote: isAnnual ? "Billed annually ($180/yr)" : "Billed monthly",
      description: "For active candidates who want to maximize interview callbacks.",
      features: [
        "Unlimited resume audits",
        "3-Reviewer simulation (ATS, HR, HM)",
        "1-Click JD Adapter tailoring",
        "Interview question predictor",
        "Before/After AI bullet rewriter",
        "Resume A/B tester comparison",
        "Downloadable tailored PDFs",
      ],
      isHighlighted: true,
      badge: "MOST POPULAR",
      ctaText: "Get Pro Access",
      ctaHref: "/signup?plan=pro",
    },
    {
      name: "Career",
      price: isAnnual ? "$31" : "$39",
      period: "/month",
      billingNote: isAnnual ? "Billed annually ($372/yr)" : "Billed monthly",
      description: "Complete career intelligence, promotion timelines, and benchmarks.",
      features: [
        "Everything in Pro plan",
        "Top 10% candidate role benchmark",
        "Career trajectory & skill gap forecast",
        "Salary calibration by location & band",
        "GitHub repository proof verification",
        "Priority AI processing queue",
      ],
      isHighlighted: false,
      ctaText: "Start Career Plan",
      ctaHref: "/signup?plan=career",
    },
    {
      name: "Team",
      price: isAnnual ? "$79" : "$99",
      period: "/month",
      billingNote: isAnnual ? "Billed annually ($948/yr)" : "Billed monthly",
      description: "For recruiting agencies, talent leads, and career coaches.",
      features: [
        "Everything in Career plan",
        "Bulk candidate upload (up to 50 at once)",
        "Recruiter comparative heatmap",
        "Bias & exclusionary language scanner",
        "White-label candidate export reports",
        "API access & webhook integration",
      ],
      isHighlighted: false,
      ctaText: "Start Team Plan",
      ctaHref: "/signup?plan=team",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      {/* Hero Header */}
      <section className="pt-14 pb-12 lg:pt-20 lg:pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Simple, Transparent Pricing
          </span>

          <h1
            className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Invest in your next career leap.
          </h1>

          <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Get multi-persona resume auditing and JD tailoring. Start free, then upgrade when actively sending applications.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              aria-label="Toggle annual billing for 20% discount"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isAnnual ? "bg-teal-600" : "bg-gray-300 dark:bg-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  isAnnual ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
              Annual
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((p, idx) => (
            <PricingCard key={idx} {...p} />
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
            >
              Detailed Feature Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04]">
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-semibold text-center">Free</th>
                  <th className="p-4 font-bold text-center text-teal-600 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/30">Pro</th>
                  <th className="p-4 font-semibold text-center">Career</th>
                  <th className="p-4 font-semibold text-center">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs sm:text-sm">
                {[
                  { name: "30+ ATS schema & format checks", free: true, pro: true, career: true, team: true },
                  { name: "Drop-off line detection ('stops reading')", free: true, pro: true, career: true, team: true },
                  { name: "Simulate ATS + HR + Hiring Manager", free: false, pro: true, career: true, team: true },
                  { name: "1-Click Job Description tailoring", free: false, pro: true, career: true, team: true },
                  { name: "Interview question predictor", free: false, pro: true, career: true, team: true },
                  { name: "Top 10% candidate role benchmarking", free: false, free_text: "Preview", pro: false, career: true, team: true },
                  { name: "Salary calibration by location", free: false, pro: false, career: true, team: true },
                  { name: "Bulk candidate resumes screening", free: false, pro: false, career: false, team: "Up to 50" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{row.name}</td>
                    <td className="p-4 text-center">
                      {row.free ? <Check size={16} className="text-emerald-500 mx-auto" /> : row.free_text || "—"}
                    </td>
                    <td className="p-4 text-center bg-teal-50/20 dark:bg-teal-950/20 font-bold text-teal-600 dark:text-teal-400">
                      {row.pro ? <Check size={16} className="text-emerald-500 mx-auto" /> : "—"}
                    </td>
                    <td className="p-4 text-center">
                      {row.career ? <Check size={16} className="text-emerald-500 mx-auto" /> : "—"}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {typeof row.team === "boolean" && row.team ? <Check size={16} className="text-emerald-500 mx-auto" /> : row.team}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-8"
          style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
        >
          Pricing Questions & Answers
        </h2>

        <div className="space-y-3">
          {PRICING_FAQS.map((faq, idx) => {
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
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180 text-teal-600" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
