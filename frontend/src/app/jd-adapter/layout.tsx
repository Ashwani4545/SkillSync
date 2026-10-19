import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Description Adapter & Tailored Bullets",
  description:
    "Match your resume to any job description in seconds. Uncover missing requirements and generate truthful, high-impact bullet adaptations.",
};

export default function JdAdapterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
