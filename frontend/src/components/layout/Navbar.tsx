"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";

const DEMO_AUTH_KEY = "skillsync-demo-auth";

// Primary links shown directly in the bar. Everything else lives in the
// "More" dropdown so every route in frontend/src/app is actually reachable
// from the UI (previously only Dashboard/Benchmark/Career Path were linked).
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
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSignedIn(window.localStorage.getItem(DEMO_AUTH_KEY) === "true");
  }, []);

  const handleMockSignIn = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DEMO_AUTH_KEY, "true");
    setIsSignedIn(true);
    window.location.assign("/dashboard");
  };

  const handleSignOut = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DEMO_AUTH_KEY);
    setIsSignedIn(false);
  };

  return (
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
              color: "var(--teal-700, #0F6E56)",
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
              style={{ color: "var(--gray-600, #475569)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
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
                color: "var(--gray-600, #475569)",
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
                  background: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                  border: "1px solid #E2E8F0",
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
                      color: "#334155",
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

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/settings"
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid var(--gray-200, #E2E8F0)",
              color: "var(--gray-700, #334155)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Settings
          </Link>

          {isSignedIn ? (
            <>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--gray-700, #334155)",
                  padding: "7px 10px",
                }}
              >
                Demo User
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--gray-300, #CBD5E1)",
                  background: "#ffffff",
                  color: "var(--gray-700, #334155)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleMockSignIn}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1px solid var(--gray-300, #CBD5E1)",
                background: "#ffffff",
                color: "var(--gray-700, #334155)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.assign("/dashboard");
              }
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
            }}
          >
            <Sparkles size={15} /> Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}
