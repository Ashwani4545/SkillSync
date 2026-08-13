"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Settings, Zap, User, LogIn, Sparkles, Shield, X, Mail } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
const isClerkKeyValid =
  Boolean(publishableKey) &&
  publishableKey.startsWith("pk_test_") &&
  !publishableKey.includes("ZXhhbXBsZQ");

export function Navbar() {
  return isClerkKeyValid ? <ClerkNavbar /> : <FallbackNavbar />;
}

function ClerkNavbar() {
  const { user, isLoaded } = useUser();
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    window.location.href = "/dashboard";
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
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
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

          {/* Quick Nav Links */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link
              href="/dashboard"
              style={{
                color: "var(--gray-600, #475569)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/benchmark"
              style={{
                color: "var(--gray-600, #475569)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Benchmark
            </Link>
            <Link
              href="/career-path"
              style={{
                color: "var(--gray-600, #475569)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Career Path
            </Link>
          </div>

          {/* Right Auth / User Account Menu */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Signed In State */}
            <SignedIn>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "var(--amber-50, #FEF3C7)",
                  color: "var(--amber-700, #B45309)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                TEAM PLAN
              </span>

              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--gray-200, #E2E8F0)",
                  color: "var(--gray-700, #334155)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Settings size={14} /> Settings
              </Link>

              <Link
                href="/billing"
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-md, 8px)",
                  background: "var(--teal-700, #0F6E56)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Upgrade
              </Link>

              {/* User Profile Avatar & Account Menu */}
              <div
                style={{
                  marginLeft: 4,
                  display: "flex",
                  alignItems: "center",
                  padding: "2px 6px",
                  borderRadius: 20,
                  background: "var(--gray-100, #F1F5F9)",
                  border: "1px solid var(--gray-200, #E2E8F0)",
                }}
              >
                <UserButton
                  afterSignOutUrl="/"
                  showName={true}
                  appearance={{
                    elements: {
                      userButtonBox: "flex flex-row-reverse items-center gap-2",
                      userButtonOuterIdentifier:
                        "text-xs font-semibold text-slate-700 max-w-[120px] truncate",
                      avatarBox: "w-7 h-7 rounded-full border border-teal-600",
                    },
                  }}
                />
              </div>
            </SignedIn>

            {/* Signed Out State */}
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button
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
              </SignInButton>

              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button
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
              </SignUpButton>
            </SignedOut>

            {/* Fallback User Profile if Clerk loading/fallback */}
            {!isLoaded && (
              <button
                onClick={() => setShowFallbackModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "#F1F5F9",
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <User size={14} color="#0F6E56" /> Account
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Fallback Authentication Modal */}
      {showFallbackModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
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
              borderRadius: 20,
              width: "100%",
              maxWidth: 420,
              padding: 32,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowFallbackModal(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
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
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: "0 0 6px",
                }}
              >
                {modalMode === "signin" ? "Welcome Back to ResumeAI" : "Create Your ResumeAI Account"}
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                Sign in with Google, GitHub, or Email to save your analyses and export reports.
              </p>
            </div>

            {/* Google OAuth Option */}
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                marginBottom: 12,
                transition: "all 0.2s",
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
              Continue with Google
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR EMAIL</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={handleCustomAuth}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
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
                    }}
                  />
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  background: "#0F6E56",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {modalMode === "signin" ? "Sign In with Email" : "Create Account"}
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 13,
                color: "#64748B",
              }}
            >
              {modalMode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setModalMode("signup")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0F6E56",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setModalMode("signin")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0F6E56",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
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

function FallbackNavbar() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    window.location.href = "/dashboard";
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
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
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

          {/* Quick Nav Links */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link href="/dashboard" style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Dashboard
            </Link>
            <Link href="/benchmark" style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Benchmark
            </Link>
            <Link href="/career-path" style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Career Path
            </Link>
          </div>

          {/* Right Auth / Sign In buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
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
        </div>
      </nav>

      {/* Authentication Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
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
              borderRadius: 20,
              width: "100%",
              maxWidth: 420,
              padding: 32,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
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
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                Sign in with Google, GitHub, or Email to save your analyses and export reports.
              </p>
            </div>

            {/* Google OAuth Option */}
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                marginBottom: 12,
                transition: "all 0.2s",
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
              Continue with Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR EMAIL</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={handleCustomAuth}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
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
                    }}
                  />
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  background: "#0F6E56",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {modalMode === "signin" ? "Sign In with Email" : "Create Account"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#64748B" }}>
              {modalMode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setModalMode("signup")}
                    style={{ background: "none", border: "none", color: "#0F6E56", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sign up
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
