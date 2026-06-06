"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Plus, TrendingUp, Clock, Wand2, GitCompare,
  Target, Calendar, BarChart2, Lock, DollarSign, Github,
  Users, Shield, Globe, Settings
} from "lucide-react";
import { apiClient } from "@/lib/api";

const FEATURE_CARDS = [
  { href:"/analyze/upload",   icon:<Plus size={20}/>,       title:"New analysis",     desc:"Upload a resume for full AI analysis",           color:"var(--teal-700)",   bg:"var(--teal-50)",   plan:"free"   },
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
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan]            = useState("team"); // replace with real plan from Clerk

  useEffect(() => {
    apiClient.get("/resume/")
      .then(({ data }) => { setResumes(data.resumes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const canAccess = (plan: string) => PLAN_RANK[userPlan] >= PLAN_RANK[plan];

  return (
    <div style={{ minHeight:"100vh", background:"var(--gray-50)" }}>
      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid var(--gray-200)", padding:"0 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"Syne", fontWeight:800, fontSize:22, color:"var(--teal-700)" }}>ResumeAI</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"var(--amber-50)", color:"var(--amber-700)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {userPlan} plan
            </span>
            <Link href="/settings" style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:"var(--radius-md)", border:"1px solid var(--gray-200)", color:"var(--gray-600)", textDecoration:"none", fontSize:13 }}>
              <Settings size={14}/> Settings
            </Link>
            <Link href="/billing" style={{ padding:"8px 16px", borderRadius:"var(--radius-md)", background:"var(--teal-700)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:600 }}>
              Upgrade
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
        {/* Feature grid */}
        <h2 style={{ fontSize:13, fontWeight:700, color:"var(--gray-400)", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.06em" }}>Tools</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12, marginBottom:48 }}>
          {FEATURE_CARDS.map((card, i) => {
            const accessible  = canAccess(card.plan);
            const badgeLabel  = PLAN_LABELS[card.plan];
            return (
              <div key={i} style={{ position:"relative" }}>
                <Link href={accessible ? card.href : "/billing"}
                  style={{ display:"block", background:"#fff", borderRadius:"var(--radius-lg)", border:`1px solid ${accessible?"var(--gray-200)":"var(--gray-100)"}`, padding:18, textDecoration:"none", opacity:accessible?1:0.55, transition:"box-shadow .15s" }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", color:card.color, marginBottom:12 }}>{card.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--gray-900)", marginBottom:3 }}>{card.title}</div>
                  <div style={{ fontSize:12, color:"var(--gray-500)", lineHeight:1.5 }}>{card.desc}</div>
                </Link>
                {!accessible && badgeLabel && (
                  <div style={{ position:"absolute", top:10, right:10, display:"flex", alignItems:"center", gap:3, fontSize:10, fontWeight:700, color:"var(--amber-700)", background:"var(--amber-50)", padding:"2px 7px", borderRadius:20, pointerEvents:"none" }}>
                    <Lock size={9}/> {badgeLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resume history */}
        <h2 style={{ fontSize:13, fontWeight:700, color:"var(--gray-400)", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.06em" }}>Your resumes</h2>
        {loading ? (
          <div style={{ textAlign:"center", padding:48, color:"var(--gray-400)" }}>Loading...</div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign:"center", padding:64, background:"#fff", borderRadius:"var(--radius-xl)", border:"2px dashed var(--gray-200)" }}>
            <FileText size={48} color="var(--gray-200)" style={{ margin:"0 auto 16px" }}/>
            <h3 style={{ fontSize:18, marginBottom:8 }}>No resumes yet</h3>
            <p style={{ color:"var(--gray-400)", marginBottom:24 }}>Upload your first resume to get started</p>
            <Link href="/analyze/upload" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 24px", borderRadius:"var(--radius-md)", background:"var(--teal-700)", color:"#fff", textDecoration:"none", fontWeight:600 }}>
              <Plus size={16}/> Upload resume
            </Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {resumes.map(r => (
              <div key={r.id} style={{ background:"#fff", borderRadius:"var(--radius-lg)", border:"1px solid var(--gray-200)", padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"var(--teal-50)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <FileText size={17} color="var(--teal-700)"/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:"var(--gray-900)", marginBottom:2, fontSize:14 }}>{r.filename}</div>
                  <div style={{ fontSize:12, color:"var(--gray-400)", display:"flex", alignItems:"center", gap:6 }}>
                    <Clock size={11}/> {new Date(r.created_at).toLocaleDateString()}
                    <span style={{ padding:"1px 7px", borderRadius:20, background:"var(--gray-100)", color:"var(--gray-500)", fontSize:10, fontWeight:700 }}>{r.file_type?.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <Link href={`/bias-scanner?resume_id=${r.id}`} style={{ padding:"6px 11px", borderRadius:"var(--radius-md)", background:"var(--teal-50)", color:"var(--teal-700)", textDecoration:"none", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
                    <Shield size={11}/> Bias
                  </Link>
                  <Link href={`/career-path?resume_id=${r.id}`} style={{ padding:"6px 11px", borderRadius:"var(--radius-md)", background:"var(--purple-50)", color:"var(--purple-700)", textDecoration:"none", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
                    <TrendingUp size={11}/> Path
                  </Link>
                  <Link href={`/jd-adapter?resume_id=${r.id}`} style={{ padding:"6px 11px", borderRadius:"var(--radius-md)", background:"var(--blue-50)", color:"var(--blue-700)", textDecoration:"none", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
                    <Wand2 size={11}/> JD
                  </Link>
                  <Link href={`/analyze/upload`} style={{ padding:"6px 11px", borderRadius:"var(--radius-md)", background:"var(--gray-100)", color:"var(--gray-700)", textDecoration:"none", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
                    <Target size={11}/> Analyze
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
