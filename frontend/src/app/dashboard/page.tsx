"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import { useTheme } from "../../components/providers/ThemeProvider";
import {
  FileText, Plus, TrendingUp, Clock, Wand2, GitCompare,
  Target, Calendar, BarChart2, Lock, DollarSign, Github,
  Users, Shield, Globe, Settings, ShieldCheck, ChevronDown, ChevronUp
} from "lucide-react";
import { apiClient } from "@/lib/api";

const FEATURE_CARDS = [
  { href:"/analyze/upload",   icon:<Plus size={20}/>,       title:"New analysis",     desc:"Upload a resume for full AI analysis",           color:"var(--teal-700)",   bg:"var(--teal-50)",   plan:"free"   },
  { href:"/analyze/upload?mode=universal", icon:<ShieldCheck size={20}/>, title:"Universal ATS Check", desc:"Analyze resume ATS readiness without job role or skills", color:"var(--teal-700)", bg:"var(--teal-50)", plan:"free" },
  { href:"/jd-adapter",       icon:<Wand2 size={20}/>,      title:"JD Adapter",       desc:"Tailor your resume to any job description",      color:"var(--blue-700)",   bg:"var(--blue-50)",   plan:"pro"    },
  { href:"/compare",          icon:<GitCompare size={20}/>, title:"A/B Tester",       desc:"Compare two resume versions head-to-head",       color:"var(--purple-700)", bg:"var(--purple-50)", plan:"pro"    },
  { href:"/benchmark",        icon:<BarChart2 size={20}/>,  title:"Benchmark",        desc:"See how you rank vs top 10% in your role",       color:"var(--amber-700)",  bg:"var(--amber-50)",  plan:"pro"    },
  { href:"/gap-advisor",      icon:<Calendar size={20}/>,   title:"Gap Advisor",      desc:"Address employment gaps strategically",          color:"var(--coral-700)",  bg:"var(--coral-50)",  plan:"pro"    },
  { href:"/career-path",      icon:<TrendingUp size={20}/>, title:"Career Path",      desc:"Predict your next role and skill gaps",          color:"var(--teal-700)",   bg:"var(--teal-50)",   plan:"career" },
  { href:"/salary",           icon:<DollarSign size={20}/>, title:"Salary",           desc:"Understand your market value by location",       color:"var(--purple-700)", bg:"var(--purple-50)", plan:"career" },
  { href:"/github",           icon:<Github size={20}/>,     title:"GitHub Sync",      desc:"Link your projects to resume bullets",           color:"var(--gray-700)",   bg:"var(--gray-100)",  plan:"career" },
  { href:"/bias-scanner",     icon:<Shield size={20}/>,     title:"Bias Scanner",     desc:"Detect gendered and exclusionary language",      color:"var(--teal-700)",   bg:"var(--teal-50)",   plan:"career" },
  { href:"/language-adapter", icon:<Globe size={20}/>,      title:"Cultural Adapter", desc:"Reformat your resume for any country",          color:"var(--blue-700)",   bg:"var(--blue-50)",   plan:"career" },
  { href:"/recruiter",        icon:<Users size={20}/>,      title:"Recruiter",        desc:"Bulk upload & screen candidates",                color:"var(--amber-700)",  bg:"var(--amber-50)",  plan:"team"   },
  { href:"/settings",         icon:<Settings size={20}/>,   title:"Settings & API",   desc:"White-label branding, API keys, account",        color:"var(--gray-600)",   bg:"var(--gray-100)",  plan:"team"   },
];

