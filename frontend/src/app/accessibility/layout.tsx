import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "SkillSync's digital accessibility standards: WCAG 2.1 Level AA conformance, full keyboard navigability, screen-reader semantic landmarks, and contrast ratios.",
};

export default function AccessibilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
