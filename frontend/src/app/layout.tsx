import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "../components/providers/QueryProvider";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { isClerkConfigured } from "@/lib/clerk";
import { ClerkTokenBridge } from "@/components/providers/ClerkTokenBridge";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://skillsync.ai"),
  title: {
    default: "SkillSync — Multi-Persona AI Resume Analyzer & Career Intelligence",
    template: "%s | SkillSync",
  },
  description:
    "Analyze your resume through the eyes of an ATS bot, a recruiter, and a hiring manager. Get verified skill evidence, interview question predictions, and job-tailored rewrites.",
  keywords: [
    "ATS resume checker",
    "resume analyzer",
    "AI resume score",
    "interview question predictor",
    "job description match",
    "recruiter review",
    "career roadmap",
  ],
  authors: [{ name: "Ashwani Pandey" }],
  creator: "Ashwani Pandey",
  openGraph: {
    title: "SkillSync — Multi-Persona AI Resume Analyzer",
    description:
      "Pass ATS screens and impress hiring managers with AI-powered resume audits, skill evidence graphs, and tailored bullet rewrites.",
    siteName: "SkillSync",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSync — Multi-Persona AI Resume Analyzer",
    description:
      "Pass ATS screens and impress hiring managers with AI-powered resume audits, skill evidence graphs, and tailored bullet rewrites.",
    creator: "@ashwanipandey",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('skillsync-theme');
                  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );

  if (isClerkConfigured()) {
    return (
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <ClerkTokenBridge />
        {content}
      </ClerkProvider>
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be configured in production.");
  }

  return content;
}