const PLAN_RANK: Record<string,number>  = { free:0, pro:1, career:2, team:3 };
const PLAN_LABELS: Record<string,string>= { pro:"PRO", career:"CAREER", team:"TEAM" };

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan]            = useState("team");
  const [showAllResumes, setShowAllResumes] = useState(false);

  useEffect(() => {
    apiClient.get("/resume/")
      .then(({ data }) => { setResumes(data.resumes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const canAccess = (plan: string) => PLAN_RANK[userPlan] >= PLAN_RANK[plan];
  const displayedResumes = showAllResumes ? resumes : resumes.slice(0, 3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.12) 0%, transparent 50%), #0A0F1E"
          : "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.08) 0%, transparent 50%), #F8FAFC",
        color: isDark ? "#ffffff" : "#0F172A",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header section */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2DD4BF", textTransform: "uppercase", background: isDark ? "rgba(29, 158, 117, 0.15)" : "#E1F5EE", border: "1px solid rgba(29, 158, 117, 0.3)", padding: "4px 12px", borderRadius: 20 }}>Workspace</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, marginBottom: 8, fontFamily: "Syne, sans-serif", color: isDark ? "#ffffff" : "#0F172A" }}>Command Center</h1>
          <p style={{ color: isDark ? "rgba(255, 255, 255, 0.6)" : "#475569", fontSize: 15, margin: 0 }}>Access AI resume auditing, JD tailoring, career pathing, and benchmarking tools.</p>
        </div>

        {/* Feature grid */}
        <h2 style={{ fontSize: 12, fontWeight: 700, color: isDark ? "rgba(255, 255, 255, 0.4)" : "#64748B", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tools & Capabilities</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginBottom: 48 }}>
          {FEATURE_CARDS.map((card, i) => {
            const accessible = canAccess(card.plan);
            const badgeLabel = PLAN_LABELS[card.plan];
            return (
              <div key={i} style={{ position: "relative" }}>
                <Link href={accessible ? card.href : "/billing"}
                  style={{
                    display: "block",
                    background: isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderRadius: "16px",
                    border: isDark
                      ? `1px solid ${accessible ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)"}`
                      : `1px solid ${accessible ? "#E2E8F0" : "#F1F5F9"}`,
                    padding: 20,
                    textDecoration: "none",
                    opacity: accessible ? 1 : 0.45,
                    transition: "all 0.2s ease",
                    boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={(e) => {
                    if (accessible) {
                      e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.06)" : "#F8FAFC";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessible) {
                      e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF";
                    }
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, marginBottom: 14, border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0,0,0,0.06)" }}>{card.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isDark ? "#ffffff" : "#0F172A", marginBottom: 4, fontFamily: "Syne, sans-serif" }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748B", lineHeight: 1.5 }}>{card.desc}</div>
                </Link>
                {!accessible && badgeLabel && (
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#FBBF24", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "2px 8px", borderRadius: 20, pointerEvents: "none" }}>
                    <Lock size={9}/> {badgeLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resume history */}
        <h2 style={{ fontSize: 12, fontWeight: 700, color: isDark ? "rgba(255, 255, 255, 0.4)" : "#64748B", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Resumes</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8" }}>Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign: "center", padding: 64, background: isDark ? "rgba(255, 255, 255, 0.02)" : "#FFFFFF", borderRadius: "20px", border: isDark ? "2px dashed rgba(255, 255, 255, 0.12)" : "2px dashed #CBD5E1", backdropFilter: "blur(10px)" }}>
            <FileText size={48} color={isDark ? "rgba(255, 255, 255, 0.2)" : "#94A3B8"} style={{ margin: "0 auto 16px" }}/>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: isDark ? "#ffffff" : "#0F172A" }}>No resumes yet</h3>
            <p style={{ color: isDark ? "rgba(255, 255, 255, 0.5)" : "#64748B", marginBottom: 24, fontSize: 14 }}>Upload your first resume to unlock full AI career intelligence.</p>
            <Link href="/analyze/upload" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#fff", textDecoration: "none", fontWeight: 700, boxShadow: "0 0 20px rgba(29, 158, 117, 0.3)" }}>
              <Plus size={16}/> Upload resume
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayedResumes.map(r => (
              <div key={r.id} style={{ background: isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: "16px", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(29, 158, 117, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={18} color="#2DD4BF"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#0F172A", marginBottom: 3, fontSize: 15 }}>{r.filename}</div>
                  <div style={{ fontSize: 12, color: isDark ? "rgba(255, 255, 255, 0.45)" : "#64748B", display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={12}/> {new Date(r.created_at).toLocaleDateString()}
                    <span style={{ padding: "2px 8px", borderRadius: 20, background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9", border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0", color: isDark ? "rgba(255, 255, 255, 0.7)" : "#475569", fontSize: 10, fontWeight: 700 }}>{r.file_type?.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href={`/bias-scanner?resume_id=${r.id}`} style={{ padding: "7px 12px", borderRadius: "10px", background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(29, 158, 117, 0.3)", color: "#2DD4BF", textDecoration: "none", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={12}/> Bias
                  </Link>
                  <Link href={`/career-path?resume_id=${r.id}`} style={{ padding: "7px 12px", borderRadius: "10px", background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.3)", color: "#C084FC", textDecoration: "none", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={12}/> Path
                  </Link>
                  <Link href={`/jd-adapter?resume_id=${r.id}`} style={{ padding: "7px 12px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38BDF8", textDecoration: "none", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Wand2 size={12}/> JD
                  </Link>
                  <Link href={`/analyze/upload`} style={{ padding: "7px 14px", borderRadius: "10px", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#ffffff", textDecoration: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    <Target size={12}/> Analyze
                  </Link>
                </div>
              </div>
            ))}

            {resumes.length > 3 && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button
                  onClick={() => setShowAllResumes(!showAllResumes)}
                  style={{
                    padding: "10px 22px", borderRadius: 30, border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
                    background: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF", color: isDark ? "#ffffff" : "#0F172A", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                    transition: "all 0.2s ease"
                  }}
                >
                  {showAllResumes ? (
                    <>View Less <ChevronUp size={14} /></>
                  ) : (
                    <>View More ({resumes.length - 3} more resumes) <ChevronDown size={14} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
