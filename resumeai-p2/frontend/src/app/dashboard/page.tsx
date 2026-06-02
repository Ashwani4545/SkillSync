"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, TrendingUp, Clock, Wand2, GitCompare, Target, Calendar, BarChart2, Lock } from "lucide-react";
import { apiClient } from "@/lib/api";

const FEATURE_CARDS = [
  { href: "/analyze/upload", icon: <Plus size={20} />, title: "New analysis", desc: "Upload a resume for full AI analysis", color: "var(--teal-700)", bg: "var(--teal-50)", plan: "free" },
  { href: "/jd-adapter",     icon: <Wand2 size={20} />, title: "JD Adapter", desc: "Tailor your resume to any job description", color: "var(--blue-700)", bg: "var(--blue-50)", plan: "pro" },
  { href: "/compare",        icon: <GitCompare size={20} />, title: "A/B Tester", desc: "Compare two resume versions head-to-head", color: "var(--purple-700)", bg: "var(--purple-50)", plan: "pro" },
  { href: "/benchmark",      icon: <BarChart2 size={20} />, title: "Benchmark", desc: "See how you rank vs top 10% in your role", color: "var(--amber-700)", bg: "var(--amber-50)", plan: "pro" },
  { href: "/gap-advisor",    icon: <Calendar size={20} />, title: "Gap Advisor", desc: "Address employment gaps strategically", color: "var(--coral-700)", bg: "var(--coral-50)", plan: "pro" },
  { href: "/career-path",    icon: <TrendingUp size={20} />, title: "Career Path", desc: "Predict your next role and skill gaps", color: "var(--teal-700)", bg: "var(--teal-50)", plan: "career", coming: true },
];

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan] = useState("pro"); // Replace with real plan from auth

  useEffect(() => {
    apiClient.get("/resume/").then(({ data }) => {
      setResumes(data.resumes ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const planRank: Record<string, number> = { free: 0, pro: 1, career: 2, team: 3 };
  const canAccess = (plan: string) => planRank[userPlan] >= planRank[plan];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--teal-700)" }}>ResumeAI</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "var(--blue-50)", color: "var(--blue-700)", textTransform: "uppercase" }}>{userPlan} plan</span>
            <Link href="/billing" style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", color: "var(--gray-700)", textDecoration: "none", fontSize: 13 }}>Upgrade</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Feature cards */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-500)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tools</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 48 }}>
          {FEATURE_CARDS.map((card, i) => {
            const accessible = canAccess(card.plan) && !card.coming;
            return (
              <div key={i} style={{ position: "relative" }}>
                <Link href={accessible ? card.href : "/billing"}
                  style={{ display: "block", background: "#fff", borderRadius: "var(--radius-lg)", border: `1px solid ${accessible ? "var(--gray-200)" : "var(--gray-100)"}`, padding: 20, textDecoration: "none", opacity: accessible ? 1 : 0.6, transition: "box-shadow .15s", cursor: accessible ? "pointer" : "default" }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, marginBottom: 14 }}>{card.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)", marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5 }}>{card.desc}</div>
                  {card.coming && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: "var(--gray-400)" }}>Coming in Phase 3</div>}
                  {!accessible && !card.coming && (
                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--amber-700)", background: "var(--amber-50)", padding: "2px 8px", borderRadius: 20 }}>
                      <Lock size={10} /> PRO
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Resume history */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-500)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your resumes</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}>Loading...</div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign: "center", padding: 64, background: "#fff", borderRadius: "var(--radius-xl)", border: "2px dashed var(--gray-200)" }}>
            <FileText size={48} color="var(--gray-200)" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>No resumes yet</h3>
            <p style={{ color: "var(--gray-400)", marginBottom: 24 }}>Upload your first resume to get started</p>
            <Link href="/analyze/upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: "var(--radius-md)", background: "var(--teal-700)", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
              <Plus size={16} /> Upload resume
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {resumes.map((r) => (
              <div key={r.id} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={18} color="var(--teal-700)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--gray-900)", marginBottom: 2, fontSize: 15 }}>{r.filename}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}
                    <span style={{ padding: "1px 7px", borderRadius: 20, background: "var(--gray-100)", color: "var(--gray-500)", fontSize: 10, fontWeight: 700 }}>{r.file_type?.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/jd-adapter?resume_id=${r.id}`} style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", background: "var(--blue-50)", color: "var(--blue-700)", textDecoration: "none", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Wand2 size={12} /> JD Adapt
                  </Link>
                  <Link href={`/analyze/upload`} style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", background: "var(--teal-50)", color: "var(--teal-700)", textDecoration: "none", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={12} /> Analyze
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
