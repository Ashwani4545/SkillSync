"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useTheme } from "@/components/providers/ThemeProvider";
import { AuthCard } from "@/components/auth/AuthModal";
import { ArrowLeft, Sparkles, Shield, CheckCircle2, Zap } from "lucide-react";

export default function SignInPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.15) 0%, transparent 60%), #0A0F1E"
          : "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.08) 0%, transparent 60%), #F8FAFC",
        color: isDark ? "#ffffff" : "#0F172A",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Back Link */}
        <div style={{ width: "100%", maxWidth: 980, marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              transition: "color 0.15s ease",
            }}
          >
            <ArrowLeft size={15} /> Back to SkillSync Home
          </Link>
        </div>

        {/* Two-Column Layout on Desktop, Centered on Mobile */}
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Column: Value Prop */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: isDark ? "rgba(15, 110, 86, 0.2)" : "#E1F5EE",
                border: isDark ? "1px solid rgba(29, 158, 117, 0.35)" : "1px solid #A3E0C8",
                color: "#1D9E75",
                fontSize: 12,
                fontWeight: 800,
                padding: "6px 16px",
                borderRadius: 30,
                letterSpacing: "0.06em",
                width: "fit-content",
              }}
            >
              <Zap size={13} /> 1-CLICK AUTHENTICATION
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 900,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "-0.03em",
                color: isDark ? "#FFFFFF" : "#0F172A",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Sign in to your SkillSync AI workspace
            </h1>

            <p
              style={{
                fontSize: 15,
                color: isDark ? "rgba(255, 255, 255, 0.65)" : "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Access multi-persona resume evaluations across ATS bots, recruiters, and hiring managers.
              Benchmark your background against the top 10% of applicants in your target role.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
              {[
                "1-Click sign-in with Google, LinkedIn, GitHub, or Microsoft",
                "Instant resume ATS parser & evidence graph scoring",
                "Live interview question predictor tailored to your experience",
                "100% confidential & 256-bit TLS encrypted session",
              ].map((text, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(29, 158, 117, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={14} color="#1D9E75" />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDark ? "rgba(255, 255, 255, 0.8)" : "#334155",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Direct Auth Card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AuthCard initialMode="signin" isModal={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
