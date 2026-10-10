"use client";

import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(255, 255, 255, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Moon size={16} />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
        background: isDark ? "rgba(255, 255, 255, 0.07)" : "#F1F5F9",
        color: isDark ? "#FBBF24" : "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: isDark ? "0 2px 6px rgba(0,0,0,0.2)" : "0 2px 6px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        if (isDark) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
          e.currentTarget.style.boxShadow = "0 0 12px rgba(251, 191, 36, 0.3)";
        } else {
          e.currentTarget.style.background = "#E2E8F0";
          e.currentTarget.style.boxShadow = "0 0 12px rgba(15, 110, 86, 0.2)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.07)" : "#F1F5F9";
        e.currentTarget.style.boxShadow = isDark ? "0 2px 6px rgba(0,0,0,0.2)" : "0 2px 6px rgba(0,0,0,0.04)";
      }}
    >
      {isDark ? (
        <Sun size={17} style={{ transition: "transform 0.3s ease" }} />
      ) : (
        <Moon size={17} style={{ transition: "transform 0.3s ease" }} />
      )}
    </button>
  );
}
