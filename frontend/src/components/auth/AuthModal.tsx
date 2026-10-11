"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onSuccess?: (user: { name: string; email: string; provider: string }) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  onSuccess,
}: AuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [activeTab, setActiveTab] = useState<"social" | "email">("social");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Email state
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sub-dialog for interactive OAuth account selection (e.g. Google Account Chooser)
  const [oauthDialog, setOauthDialog] = useState<null | {
    provider: "google" | "linkedin" | "github" | "microsoft";
    title: string;
  }>(null);
  const [customOauthEmail, setCustomOauthEmail] = useState("");
  const [customOauthName, setCustomOauthName] = useState("");

  if (!isOpen) return null;

  const handleCompleteLogin = (name: string, email: string, provider: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_authenticated", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_provider", provider);
      localStorage.setItem("user_plan", "PRO PLAN");
      document.cookie = "user_authenticated=true; path=/; max-age=86400";
    }

    if (onSuccess) {
      onSuccess({ name, email, provider });
    }

    onClose();
    window.location.href = "/dashboard";
  };

  const handleProviderClick = (provider: "google" | "linkedin" | "github" | "microsoft") => {
    setErrorMsg("");
    const providerTitles = {
      google: "Google Account",
      linkedin: "LinkedIn Account",
      github: "GitHub Account",
      microsoft: "Microsoft Account",
    };

    setOauthDialog({
      provider,
      title: providerTitles[provider],
    });
  };

  const handleConfirmOAuth = (selectedName: string, selectedEmail: string) => {
    if (!oauthDialog) return;
    const provider = oauthDialog.provider;
    setLoadingProvider(provider);

    setTimeout(() => {
      handleCompleteLogin(selectedName, selectedEmail, provider);
    }, 400);
  };

  const handleQuickDemo = () => {
    setLoadingProvider("demo");
    setTimeout(() => {
      handleCompleteLogin("Ashwani Pandey", "ashwani.pandey@gmail.com", "demo");
    }, 300);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!emailInput || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!passwordInput || passwordInput.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoadingProvider("email");
    const name = nameInput.trim() || emailInput.split("@")[0] || "User";

    setTimeout(() => {
      handleCompleteLogin(name, emailInput.trim(), "email");
    }, 450);
  };

  return (
    <div
      id="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isDark ? "rgba(3, 7, 18, 0.75)" : "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        animation: "fadeUp 0.2s ease",
      }}
    >
      <div
        id="auth-modal-card"
        style={{
          width: "100%",
          maxWidth: 460,
          background: isDark ? "#0F172A" : "#FFFFFF",
          borderRadius: 24,
          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #E2E8F0",
          boxShadow: isDark
            ? "0 25px 60px -15px rgba(0,0,0,0.7), 0 0 30px rgba(29, 158, 117, 0.1)"
            : "0 25px 60px -15px rgba(15, 23, 42, 0.2)",
          color: isDark ? "#FFFFFF" : "#0F172A",
          overflow: "hidden",
          position: "relative",
          transition: "all 0.2s ease",
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            height: 4,
            width: "100%",
            background: "linear-gradient(90deg, #1D9E75 0%, #38BDF8 50%, #8B5CF6 100%)",
          }}
        />

        {/* Modal Header */}
        <div style={{ padding: "26px 28px 16px", position: "relative" }}>
          <button
            onClick={onClose}
            id="auth-modal-close-btn"
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: 22,
              right: 22,
              background: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "#64748B",
              transition: "all 0.15s ease",
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(15, 110, 86, 0.35)",
              }}
            >
              S
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#1D9E75",
                  textTransform: "uppercase",
                }}
              >
                SkillSync AI
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: "'Syne', sans-serif",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                {mode === "signin" ? "Sign in to your account" : "Create your account"}
              </h2>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
              lineHeight: 1.5,
            }}
          >
            {mode === "signin"
              ? "Access multi-persona resume scoring, interview prediction, and career benchmarking."
              : "Get started free with 3 resume audits per month. No credit card required."}
          </p>
        </div>

        {/* Tab Switcher: Fast Social Sign In vs Email Form */}
        <div style={{ padding: "0 28px 16px" }}>
          <div
            style={{
              display: "flex",
              background: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
              padding: 4,
              borderRadius: 12,
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background:
                  activeTab === "social"
                    ? isDark
                      ? "#1E293B"
                      : "#FFFFFF"
                    : "transparent",
                color:
                  activeTab === "social"
                    ? isDark
                      ? "#FFFFFF"
                      : "#0F172A"
                    : isDark
                    ? "rgba(255, 255, 255, 0.5)"
                    : "#64748B",
                boxShadow:
                  activeTab === "social"
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 6px rgba(0,0,0,0.06)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Social / OAuth
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background:
                  activeTab === "email"
                    ? isDark
                      ? "#1E293B"
                      : "#FFFFFF"
                    : "transparent",
                color:
                  activeTab === "email"
                    ? isDark
                      ? "#FFFFFF"
                      : "#0F172A"
                    : isDark
                    ? "rgba(255, 255, 255, 0.5)"
                    : "#64748B",
                boxShadow:
                  activeTab === "email"
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 6px rgba(0,0,0,0.06)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Email & Password
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "0 28px 26px" }}>
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#EF4444",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "social" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {/* 1. Sign in with Google (Featured & Recommended) */}
              <button
                type="button"
                id="sign-in-with-google-btn"
                onClick={() => handleProviderClick("google")}
                disabled={loadingProvider !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4285F4";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(66, 133, 244, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "#CBD5E1";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Official Google SVG Logo */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: "rgba(66, 133, 244, 0.14)",
                    color: "#3B82F6",
                    border: "1px solid rgba(66, 133, 244, 0.25)",
                  }}
                >
                  Popular
                </span>
              </button>

              {/* 2. Sign in with LinkedIn (Crucial for Career/Resume platform) */}
              <button
                type="button"
                id="sign-in-with-linkedin-btn"
                onClick={() => handleProviderClick("linkedin")}
                disabled={loadingProvider !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0A66C2";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(10, 102, 194, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "#CBD5E1";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Official LinkedIn SVG Logo */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>Continue with LinkedIn</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: "rgba(10, 102, 194, 0.14)",
                    color: "#0A66C2",
                    border: "1px solid rgba(10, 102, 194, 0.25)",
                  }}
                >
                  Career Sync
                </span>
              </button>

              {/* 3. Sign in with GitHub */}
              <button
                type="button"
                id="sign-in-with-github-btn"
                onClick={() => handleProviderClick("github")}
                disabled={loadingProvider !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#0F172A";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "#CBD5E1";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Official GitHub SVG Logo */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Continue with GitHub</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                    color: isDark ? "#CBD5E1" : "#475569",
                  }}
                >
                  Developer
                </span>
              </button>

              {/* 4. Sign in with Microsoft */}
              <button
                type="button"
                id="sign-in-with-microsoft-btn"
                onClick={() => handleProviderClick("microsoft")}
                disabled={loadingProvider !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#00A4EF";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 164, 239, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "#CBD5E1";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Official Microsoft SVG 4-color Logo */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                  </svg>
                  <span>Continue with Microsoft</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: "rgba(0, 164, 239, 0.12)",
                    color: "#0284C7",
                    border: "1px solid rgba(0, 164, 239, 0.25)",
                  }}
                >
                  Work / School
                </span>
              </button>

              {/* Fast 1-Click Instant Preview Option */}
              <div
                style={{
                  marginTop: 10,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: isDark ? "rgba(29, 158, 117, 0.1)" : "#E1F5EE",
                  border: isDark ? "1px solid rgba(29, 158, 117, 0.25)" : "1px solid #A3E0C8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={14} /> Quick Demo Access
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "rgba(255, 255, 255, 0.6)" : "#064035", marginTop: 2 }}>
                    Instant evaluation with sample data
                  </div>
                </div>
                <button
                  type="button"
                  id="instant-demo-access-btn"
                  onClick={handleQuickDemo}
                  disabled={loadingProvider !== null}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(15, 110, 86, 0.3)",
                  }}
                >
                  {loadingProvider === "demo" ? "Entering..." : "1-Click Sign In"}
                </button>
              </div>
            </div>
          ) : (
            /* Email & Password Form Tab */
            <form onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569",
                      marginBottom: 6,
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Ashwani Pandey"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                      background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color={isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8"}
                    style={{ position: "absolute", left: 14, top: 14 }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 40px",
                      borderRadius: 12,
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                      background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569",
                    }}
                  >
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your email address.")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1D9E75",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color={isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8"}
                    style={{ position: "absolute", left: 14, top: 14 }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 40px",
                      borderRadius: 12,
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                      background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 13,
                      background: "none",
                      border: "none",
                      color: isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="auth-email-submit-button"
                disabled={loadingProvider !== null}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(15, 110, 86, 0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                {loadingProvider === "email" ? (
                  "Authenticating..."
                ) : (
                  <>
                    {mode === "signin" ? "Sign in with Email" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Mode footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 13,
              color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
            }}
          >
            {mode === "signin" ? (
              <>
                New to SkillSync?{" "}
                <button
                  type="button"
                  id="switch-to-signup-btn"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1D9E75",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Create free account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  id="switch-to-signin-btn"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1D9E75",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>

        {/* Security / Privacy disclaimer footer */}
        <div
          style={{
            padding: "12px 24px",
            background: isDark ? "rgba(0, 0, 0, 0.25)" : "#F8FAFC",
            borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 11,
            color: isDark ? "rgba(255, 255, 255, 0.45)" : "#94A3B8",
          }}
        >
          <Shield size={13} color="#1D9E75" />
          <span>256-bit TLS encrypted &middot; Zero unauthorized data sharing</span>
        </div>
      </div>

      {/* ── Sub-dialog: Interactive OAuth Account Chooser ── */}
      {oauthDialog && (
        <div
          id="oauth-account-chooser-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeUp 0.15s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: isDark ? "#131C31" : "#FFFFFF",
              borderRadius: 20,
              padding: "24px 24px 20px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #CBD5E1",
              color: isDark ? "#FFFFFF" : "#0F172A",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {oauthDialog.provider === "google" && (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                {oauthDialog.provider === "linkedin" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                )}
                {oauthDialog.provider === "github" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                {oauthDialog.provider === "microsoft" && (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                  </svg>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Choose an account</h3>
                  <p style={{ margin: 0, fontSize: 12, color: isDark ? "rgba(255,255,255,0.6)" : "#64748B" }}>
                    to continue to SkillSync
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOauthDialog(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isDark ? "rgba(255,255,255,0.6)" : "#64748B",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Default Profile */}
            <div
              onClick={() => handleConfirmOAuth("Ashwani Pandey", "ashwani.pandey@gmail.com")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #E2E8F0",
                background: isDark ? "rgba(255, 255, 255, 0.05)" : "#F8FAFC",
                cursor: "pointer",
                marginBottom: 14,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1D9E75";
                e.currentTarget.style.background = isDark ? "rgba(29, 158, 117, 0.12)" : "#E1F5EE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0";
                e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.05)" : "#F8FAFC";
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                A
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Ashwani Pandey</div>
                <div style={{ fontSize: 12, color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B" }}>
                  ashwani.pandey@gmail.com
                </div>
              </div>
              <CheckCircle2 size={16} color="#1D9E75" />
            </div>

            {/* Custom Account Option */}
            <div
              style={{
                borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
                paddingTop: 14,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569" }}>
                Or use another {oauthDialog.title}:
              </div>
              <input
                type="text"
                placeholder="Full Name (e.g. Sarah Connor)"
                value={customOauthName}
                onChange={(e) => setCustomOauthName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 8,
                }}
              />
              <input
                type="email"
                placeholder={`Email (e.g. user@${oauthDialog.provider === "google" ? "gmail.com" : "company.com"})`}
                value={customOauthEmail}
                onChange={(e) => setCustomOauthEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 14,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const finalName = customOauthName.trim() || "User";
                  const finalEmail =
                    customOauthEmail.trim() ||
                    `user@${oauthDialog.provider === "google" ? "gmail.com" : "company.com"}`;
                  handleConfirmOAuth(finalName, finalEmail);
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Sign in with this {oauthDialog.title}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
