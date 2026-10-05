"use client";
import Link from "next/link";
import { Navbar } from "./Navbar";

interface PageHeaderProps {
  title: string;
  badge?: string;
  badgeColor?: string;
}

export function PageHeader({ title, badge, badgeColor = "#38BDF8" }: PageHeaderProps) {
  return (
    <>
      <Navbar />
      <div style={{ background: "rgba(10, 15, 30, 0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 48, display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/dashboard" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#2DD4BF")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)")}>
            Dashboard
          </Link>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>/</span>
          <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600 }}>{title}</span>
          {badge && (
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(255, 255, 255, 0.06)", border: `1px solid ${badgeColor}60`, color: badgeColor }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
