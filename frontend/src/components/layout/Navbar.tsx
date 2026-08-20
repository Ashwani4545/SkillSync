"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  User,
  LogIn,
  Sparkles,
  Shield,
  X,
  Mail,
  Lock,
  ChevronDown,
  LogOut,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";

export function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    plan: "CAREER PLAN",
  });

  // Sync authentication state from localStorage / Cookie
  const syncAuthState = useCallback(() => {
    if (typeof window === "undefined") return;
    const isAuth =
      localStorage.getItem("user_authenticated") === "true" ||
      document.cookie.includes("user_authenticated=true");
    const name = localStorage.getItem("user_name") || "Ashwani Pandey";
    const email = localStorage.getItem("user_email") || "ashwani.pandey@gmail.com";
    const plan = localStorage.getItem("user_plan") || "CAREER PLAN";
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
      localStorage.setItem("user_plan", "CAREER PLAN");
      document.cookie = "user_authenticated=true; path=/; max-age=86400";
    }
    setUserState({
      isAuthenticated: true,
      name,
      email,
      plan: "CAREER PLAN",
    });
    setShowModal(false);
    setLoadingAction(null);
    window.location.href = "/dashboard";
  };

  const handleQuickDemoSignIn = () => {
    setLoadingAction("demo");
    setTimeout(() => {
      loginUser("Ashwani Pandey", "ashwani.pandey@gmail.com", "demo");
    }, 300);
  };

  const handleGoogleAuth = () => {
    setLoadingAction("google");
    setTimeout(() => {
      loginUser("Ashwani Pandey", "ashwani.pandey@gmail.com", "google");
    }, 400);
  };

  const handleGithubAuth = () => {
    setLoadingAction("github");
    setTimeout(() => {
      loginUser("Ashwani Developer", "ashwani.dev@github.com", "github");
    }, 400);
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
    setUserState({ isAuthenticated: false, name: "", email: "", plan: "CAREER PLAN" });
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  return (
    <>
      <nav
        style={{
          background: "#ffffff",
          borderBottom: "1px solid var(--gray-200, #E2E8F0)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
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
          {/* Brand Logo */}
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
              R
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--teal-700, #0F6E56)",
                letterSpacing: "-0.02em",
              }}
            >
              ResumeAI
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link
              href="/dashboard"
              style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
            >
              Dashboard
            </Link>
            <Link
              href="/benchmark"
              style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
            >
              Benchmark
            </Link>
            <Link
              href="/career-path"
              style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
            >
              Career Path
            </Link>
          </div>

          {/* Right Auth Section */}
          {userState.isAuthenticated ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                  color: "#92400E",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  border: "1px solid #FCD34D",
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

              <Link
                href="/billing"
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "var(--teal-700, #0F6E56)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Upgrade
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
                        marginTop: 4,
                      }}
                    >
                      <Settings size={14} /> Account Settings
                    </Link>
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
                      }}
                    >
                      <Sparkles size={14} color="#0F6E56" /> My Analyses
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
                  border: "1px solid var(--gray-300, #CBD5E1)",
                  background: "#ffffff",
                  color: "var(--gray-700, #334155)",
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
                {modalMode === "signin" ? "Welcome Back to ResumeAI" : "Create Your ResumeAI Account"}
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                {modalMode === "signin"
                  ? "Sign in to access your saved resume audits and career tools."
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
                background: "#E6F4F1",
                fontSize: 14,
                fontWeight: 700,
                color: "#0F6E56",
                cursor: "pointer",
                marginBottom: 10,
                transition: "all 0.15s",
              }}
            >
              <Zap size={16} />
              {loadingAction === "demo" ? "Signing In..." : "⚡ Quick 1-Click Demo Sign In"}
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
                padding: "11px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                marginBottom: 8,
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24.0 12 .0 7.31.0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              {loadingAction === "google" ? "Signing In with Google..." : "Continue with Google"}
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
                padding: "11px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                marginBottom: 16,
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {loadingAction === "github" ? "Signing In with GitHub..." : "Continue with GitHub"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>OR EMAIL</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth}>
              {modalMode === "signup" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 5 }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Ashwani Pandey"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
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
                    <User
                      size={16}
                      color="#94A3B8"
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 5 }}>
                  Work / Personal Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    placeholder="name@company.com"
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
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 5 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 38px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Lock
                    size={16}
                    color="#94A3B8"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94A3B8",
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-auth-button"
                disabled={loadingAction !== null}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(15, 110, 86, 0.25)",
                }}
              >
                {loadingAction === "email"
                  ? "Authenticating..."
                  : modalMode === "signin"
                  ? "Sign In with Email"
                  : "Create Free Account"}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#64748B" }}>
              {modalMode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setModalMode("signup")}
                    style={{ background: "none", border: "none", color: "#0F6E56", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setModalMode("signin")}
                    style={{ background: "none", border: "none", color: "#0F6E56", fontWeight: 700, cursor: "pointer" }}
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
