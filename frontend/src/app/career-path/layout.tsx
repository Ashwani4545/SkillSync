import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Trajectory & Promotion Roadmap",
  description:
    "Map your verified career progression, identify required skill milestones, and estimate promotion timelines for senior engineering roles.",
};

export default function CareerPathLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
