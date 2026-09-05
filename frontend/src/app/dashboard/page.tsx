"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import {
  FileText, Plus, TrendingUp, Clock, Wand2, GitCompare,
  Target, Calendar, BarChart2, Lock, DollarSign, Github,
  Users, Shield, Globe, Settings, ShieldCheck, ChevronDown, ChevronUp, Sparkles, ArrowRight
} from "lucide-react";
import { apiClient } from "@/lib/api";

const FEATURE_CARDS = [
  { href:"/analyze/upload",   icon:<Plus size={22}/>,       title:"New Analysis",     desc:"Upload a resume for full multi-persona AI analysis",           color:"#0F6E56", bg:"#E1F5EE", border:"#B8E6D5", plan:"free", featured: true },
  { href:"/analyze/upload?mode=universal", icon:<ShieldCheck size={22}/>, title:"Universal ATS Check", desc:"Analyze ATS compatibility and keyword density without a JD", color:"#0F6E56", bg:"#E1F5EE", border:"#B8E6D5", plan:"free" },
  { href:"/jd-adapter",       icon:<Wand2 size={22}/>,      title:"JD Adapter",       desc:"Tailor your resume to match any job description",      color:"#185FA5", bg:"#E6F1FB", border:"#CEE3F8", plan:"pro"    },
  { href:"/compare",          icon:<GitCompare size={22}/>, title:"A/B Tester",       desc:"Compare two resume versions head-to-head",       color:"#534AB7", bg:"#EEEDFE", border:"#DDD9FC", plan:"pro"    },
  { href:"/benchmark",        icon:<BarChart2 size={22}/>,  title:"Benchmark",        desc:"See how you rank vs top 10% in your role",       color:"#854F0B", bg:"#FAEEDA", border:"#F6DDB0", plan:"pro"    },
  { href:"/gap-advisor",      icon:<Calendar size={22}/>,   title:"Gap Advisor",      desc:"Address employment gaps and framing strategically", color:"#712B13", bg:"#FAECE7", border:"#F5D3C7", plan:"pro"    },
  { href:"/career-path",      icon:<TrendingUp size={22}/>, title:"Career Path",      desc:"Predict your next career steps and skill gaps",  color:"#0F6E56", bg:"#E1F5EE", border:"#B8E6D5", plan:"career" },
  { href:"/salary",           icon:<DollarSign size={22}/>, title:"Salary Estimator",  desc:"Understand your market compensation by location", color:"#534AB7", bg:"#EEEDFE", border:"#DDD9FC", plan:"career" },
  { href:"/github",           icon:<Github size={22}/>,     title:"GitHub Sync",      desc:"Link GitHub repository evidence to your bullets", color:"#334155", bg:"#F1F5F9", border:"#CBD5E1", plan:"career" },
  { href:"/bias-scanner",     icon:<Shield size={22}/>,     title:"Bias Scanner",     desc:"Detect gendered and exclusionary language in CV", color:"#0F6E56", bg:"#E1F5EE", border:"#B8E6D5", plan:"career" },
  { href:"/language-adapter", icon:<Globe size={22}/>,      title:"Cultural Adapter", desc:"Reformat your resume standards for any country",  color:"#185FA5", bg:"#E6F1FB", border:"#CEE3F8", plan:"career" },
  { href:"/recruiter",        icon:<Users size={22}/>,      title:"Recruiter Screen", desc:"Bulk upload & screen candidates simultaneously",  color:"#854F0B", bg:"#FAEEDA", border:"#F6DDB0", plan:"team"   },
  { href:"/settings",         icon:<Settings size={22}/>,   title:"Settings & API",   desc:"White-label branding, secret API keys, team access", color:"#475569", bg:"#F1F5F9", border:"#CBD5E1", plan:"team"   },
];

