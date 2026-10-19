"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft, Mail, Server, Database } from "lucide-react";

export default function PrivacyPage() {
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
            <Shield size={13} className="text-teal-600 dark:text-teal-400" />
            Candidate Trust & Data Protection
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {lastUpdated} · Effective Date: October 19, 2026 · Operator: Ashwani Pandey
          </p>
        </div>

        {/* Executive Summary Card */}
        <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/20 mb-12 space-y-4">
          <h2 className="text-base font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Lock size={16} /> Key Privacy Commitments (Executive Summary)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <span><strong>Zero Unauthorized Sharing:</strong> We never sell, rent, or distribute your resume or personal details to recruiters or advertisers without your explicit opt-in.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <span><strong>256-bit TLS Encryption:</strong> All resume uploads and session traffic are encrypted in transit via TLS 1.3 with SHA-256 digital certificates.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <span><strong>No Foundation Model Training:</strong> Your uploaded resumes and employment claims are NOT used to train public generative AI models without consent.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <span><strong>Total Deletion Rights:</strong> You can delete any uploaded resume, analysis result, or entire account instantly with permanent database scrubbing.</span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              1. Information We Collect
            </h2>
            <p>
              SkillSync is an AI-powered resume evaluation platform designed to help job applicants optimize their resumes for Applicant Tracking Systems (ATS) and human hiring managers. When you use SkillSync, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Resume Documents & Content:</strong> PDF, DOCX, DOC, TXT, or RTF files you upload, including text content such as your name, contact details, work experience, education, certifications, and technical skills.
              </li>
              <li>
                <strong>Account & Profile Information:</strong> Name, work email address, role, company, and optional profile avatar (uploaded or selected preset) when you create an account or sign in.
              </li>
              <li>
                <strong>Target Job Descriptions (Optional):</strong> Any job postings or job descriptions you paste into our JD Adapter tool to calculate relevance scores.
              </li>
              <li>
                <strong>Technical Usage Data:</strong> Anonymized telemetry such as browser type, operating system, and performance metrics collected solely to maintain service reliability.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              2. How We Use and Process Your Information
            </h2>
            <p>Your resume data is processed strictly for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Generating your 30+ ATS formatting, keyword density, and grammar evaluations.</li>
              <li>Simulating recruiter 6-second skim heatmaps and hiring manager evidence graphs.</li>
              <li>Predicting interview questions based on the accomplishments and claims in your CV.</li>
              <li>Providing career path trajectory suggestions and skill gap recommendations.</li>
            </ul>
            <p>
              We do <strong>not</strong> use your resumes for targeted commercial advertising, nor do we build shadow profiles for recruitment headhunting unless you explicitly choose to publish a verified proof portfolio.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Server size={18} className="text-teal-600 dark:text-teal-400" />
              3. Security Architecture & Privacy Claims Explained
            </h2>
            <p>
              We believe in complete transparency regarding our security infrastructure:
            </p>
            <div className="space-y-3 pl-2 border-l-2 border-teal-500/30">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">“256-bit TLS Encrypted”</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  All HTTP traffic between your web browser and our servers is secured using modern TLS 1.3 protocols with 256-bit cryptographic ciphers, provided through enterprise edge networks. File data is encrypted during upload and download.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">“Confidential Processing & AI Provider Data Handling”</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  When you submit a resume for AI parsing, text extracts are transmitted via secure HTTPS APIs to licensed enterprise AI models (such as Anthropic Claude or OpenAI). We utilize enterprise API agreements that prohibit the provider from storing your resume text for training their foundation models.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">“Zero Unauthorized Data Sharing”</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Your resumes are completely private to your account. We never provide resumes to prospective employers, data brokers, or external recruiters without your direct consent or when you explicitly generate a public share link.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database size={18} className="text-teal-600 dark:text-teal-400" />
              4. Data Retention and Your Deletion Rights
            </h2>
            <p>
              You maintain 100% ownership of your resume documents and data at all times:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Immediate Document Deletion:</strong> You can delete any uploaded resume or past analysis score directly from your dashboard or settings. Once deleted, all associated parse records and files are permanently unlinked and erased.
              </li>
              <li>
                <strong>Account Purge:</strong> You may request full account deletion and complete data purge at any time by visiting your Settings page or emailing us directly.
              </li>
              <li>
                <strong>Demo Sandbox Sessions:</strong> Guest demo evaluations using sample candidate profiles do not store any personal documents and operate in transient client-side sandboxes.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              5. Third-Party Service Providers
            </h2>
            <p>We work with trusted infrastructure providers that adhere to rigorous data compliance:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Hosting & Edge Delivery:</strong> Vercel Inc. and cloud infrastructure providers.</li>
              <li><strong>Database Storage:</strong> Managed relational databases with encrypted volumes.</li>
              <li><strong>Authentication:</strong> Secure OAuth integrations (Google, LinkedIn, GitHub, Microsoft) that verify identity tokens without accessing personal contact books.</li>
              <li><strong>Billing:</strong> Stripe Inc. for payment processing. SkillSync never handles or stores credit card numbers on our servers.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              6. Contact Information & Data Protection Officer
            </h2>
            <p>
              If you have any questions, privacy concerns, or data deletion requests, you may contact the operator directly:
            </p>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">SkillSync — Created by Ashwani Pandey</p>
              <p className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                <Mail size={13} /> Contact: privacy@skillsync.ai or ashwani.pandey@gmail.com
              </p>
              <p className="text-gray-500 dark:text-gray-400">San Francisco, CA & Global Remote Support</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
