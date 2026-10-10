"use client";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { useTheme } from "../providers/ThemeProvider";

interface PageHeaderProps {
  title: string;
  badge?: string;
  badgeColor?: string;
}

export function PageHeader({ title, badge, badgeColor = "#38BDF8" }: PageHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <Navbar />
      <div
        style={{
          background: isDark ? "rgba(10, 15, 30, 0.7)" : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
          padding: "0 24px",
          transition: "background 0.2s, border 0.2s",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 48, display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/dashboard"
            style={{
              color: isDark ? "rgba(255, 255, 255, 0.5)" : "#64748B",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2DD4BF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255, 255, 255, 0.5)" : "#64748B")}
          >
            Dashboard
          </Link>
          <span style={{ color: isDark ? "rgba(255, 255, 255, 0.2)" : "#CBD5E1" }}>/</span>
          <span style={{ fontSize: 13, color: isDark ? "#ffffff" : "#0F172A", fontWeight: 600 }}>{title}</span>
          {badge && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
                border: `1px solid ${badgeColor}60`,
                color: badgeColor,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
