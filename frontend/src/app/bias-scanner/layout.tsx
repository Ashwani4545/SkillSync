import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bias & Exclusionary Language Scanner",
  description:
    "Audit your CV for unintentional demographic cues, gendered tone, and exclusionary jargon before submitting to global companies.",
};

export default function BiasScannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
