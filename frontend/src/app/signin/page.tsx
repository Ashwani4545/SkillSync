"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useTheme } from "@/components/providers/ThemeProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, Shield, Zap, Sparkles, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark ? "#0A0F1E" : "#F8FAFC",
        color: isDark ? "#ffffff" : "#0F172A",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "60px 24px 100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 140px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 36, maxWidth: 540 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: isDark ? "rgba(15, 110, 86, 0.15)" : "#E1F5EE",
              border: isDark ? "1px solid rgba(29, 158, 117, 0.3)" : "1px solid #A3E0C8",
              color: "#1D9E75",
              fontSize: 12,
              fontWeight: 800,
              padding: "6px 18px",
              borderRadius: 30,
              letterSpacing: "0.06em",
              marginBottom: 16,
            }}
          >
            <Zap size={13} /> SECURE RESUME INTELLIGENCE AUTH
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.03em",
              marginBottom: 12,
              color: isDark ? "#FFFFFF" : "#0F172A",
            }}
          >
            Sign in to SkillSync
          </h1>

          <p
            style={{
              fontSize: 16,
              color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
              lineHeight: 1.6,
            }}
          >
            Continue with Google, LinkedIn, GitHub, Microsoft, or your email to access your AI resume evaluations and recruiter reports.
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
              color: "#ffffff",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(15, 110, 86, 0.35)",
            }}
          >
            Open Sign In Options <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}