const PLAN_RANK: Record<string,number>  = { free:0, pro:1, career:2, team:3 };
const PLAN_LABELS: Record<string,string>= { pro:"PRO", career:"CAREER", team:"TEAM" };

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan]            = useState("team"); // replace with real plan from Clerk
  const [showAllResumes, setShowAllResumes] = useState(false);

  useEffect(() => {
    apiClient.get("/resume/")
      .then(({ data }) => { setResumes(data.resumes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const canAccess = (plan: string) => PLAN_RANK[userPlan] >= PLAN_RANK[plan];

  const displayedResumes = showAllResumes ? resumes : resumes.slice(0, 3);

  return (
    <div style={{ minHeight:"100vh", background:"var(--gray-50)" }}>
      {/* Nav */}
      <Navbar />

      <div style={{ maxWidth:1160, margin:"0 auto", padding:"36px 24px" }}>
        
        {/* Welcome Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--gray-900)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Workspace Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--gray-500)" }}>
              Optimize, benchmark, and supercharge your resume with enterprise AI tools.
            </p>
          </div>
          <Link
            href="/analyze/upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, var(--teal-700) 0%, var(--teal-600) 100%)",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(15, 110, 86, 0.25)",
              transition: "transform 0.15s ease",
            }}
          >
            <Sparkles size={16} /> Analyze New Resume
          </Link>
        </div>

        {/* Feature grid section */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-500)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Tool Suite ({FEATURE_CARDS.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {FEATURE_CARDS.map((card, i) => {
              const accessible  = canAccess(card.plan);
              const badgeLabel  = PLAN_LABELS[card.plan];
              return (
                <div key={i} style={{ position: "relative" }}>
                  <Link
                    href={accessible ? card.href : "/billing"}
                    className="feature-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      background: "#ffffff",
                      borderRadius: 16,
                      border: `1px solid ${accessible ? "var(--gray-200)" : "var(--gray-100)"}`,
                      padding: "20px",
                      opacity: accessible ? 1 : 0.6,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.color,
                      }}>
                        {card.icon}
                      </div>

                      {!accessible && badgeLabel && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 800,
                          color: "var(--amber-700)",
                          background: "var(--amber-50)",
                          border: "1px solid var(--amber-100)",
                          padding: "3px 8px",
                          borderRadius: 20,
                        }}>
                          <Lock size={10} /> {badgeLabel}
                        </div>
                      )}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gray-900)", marginBottom: 6, letterSpacing: "-0.01em" }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5, flexGrow: 1 }}>
                      {card.desc}
                    </div>

                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: card.color }}>
                      <span>Open Tool</span>
                      <ArrowRight size={13} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resume history */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-500)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Recent Resumes
            </h2>
            {resumes.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>
                {resumes.length} {resumes.length === 1 ? "document" : "documents"} loaded
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}>Loading resumes...</div>
          ) : resumes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 56, background: "#ffffff", borderRadius: 20, border: "2px dashed var(--gray-200)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <FileText size={32} color="var(--gray-400)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", marginBottom: 6 }}>No Resumes Uploaded Yet</h3>
              <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 20, maxWidth: 380, margin: "0 auto 20px" }}>
                Upload your first CV/Resume to unlock full ATS scores, persona feedback, bullet rewrites, and skill gap predictions.
              </p>
              <Link href="/analyze/upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 12, background: "var(--teal-700)", color: "#ffffff", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 12px rgba(15, 110, 86, 0.2)" }}>
                <Plus size={16} /> Upload First Resume
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayedResumes.map(r => (
                <div
                  key={r.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid var(--gray-200)",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", border: "1px solid var(--teal-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={20} color="var(--teal-700)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--gray-900)", marginBottom: 3, fontSize: 15 }}>{r.filename}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 20, background: "var(--gray-100)", color: "var(--gray-600)", fontSize: 10, fontWeight: 800 }}>{r.file_type?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/bias-scanner?resume_id=${r.id}`} style={{ padding: "8px 14px", borderRadius: 10, background: "var(--teal-50)", color: "var(--teal-700)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <Shield size={13} /> Bias
                    </Link>
                    <Link href={`/career-path?resume_id=${r.id}`} style={{ padding: "8px 14px", borderRadius: 10, background: "var(--purple-50)", color: "var(--purple-700)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <TrendingUp size={13} /> Path
                    </Link>
                    <Link href={`/jd-adapter?resume_id=${r.id}`} style={{ padding: "8px 14px", borderRadius: 10, background: "var(--blue-50)", color: "var(--blue-700)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <Wand2 size={13} /> JD
                    </Link>
                    <Link href={`/analyze/upload?resume_id=${r.id}`} style={{ padding: "8px 14px", borderRadius: 10, background: "var(--gray-900)", color: "#ffffff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <Target size={13} /> Re-Analyze
                    </Link>
                  </div>
                </div>
              ))}

              {resumes.length > 3 && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <button
                    onClick={() => setShowAllResumes(!showAllResumes)}
                    style={{
                      padding: "10px 20px", borderRadius: 20, border: "1px solid var(--gray-300)",
                      background: "#ffffff", color: "var(--gray-700)", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                      transition: "all 0.15s ease"
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
    </div>
  );
}
