import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Workspace",
  description:
    "Sign in to access your SkillSync candidate dashboard, ATS audit history, and interview predictions.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
