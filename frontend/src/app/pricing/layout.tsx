import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Simple, transparent pricing for job seekers and hiring teams. Try free with instant ATS scoring or unlock full multi-persona career intelligence.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
