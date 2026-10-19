import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Repository Proof & Code Verification",
  description:
    "Validate your claimed skills against real GitHub commits, production pull requests, and repository evidence graphs.",
};

export default function GithubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
