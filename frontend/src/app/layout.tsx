import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "../components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeAI — AI-Powered Resume Analyzer",
  description:
    "Analyze your resume through the eyes of an ATS bot, a recruiter, and a hiring manager. Get AI suggestions, predict interview questions, benchmark against top candidates.",
  openGraph: {
    title: "ResumeAI",
    description: "AI-powered resume analyzer and career coach",
    type: "website",
  },
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
const isClerkKeyValid =
  Boolean(publishableKey) &&
  publishableKey.startsWith("pk_test_") &&
  !publishableKey.includes("ZXhhbXBsZQ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );

  if (isClerkKeyValid) {
    return <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>;
  }

  return content;
}
