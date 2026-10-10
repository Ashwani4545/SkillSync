"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  LogIn,
  Sparkles,
  Shield,
  X,
  Mail,
  Lock,
  ChevronDown,
  LogOut,
  Zap,
  CheckCircle,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze/upload", label: "Analyze" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/career-path", label: "Career Path" },
];

const MORE_LINKS = [
  { href: "/jd-adapter", label: "JD Adapter" },
  { href: "/compare", label: "A/B Compare" },
  { href: "/gap-advisor", label: "Gap Advisor" },
  { href: "/bias-scanner", label: "Bias Scanner" },
  { href: "/language-adapter", label: "Language Adapter" },
  { href: "/salary", label: "Salary Calibration" },
  { href: "/github", label: "GitHub Sync" },
  { href: "/recruiter", label: "Recruiter View" },
];

export function Navbar() {
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userState, setUserState] = useState<{
    isAuthenticated: boolean;
    name: string;
    email: string;
    plan: string;
  }>({
    isAuthenticated: false,
    name: "",
    email: "",
    plan: "PRO PLAN",
  });

  // Sync auth state from localStorage or cookies
  const syncAuthState = useCallback(() => {
    if (typeof window === "undefined") return;
    const isAuth =
      localStorage.getItem("user_authenticated") === "true" ||
      document.cookie.includes("user_authenticated=true");
    const name = localStorage.getItem("user_name") || "Ashwani Pandey";
    const email = localStorage.getItem("user_email") || "ashwani.pandey@gmail.com";
    const plan = localStorage.getItem("user_plan") || "PRO PLAN";
    setUserState({ isAuthenticated: isAuth, name, email, plan });
  }, []);

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [syncAuthState]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setShowUserDropdown(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loginUser = (name: string, email: string, provider: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_authenticated", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_provider", provider);
      localStorage.setItem("user_plan", "PRO PLAN");
      document.cookie = "user_authenticated=true; path=/; max-age=86400";
    }
    setUserState({
      isAuthenticated: true,
      name,
      email,
      plan: "PRO PLAN",
    });
    setShowModal(false);
    setLoadingAction(null);
    window.location.href = "/dashboard";
  };

  const handleQuickDemoSignIn = () => {
    setLoadingAction("demo");
    setTimeout(() => {
      loginUser("Ashwani Pandey", "ashwani.pandey@gmail.com", "demo");
    }, 250);
  };

  const handleGoogleAuth = () => {
    setLoadingAction("google");
    setTimeout(() => {
      loginUser("Ashwani Pandey", "ashwani.pandey@gmail.com", "google");
    }, 300);
  };

  const handleGithubAuth = () => {
    setLoadingAction("github");
    setTimeout(() => {
      loginUser("Ashwani Developer", "ashwani.dev@github.com", "github");
    }, 300);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim() || "ashwani.pandey@gmail.com";
    const name = nameInput.trim() || email.split("@")[0] || "User";
    setLoadingAction("email");
    setTimeout(() => {
      loginUser(name, email, "email");
    }, 300);
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_authenticated");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_provider");
      localStorage.removeItem("user_plan");
      document.cookie = "user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    setUserState({ isAuthenticated: false, name: "", email: "", plan: "PRO PLAN" });
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  return (
    <>
      <nav
        style={{
          background: "rgba(10, 15, 30, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1150,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
                boxShadow: "0 3px 8px rgba(15, 110, 86, 0.25)",
              }}
            >
              S
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "#1D9E75",
                letterSpacing: "-0.02em",
              }}
            >
              SkillSync
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMore((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                More <ChevronDown size={14} />
              </button>

              {showMore && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 30,
                    width: 200,
                    background: "rgba(10, 15, 30, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: 6,
                    zIndex: 200,
                  }}
                  onMouseLeave={() => setShowMore(false)}
                >
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setShowMore(false)}
                      style={{
                        display: "block",
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Auth Section */}
          {userState.isAuthenticated ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <ThemeToggle />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #E1F5EE, #B8E6D5)",
                  color: "#064035",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  border: "1px solid #A3E0C8",
                }}
              >
                {userState.plan}
              </span>

              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--gray-200, #E2E8F0)",
                  color: "var(--gray-700, #334155)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#ffffff",
                }}
              >
                <Settings size={14} /> Settings
              </Link>

              {/* Account Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  id="user-account-menu-button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 10px 4px 6px",
                    borderRadius: 20,
                    background: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {userState.name ? userState.name[0].toUpperCase() : "A"}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                    {userState.name || "Account"}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </button>

                {showUserDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 42,
                      width: 230,
                      background: "#ffffff",
                      borderRadius: 14,
                      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                      border: "1px solid #E2E8F0",
                      padding: 8,
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                        {userState.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", wordBreak: "break-all" }}>
                        {userState.email}
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#334155",
                        textDecoration: "none",
                        marginTop: 4,
                      }}
                    >
                      <Sparkles size={14} color="#0F6E56" /> Workspace Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#334155",
                        textDecoration: "none",
                      }}
                    >
                      <Settings size={14} /> Account & API Keys
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#DC2626",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        marginTop: 2,
                      }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <ThemeToggle />
              <button
                id="navbar-signin-button"
                onClick={() => {
                  setModalMode("signin");
                  setShowModal(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <LogIn size={15} /> Sign in
              </button>

              <button
                id="navbar-getstarted-button"
                onClick={() => {
                  setModalMode("signup");
                  setShowModal(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(15, 110, 86, 0.25)",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={15} /> Get Started Free
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Authentication Modal */}
      {showModal && (
        <div
          id="auth-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 22,
              width: "100%",
              maxWidth: 440,
              padding: "32px 30px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              position: "relative",
              border: "1px solid #E2E8F0",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#E1F5EE",
                  color: "#0F6E56",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>
                {modalMode === "signin" ? "Welcome Back to SkillSync" : "Create Your SkillSync Account"}
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                {modalMode === "signin"
                  ? "Sign in to access all AI career tools, resume audits, and recruiter views."
                  : "Start auditing your resume and predicting recruiter interview questions."}
              </p>
            </div>

            {/* Quick Demo Sign In Option */}
            <button
              type="button"
              id="quick-demo-signin-button"
              onClick={handleQuickDemoSignIn}
              disabled={loadingAction !== null}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "11px 16px",
                borderRadius: 12,
                border: "1.5px solid #0F6E56",
                background: "#E1F5EE",
                fontSize: 14,
                fontWeight: 700,
                color: "#0F6E56",
                cursor: "pointer",
                marginBottom: 12,
                transition: "all 0.15s",
              }}
            >
              <Zap size={16} />
              {loadingAction === "demo" ? "Signing In..." : "⚡ Quick 1-Click Instant Sign In"}
            </button>

            {/* Google OAuth Option */}
            <button
              type="button"
              id="google-signin-button"
              onClick={handleGoogleAuth}
              disabled={loadingAction !== null}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#1E293B",
                cursor: "pointer",
                marginBottom: 10,
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              {loadingAction === "google" ? "Connecting Google..." : "Continue with Google"}
            </button>

            {/* GitHub Option */}
            <button
              type="button"
              id="github-signin-button"
              onClick={handleGithubAuth}
              disabled={loadingAction !== null}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#0F172A",
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                marginBottom: 16,
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {loadingAction === "github" ? "Connecting GitHub..." : "Continue with GitHub"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR WITH EMAIL</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth}>
              {modalMode === "signup" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ashwani Pandey"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: 12 }} />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 38px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: 12 }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 38px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="email-auth-submit-button"
                disabled={loadingAction !== null}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(15, 110, 86, 0.25)",
                  transition: "all 0.15s",
                }}
              >
                {loadingAction === "email"
                  ? "Authenticating..."
                  : modalMode === "signin"
                  ? "Sign In to Account"
                  : "Create Account"}
              </button>
            </form>

            {/* Toggle Mode */}
            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#64748B" }}>
              {modalMode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setModalMode("signup")}
                    style={{ background: "none", border: "none", color: "#0F6E56", fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setModalMode("signin")}
                    style={{ background: "none", border: "none", color: "#0F6E56", fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
