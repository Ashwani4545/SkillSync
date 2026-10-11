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
import { useTheme } from "../providers/ThemeProvider";
import { AuthModal } from "../auth/AuthModal";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userState, setUserState] = useState<{
    isAuthenticated: boolean;
    name: string;
    email: string;
    plan: string;
    provider: string;
  }>({
    isAuthenticated: false,
    name: "",
    email: "",
    plan: "PRO PLAN",
    provider: "google",
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
    const provider = localStorage.getItem("user_provider") || "google";
    setUserState({ isAuthenticated: isAuth, name, email, plan, provider });
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

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_authenticated");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_provider");
      localStorage.removeItem("user_plan");
      document.cookie = "user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    setUserState({ isAuthenticated: false, name: "", email: "", plan: "PRO PLAN", provider: "google" });
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  return (
    <>
      <nav
        style={{
          background: isDark ? "rgba(10, 15, 30, 0.85)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #E2E8F0",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "background 0.25s ease, border 0.25s ease",
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
                style={{
                  color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "color 0.2s",
                }}
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
                  color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: 0,
                  transition: "color 0.2s",
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
                    background: isDark ? "rgba(10, 15, 30, 0.95)" : "#FFFFFF",
                    backdropFilter: "blur(20px)",
                    borderRadius: 12,
                    boxShadow: isDark ? "0 12px 30px rgba(0,0,0,0.5)" : "0 12px 30px rgba(0,0,0,0.08)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
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
                        color: isDark ? "rgba(255,255,255,0.7)" : "#334155",
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
                      width: 250,
                      background: isDark ? "#0F172A" : "#ffffff",
                      borderRadius: 16,
                      boxShadow: isDark
                        ? "0 14px 40px rgba(0,0,0,0.6)"
                        : "0 14px 40px rgba(0,0,0,0.12)",
                      border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E2E8F0",
                      padding: 8,
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderBottom: isDark
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "1px solid #F1F5F9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isDark ? "#FFFFFF" : "#0F172A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{userState.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 12,
                            background:
                              userState.provider === "google"
                                ? "rgba(66, 133, 244, 0.15)"
                                : userState.provider === "linkedin"
                                ? "rgba(10, 102, 194, 0.15)"
                                : userState.provider === "github"
                                ? "rgba(148, 163, 184, 0.15)"
                                : "rgba(29, 158, 117, 0.15)",
                            color:
                              userState.provider === "google"
                                ? "#3B82F6"
                                : userState.provider === "linkedin"
                                ? "#0A66C2"
                                : userState.provider === "github"
                                ? "#94A3B8"
                                : "#1D9E75",
                            textTransform: "capitalize",
                          }}
                        >
                          {userState.provider}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: isDark ? "rgba(255,255,255,0.5)" : "#64748B",
                          wordBreak: "break-all",
                          marginTop: 2,
                        }}
                      >
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
                        color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
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
                        color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
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
                  border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #CBD5E1",
                  background: isDark ? "rgba(255,255,255,0.07)" : "#FFFFFF",
                  color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
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

      {/* Modern Universal Auth Modal with Google, LinkedIn, GitHub, Microsoft OAuth */}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialMode={modalMode}
        onSuccess={() => {
          syncAuthState();
        }}
      />
    </>
  );
}
