"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ArrowLeft, Eye, Keyboard, Sparkles, HeartHandshake, Mail } from "lucide-react";

export default function AccessibilityPage() {
  const lastUpdated = "October 19, 2026";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1E] text-gray-900 dark:text-white transition-colors duration-200">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <ArrowLeft size={14} /> Back to SkillSync Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="border-b border-gray-200 dark:border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-4">
            <HeartHandshake size={13} className="text-teal-600 dark:text-teal-400" />
            Inclusive Design & Equal Access
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Accessibility Statement
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {lastUpdated} · Standard: WCAG 2.1 Level AA · Maintained by: Ashwani Pandey
          </p>
        </div>

        {/* Commitment Box */}
        <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/20 mb-12 space-y-3">
          <h2 className="text-base font-bold text-teal-800 dark:text-teal-300">
            Our Commitment to Digital Inclusion
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            SkillSync is committed to ensuring digital accessibility for people of all abilities, including job seekers who use assistive technologies such as screen readers, voice dictation software, screen magnifiers, and keyboard navigation. We continually improve the user experience for everyone and apply relevant accessibility standards.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Keyboard size={16} className="text-teal-600 dark:text-teal-400" />
              <span>Full Keyboard Operability</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              All interactive components—including navigation menus, file dropzones, score breakdowns, preset avatar pickers, and modals—are fully navigable using standard Tab, Shift+Tab, Enter, and Escape keys.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Eye size={16} className="text-teal-600 dark:text-teal-400" />
              <span>High Contrast & Theme Modes</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              SkillSync provides both a curated high-contrast Dark Mode and clean Light Mode. Color combinations are tested to meet or exceed WCAG 2.1 AA 4.5:1 contrast ratios for normal text.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
              <span>Semantic HTML & ARIA Landmarks</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Pages use proper landmark elements (`&lt;main&gt;`, `&lt;nav&gt;`, `&lt;header&gt;`, `&lt;footer&gt;`), hierarchical headings (h1 to h6), explicit form labels, and live region announcements for scan progress.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
              <span>Respects Reduced Motion</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We respect your operating system’s `prefers-reduced-motion` settings. Micro-animations, Three.js 3D hero rotations, and pulsating indicators gracefully reduce motion for vestibular safety.
            </p>
          </div>
        </div>

        {/* Formal Specifications & Feedback */}
        <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Conformance Status
            </h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. SkillSync is partially conformant with WCAG 2.1 level AA. We continuously audit user flows and third-party libraries to maintain accessibility compliance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Feedback & Contact
            </h2>
            <p>
              We welcome your feedback on the accessibility of SkillSync. If you encounter accessibility barriers or have difficulty using any feature, please let us know:
            </p>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">SkillSync Accessibility Support</p>
              <p className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                <Mail size={13} /> Email: accessibility@skillsync.ai or ashwani.pandey@gmail.com
              </p>
              <p className="text-gray-500 dark:text-gray-400">We aim to respond to accessibility inquiries within 48 business hours.</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
