import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruiter Command Center",
  description:
    "Batch upload resumes, screen candidates against role criteria, and rank applicants by verified skill evidence.",
};

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
