import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Interview Question Predictor",
  description:
    "Predict tough technical, behavioral, and challenge questions triggered directly by unquantified or bold claims on your resume.",
};

export default function InterviewPrepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
