import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS Resume Checker & Score Audit",
  description:
    "Check your resume against 30+ ATS schema rules, recruiter skim habits, and hiring manager benchmarks with actionable AI improvements.",
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
