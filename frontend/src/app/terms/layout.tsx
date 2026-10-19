import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review SkillSync's terms of service, intellectual property ownership (you retain 100% rights to your resume), and fair use guidelines.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
