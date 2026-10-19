import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SkillSync's commitment to candidate privacy: in-memory resume processing, zero AI training retention, 256-bit TLS encryption, and full data deletion rights.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
