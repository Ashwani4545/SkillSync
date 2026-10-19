"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText, CheckCircle2, ArrowLeft, ShieldAlert, Award, AlertCircle } from "lucide-react";

export default function TermsPage() {
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
            <FileText size={13} className="text-teal-600 dark:text-teal-400" />
            Terms of Service & Usage Agreement
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {lastUpdated} · Effective Date: October 19, 2026 · Operator: Ashwani Pandey
          </p>
        </div>

        {/* Overview Box */}
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-12 text-xs text-gray-700 dark:text-gray-300 space-y-2">
          <p className="font-bold text-sm text-gray-900 dark:text-white">
            Welcome to SkillSync!
          </p>
          <p>
            By accessing or using SkillSync (the “Service”), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service. The Service is created, operated, and maintained by Ashwani Pandey.
          </p>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              1. Permitted Use of the Service
            </h2>
            <p>
              SkillSync provides algorithmic evaluations, ATS compatibility scoring, recruiter attention heatmaps, and interview question predictions to assist job seekers in evaluating their professional documents.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may upload resumes that you own or have explicit authorization to audit.</li>
              <li>You agree not to upload malicious scripts, viruses, or documents containing illegal or abusive materials.</li>
              <li>You agree not to reverse engineer or extract the underlying proprietary scoring algorithms, prompt engines, or benchmarks through automated scrapers without written consent.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              2. Intellectual Property & Document Ownership
            </h2>
            <p>
              <strong>Your Documents:</strong> You retain complete, unencumbered ownership of all resumes, work histories, job descriptions, and personal data you submit to SkillSync. SkillSync claims zero copyright or proprietary interest in your resume content.
            </p>
            <p>
              <strong>Our Platform:</strong> The SkillSync software, visual designs, Reviewer Lens simulator, trademark, logos, and proprietary scoring models are the intellectual property of Ashwani Pandey.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              3. Disclaimer of Hiring Guarantees & AI Advisory Notice
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} /> Advisory Tool, Not An Employment Guarantee
              </p>
              <p>
                SkillSync evaluations, ATS scores, recruiter gaze simulations, and predicted interview questions are algorithmic estimations designed for informational and educational preparation only. Hiring decisions are made solely by prospective employers. SkillSync does not guarantee interview invitations, job offers, or salary outcomes.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              4. Subscription Tiers & Billing
            </h2>
            <p>
              SkillSync offers both free and premium subscription plans (Pro, Career Accelerator, and Team):
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Free Tier:</strong> Includes 3 free resume scans per month, universal ATS scoring, and sample candidate evaluations.</li>
              <li><strong>Paid Subscriptions:</strong> Processed securely via Stripe. Subscriptions renew automatically on a monthly or annual basis unless cancelled prior to the billing date through the Settings billing portal.</li>
              <li><strong>Refunds:</strong> If you are unsatisfied with our AI suggestions within 7 days of upgrading, contact us for a prompt refund.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Ashwani Pandey or SkillSync contributors be liable for any indirect, punitive, incidental, special, or consequential damages resulting from the use or inability to use the Service.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              6. Governing Law & Modifications
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles. We reserve the right to modify these Terms at any time with updated timestamps displayed on this page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
