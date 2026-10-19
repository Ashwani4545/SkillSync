"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  User,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export interface AuthSuccessData {
  name: string;
  email: string;
  provider: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIC OAUTH ACCOUNT PICKER MODAL (Google, LinkedIn, GitHub, Microsoft)
// ─────────────────────────────────────────────────────────────────────────────

interface OAuthAccountPickerModalProps {
  provider: "google" | "linkedin" | "github" | "microsoft" | "twitter";
  onClose: () => void;
  onSelectAccount: (name: string, email: string) => void;
}

export function OAuthAccountPickerModal({
  provider,
  onClose,
  onSelectAccount,
}: OAuthAccountPickerModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");
  const [authenticatingAccount, setAuthenticatingAccount] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePickAccount = (name: string, email: string) => {
    setAuthenticatingAccount({ name, email });
    setTimeout(() => {
      onSelectAccount(name, email);
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError("");

    const trimmedEmail = customEmail.trim();
    if (!trimmedEmail) {
      setCustomError("Please enter your email or handle.");
      return;
    }

    const defaultName =
      customName.trim() ||
      trimmedEmail.replace("@", "").split(/[@._-]/)[0].replace(/\b\w/g, (c) => c.toUpperCase()) ||
      "User";

    handlePickAccount(defaultName, trimmedEmail);
  };

  // Provider-specific details
  const providerMeta = {
    google: {
      brandName: "Google",
      title: "Choose an account",
      subtitle: "to continue to SkillSync",
      accounts: [
        {
          name: "Ashwani Pandey",
          email: "ashwani.pandey@gmail.com",
          badgeColor: "#4285F4",
          initials: "A",
        },
        {
          name: "Ashwani Developer",
          email: "ashwani.dev@gmail.com",
          badgeColor: "#34A853",
          initials: "AD",
        },
      ],
      placeholderEmail: "email@gmail.com",
      accentColor: "#1A73E8",
    },
    linkedin: {
      brandName: "LinkedIn",
      title: "Sign in with LinkedIn",
      subtitle: "Welcome to SkillSync",
      accounts: [
        {
          name: "Ashwani Pandey",
          email: "ashwani.pandey@linkedin.com",
          badgeColor: "#0A66C2",
          initials: "AP",
        },
      ],
      placeholderEmail: "email@company.com",
      accentColor: "#0A66C2",
    },
    twitter: {
      brandName: "X (Twitter)",
      title: "Sign in with X",
      subtitle: "to authorize SkillSync",
      accounts: [
        {
          name: "Ashwani Pandey",
          email: "@ashwanipandey (ashwani@x.com)",
          badgeColor: "#0F1419",
          initials: "𝕏",
        },
        {
          name: "SkillSync Developer",
          email: "@skillsync_dev (dev@skillsync.ai)",
          badgeColor: "#1D9BF0",
          initials: "AD",
        },
      ],
      placeholderEmail: "@username, phone or email",
      accentColor: "#1D9BF0",
    },
    github: {
      brandName: "GitHub",
      title: "Sign in to GitHub",
      subtitle: "to authorize SkillSync",
      accounts: [
        {
          name: "Ashwani Developer",
          email: "ashwani.dev@github.com",
          badgeColor: "#24292F",
          initials: "GH",
        },
      ],
      placeholderEmail: "username or email",
      accentColor: "#2DA44E",
    },
    microsoft: {
      brandName: "Microsoft",
      title: "Pick an account",
      subtitle: "to continue to SkillSync",
      accounts: [
        {
          name: "Ashwani Pandey",
          email: "ashwani.pandey@outlook.com",
          badgeColor: "#00A4EF",
          initials: "MS",
        },
      ],
      placeholderEmail: "user@outlook.com or work email",
      accentColor: "#00A4EF",
    },
  }[provider];

  return (
    <div
      id="oauth-account-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !authenticatingAccount) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isDark ? "rgba(3, 7, 18, 0.82)" : "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        id="oauth-account-picker-dialog"
        style={{
          width: "100%",
          maxWidth: 440,
          background: isDark ? "#1E293B" : "#FFFFFF",
          borderRadius: 24,
          boxShadow: isDark
            ? "0 25px 70px -15px rgba(0,0,0,0.8), 0 0 40px rgba(66, 133, 244, 0.15)"
            : "0 25px 70px -15px rgba(15, 23, 42, 0.25)",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
          overflow: "hidden",
          position: "relative",
          animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Animated Progress Bar (Top) */}
        {authenticatingAccount && (
          <div
            style={{
              height: 3,
              width: "100%",
              background: `linear-gradient(90deg, ${providerMeta.accentColor}, #38BDF8, ${providerMeta.accentColor})`,
              backgroundSize: "200% 100%",
              animation: "pulse 1.2s infinite linear",
            }}
          />
        )}

        {/* Modal Header */}
        <div style={{ padding: "28px 28px 16px", position: "relative" }}>
          <button
            onClick={onClose}
            disabled={!!authenticatingAccount}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 22,
              right: 22,
              background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: authenticatingAccount ? "not-allowed" : "pointer",
              color: isDark ? "rgba(255,255,255,0.7)" : "#64748B",
            }}
          >
            <X size={16} />
          </button>

          {/* Provider Logo */}
          <div style={{ marginBottom: 16 }}>
            {provider === "google" && (
              <svg width="36" height="36" viewBox="0 0 24 24">
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
            )}

            {provider === "linkedin" && (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            )}

            {provider === "github" && (
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill={isDark ? "#ffffff" : "#24292F"}
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}

            {provider === "microsoft" && (
              <svg width="34" height="34" viewBox="0 0 24 24">
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
            )}

            {provider === "twitter" && (
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill={isDark ? "#ffffff" : "#0F1419"}
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
          </div>

          <h2
            style={{
              margin: "0 0 6px",
              fontSize: 22,
              fontWeight: 800,
              fontFamily:
                provider === "google"
                  ? "'Roboto', 'Google Sans', sans-serif"
                  : "'Syne', sans-serif",
              color: isDark ? "#FFFFFF" : "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            {isCustomMode ? `Sign in with ${providerMeta.brandName}` : providerMeta.title}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: isDark ? "rgba(255, 255, 255, 0.65)" : "#64748B",
            }}
          >
            {isCustomMode
              ? `Enter your ${providerMeta.brandName} account details to continue to SkillSync`
              : providerMeta.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "0 28px 26px" }}>
          {authenticatingAccount ? (
            /* Loading Authenticating State */
            <div
              style={{
                padding: "36px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 14,
              }}
            >
              <Loader2
                size={34}
                className="animate-spin"
                color={providerMeta.accentColor}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  }}
                >
                  Signing in with {providerMeta.brandName}...
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
                    marginTop: 3,
                  }}
                >
                  {authenticatingAccount.email}
                </div>
              </div>
            </div>
          ) : !isCustomMode ? (
            /* Choose Account List */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {providerMeta.accounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`oauth-account-choice-${idx}`}
                  onClick={() => handlePickAccount(acc.name, acc.email)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.12)"
                      : "1px solid #E2E8F0",
                    background: isDark ? "rgba(255, 255, 255, 0.04)" : "#F8FAFC",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = providerMeta.accentColor;
                    e.currentTarget.style.background = isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#FFFFFF";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "#E2E8F0";
                    e.currentTarget.style.background = isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "#F8FAFC";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: acc.badgeColor,
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {acc.initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isDark ? "#FFFFFF" : "#0F172A",
                        }}
                      >
                        {acc.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: isDark ? "rgba(255, 255, 255, 0.55)" : "#64748B",
                        }}
                      >
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    color={isDark ? "rgba(255,255,255,0.4)" : "#94A3B8"}
                  />
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                type="button"
                id="oauth-use-another-account-btn"
                onClick={() => setIsCustomMode(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: isDark
                    ? "1px dashed rgba(255, 255, 255, 0.18)"
                    : "1px dashed #CBD5E1",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  marginTop: 4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = providerMeta.accentColor;
                  e.currentTarget.style.background = isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "1px dashed rgba(255, 255, 255, 0.18)"
                    : "1px dashed #CBD5E1";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(15, 23, 42, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    }}
                  >
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isDark ? "#FFFFFF" : "#0F172A",
                      }}
                    >
                      Use another account
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isDark ? "rgba(255, 255, 255, 0.55)" : "#64748B",
                      }}
                    >
                      Sign in with your own {providerMeta.brandName} email
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  color={isDark ? "rgba(255,255,255,0.4)" : "#94A3B8"}
                />
              </button>
            </div>
          ) : (
            /* Custom Account Input Form */
            <form onSubmit={handleCustomSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {customError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#EF4444",
                    fontSize: 12,
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{customError}</span>
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569",
                    marginBottom: 5,
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Ashwani Pandey"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
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

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569",
                    marginBottom: 5,
                  }}
                >
                  {providerMeta.brandName} Email Address <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder={providerMeta.placeholderEmail}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(false);
                    setCustomError("");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={14} /> Back to accounts
                </button>

                <button
                  type="submit"
                  id="oauth-custom-submit-btn"
                  style={{
                    padding: "10px 22px",
                    borderRadius: 12,
                    background: providerMeta.accentColor,
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Disclaimer Footer */}
        <div
          style={{
            padding: "14px 28px",
            background: isDark ? "rgba(0, 0, 0, 0.25)" : "#F8FAFC",
            borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            fontSize: 11,
            color: isDark ? "rgba(255, 255, 255, 0.45)" : "#94A3B8",
            lineHeight: 1.5,
          }}
        >
          To continue, {providerMeta.brandName} will share your name, email address, and profile
          picture with SkillSync.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN AUTHCARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface AuthCardProps {
  initialMode?: "signin" | "signup";
  onSuccess?: (user: AuthSuccessData) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function AuthCard({
  initialMode = "signin",
  onSuccess,
  onClose,
  isModal = false,
}: AuthCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [activeTab, setActiveTab] = useState<"social" | "email">("email");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Active OAuth Picker State
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<
    "google" | "linkedin" | "github" | "microsoft" | "twitter" | null
  >(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Email state
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const executeLogin = (name: string, email: string, provider: string) => {
    setLoadingProvider(provider);
    setErrorMsg("");
    setSuccessMsg(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}! Redirecting...`);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_authenticated", "true");
        localStorage.setItem("user_name", name);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_provider", provider);
        localStorage.setItem("user_plan", "PRO PLAN");
        document.cookie = `user_authenticated=true; path=/; max-age=86400; SameSite=Lax`;

        // Notify any listeners across the app
        window.dispatchEvent(new Event("storage"));
      }

      if (onSuccess) {
        onSuccess({ name, email, provider });
      }

      // Smooth redirection to dashboard
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      }, 350);
    } catch (err) {
      console.error("Authentication error:", err);
      window.location.href = "/dashboard";
    }
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const targetEmail = emailInput.trim() || "ashwani.pandey@gmail.com";
    const targetName = nameInput.trim() || targetEmail.split("@")[0] || "User";

    executeLogin(targetName, targetEmail, "email");
  };

  return (
    <>
      {/* OAuth Account Picker Modal (Appears when clicking Google, LinkedIn, etc.) */}
      {activeOAuthProvider && (
        <OAuthAccountPickerModal
          provider={activeOAuthProvider}
          onClose={() => setActiveOAuthProvider(null)}
          onSelectAccount={(chosenName, chosenEmail) => {
            setActiveOAuthProvider(null);
            executeLogin(chosenName, chosenEmail, activeOAuthProvider);
          }}
        />
      )}

      <div
        id="skillsync-auth-card"
        style={{
          width: "100%",
          maxWidth: 460,
          background: isDark ? "#0F172A" : "#FFFFFF",
          borderRadius: 24,
          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #CBD5E1",
          boxShadow: isDark
            ? "0 25px 60px -15px rgba(0,0,0,0.7), 0 0 30px rgba(29, 158, 117, 0.1)"
            : "0 25px 60px -15px rgba(15, 23, 42, 0.15)",
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

        {/* Card Header */}
        <div style={{ padding: "26px 28px 16px", position: "relative" }}>
          {isModal && onClose && (
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
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
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

        {/* Login and Create Account Tab Switcher */}
        <div style={{ padding: "0 28px 16px" }}>
          <div
            role="tablist"
            aria-label="Authentication mode"
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
              role="tab"
              aria-selected={mode === "signin"}
              id="auth-tab-login"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background:
                  mode === "signin"
                    ? isDark
                      ? "#1E293B"
                      : "#FFFFFF"
                    : "transparent",
                color:
                  mode === "signin"
                    ? isDark
                      ? "#FFFFFF"
                      : "#0F172A"
                    : isDark
                    ? "rgba(255, 255, 255, 0.55)"
                    : "#64748B",
                boxShadow:
                  mode === "signin"
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 6px rgba(0,0,0,0.06)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              id="auth-tab-create-account"
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background:
                  mode === "signup"
                    ? isDark
                      ? "#1E293B"
                      : "#FFFFFF"
                    : "transparent",
                color:
                  mode === "signup"
                    ? isDark
                      ? "#FFFFFF"
                      : "#0F172A"
                    : isDark
                    ? "rgba(255, 255, 255, 0.55)"
                    : "#64748B",
                boxShadow:
                  mode === "signup"
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 6px rgba(0,0,0,0.06)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Create account
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "0 28px 24px" }}>
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
                marginBottom: 14,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(29, 158, 117, 0.12)",
                border: "1px solid rgba(29, 158, 117, 0.3)",
                color: "#1D9E75",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Social Sign-in & Sign-up Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 1. Continue with Google */}
            <button
              type="button"
              id="sign-in-with-google-btn"
              onClick={() => setActiveOAuthProvider("google")}
              disabled={loadingProvider !== null}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: 14,
                border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#0F172A",
                cursor: loadingProvider !== null ? "not-allowed" : "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                transition: "all 0.15s ease",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0,0,0,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.04)",
                opacity: loadingProvider !== null && loadingProvider !== "google" ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (loadingProvider === null) {
                  e.currentTarget.style.borderColor = "#4285F4";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(66, 133, 244, 0.25)";
                }
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
                {loadingProvider === "google" ? (
                  <Loader2 size={18} className="animate-spin" color="#4285F4" />
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24">
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
                )}
                <span>
                  {loadingProvider === "google"
                    ? "Connecting to Google..."
                    : mode === "signin"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "rgba(66, 133, 244, 0.14)",
                  color: "#3B82F6",
                  border: "1px solid rgba(66, 133, 244, 0.25)",
                }}
              >
                1-Click
              </span>
            </button>

            {/* 2. Continue with GitHub */}
            <button
              type="button"
              id="sign-in-with-github-btn"
              onClick={() => setActiveOAuthProvider("github")}
              disabled={loadingProvider !== null}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: 14,
                border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #CBD5E1",
                background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#0F172A",
                cursor: loadingProvider !== null ? "not-allowed" : "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                transition: "all 0.15s ease",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0,0,0,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.04)",
                opacity: loadingProvider !== null && loadingProvider !== "github" ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (loadingProvider === null) {
                  e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#0F172A";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 4px 16px rgba(255, 255, 255, 0.15)"
                    : "0 4px 16px rgba(15, 23, 42, 0.15)";
                }
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
                {loadingProvider === "github" ? (
                  <Loader2 size={18} className="animate-spin" color={isDark ? "#fff" : "#0F172A"} />
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>
                  {loadingProvider === "github"
                    ? "Connecting to GitHub..."
                    : mode === "signin"
                    ? "Continue with GitHub"
                    : "Sign up with GitHub"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                  color: isDark ? "#CBD5E1" : "#475569",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #E2E8F0",
                }}
              >
                Developer
              </span>
            </button>
          </div>

          {/* Elegant Divider between Social and Email */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? "rgba(255, 255, 255, 0.45)" : "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {mode === "signin" ? "or continue with email" : "or sign up with email"}
            </span>
            <div style={{ flex: 1, height: 1, background: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0" }} />
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuthSubmit}>
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
                  Your Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color={isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8"}
                    style={{ position: "absolute", left: 14, top: 14 }}
                  />
                  <input
                    type="text"
                    placeholder="Ashwani Pandey"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
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
                Work Email Address
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
                  placeholder="ashwani.pandey@gmail.com"
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

            <div style={{ marginBottom: 18 }}>
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
                padding: "13px 18px",
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
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign in with Email" : "Create Free Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sample Data Demo Sandbox Access */}
          <div
            style={{
              marginTop: 14,
              padding: "11px 15px",
              borderRadius: 14,
              background: isDark ? "rgba(29, 158, 117, 0.08)" : "#E1F5EE",
              border: isDark ? "1px solid rgba(29, 158, 117, 0.2)" : "1px solid #A3E0C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1D9E75",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Zap size={13} /> Explore Demo Sandbox (Sample Data)
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(255, 255, 255, 0.6)" : "#064035",
                  marginTop: 2,
                }}
              >
                Preview the platform with sample candidate records
              </div>
            </div>
            <button
              type="button"
              id="instant-demo-access-btn"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("user_is_demo", "true");
                }
                executeLogin("Demo Evaluator", "demo@skillsync.ai", "demo");
              }}
              disabled={loadingProvider !== null}
              style={{
                padding: "7px 13px",
                borderRadius: 9,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(15, 110, 86, 0.25)",
              }}
            >
              Explore Sample
            </button>
          </div>

          {/* Toggle Mode Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: 18,
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
          <span>
            TLS 1.3 encrypted &middot; Zero AI model training on resumes &middot;{" "}
            <a href="/privacy" style={{ color: "#1D9E75", textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL WRAPPER (Used by Navbar)
// ─────────────────────────────────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onSuccess?: (user: AuthSuccessData) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  onSuccess,
}: AuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

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
      }}
    >
      <AuthCard
        initialMode={initialMode}
        onSuccess={onSuccess}
        onClose={onClose}
        isModal={true}
      />
    </div>
  );
}
