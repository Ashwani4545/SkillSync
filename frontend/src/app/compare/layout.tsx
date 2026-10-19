import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume A/B Head-to-Head Comparison",
  description:
    "Compare two versions of your resume side-by-side to see which wins higher ATS pass rates, keyword strength, and recruiter engagement.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
