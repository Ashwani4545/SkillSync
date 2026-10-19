import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description:
    "Manage your SkillSync account preferences, API integrations, notification settings, and privacy options.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
