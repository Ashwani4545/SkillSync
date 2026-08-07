import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Users, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Users size={20} />,
    title: "Persona-based analysis",
    desc: "See your resume through the eyes of an ATS bot, HR recruiter, and hiring manager simultaneously.",
    badge: "Unique",
  },
  {
    icon: <Zap size={20} />,
    title: "Interview predictor",
    desc: "AI generates the exact probing questions a recruiter will ask based on weak spots in your resume.",
    badge: "Unique",
  },
  {
    icon: <Target size={20} />,
    title: "JD adapter",
    desc: "Paste any job description. Get a tailored version of your resume optimised for that specific role in one click.",
    badge: "Pro",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Career trajectory",
    desc: "Predict your realistic next roles and the exact skill gaps blocking your promotion to the next tier.",
    badge: "Career",
  },
];

const plans = [
  { name: "Free", price: "$0", desc: "Try it", features: ["3 analyses/month", "ATS score", "Section grades", "5 bullet rewrites"] },
  { name: "Pro", price: "$19", desc: "/month", features: ["Unlimited analyses", "All persona views", "JD adapter", "Interview predictor", "A/B tester"], highlight: true },
  { name: "Career", price: "$39", desc: "/month", features: ["Everything in Pro", "Career trajectory AI", "Salary calibration", "GitHub integration", "Benchmark vs top 10%"] },
];

export default function LandingPage() {
  return (
    <div style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0FDF4 100%)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: "1px solid rgba(226, 232, 240, 0.8)", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0F6E56, #1D9E75)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>S</div>
            <span style={{ fontWeight: 800, fontSize: 24, background: "linear-gradient(135deg, #064035, #0F6E56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkillSync</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/dashboard" style={{ padding: "9px 20px", borderRadius: 12, border: "1px solid #CBD5E1", color: "#334155", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}>Sign in</Link>
            <Link href="/dashboard" style={{ padding: "10px 22px", borderRadius: 12, background: "linear-gradient(135deg, #0F6E56, #1D9E75)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 12px rgba(15, 110, 86, 0.25)" }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 840, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E1F5EE", color: "#0F6E56", fontSize: 13, fontWeight: 700, padding: "6px 18px", borderRadius: 30, marginBottom: 24, border: "1px solid rgba(15, 110, 86, 0.2)" }}>
          <Zap size={15} color="#0F6E56" /> AI-Powered • Built for Real Job Seekers
        </div>
        <h1 style={{ fontSize: "clamp(38px, 5.5vw, 64px)", fontWeight: 800, marginBottom: 22, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Your resume, seen through<br />
          <span style={{ background: "linear-gradient(135deg, #0F6E56 0%, #378ADD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>three sets of eyes</span>
        </h1>
        <p style={{ fontSize: 19, color: "#475569", lineHeight: 1.7, marginBottom: 38, fontWeight: 400 }}>
          ATS bot. HR recruiter. Hiring manager. SkillSync shows you exactly where each one would stop reading — and how to fix it in seconds.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 32px", borderRadius: 14, background: "linear-gradient(135deg, #0F6E56, #1D9E75)", color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 20px rgba(15, 110, 86, 0.3)" }}>
            Analyze my resume free <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 28px", borderRadius: 14, background: "#fff", border: "1px solid #CBD5E1", color: "#334155", textDecoration: "none", fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            See a live demo
          </Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: "#64748B", fontWeight: 500 }}>No credit card required · 3 free analyses per month</p>
      </section>

      {/* ── Feature grid ── */}
      <section style={{ maxWidth: 1150, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)", borderRadius: 18, border: "1px solid #E2E8F0", padding: "26px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)", transition: "transform 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F6E56" }}>{f.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: f.badge === "Unique" ? "#E1F5EE" : f.badge === "Pro" ? "#E6F1FB" : "#EEEDFE", color: f.badge === "Unique" ? "#0F6E56" : f.badge === "Pro" ? "#185FA5" : "#534AB7" }}>{f.badge}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "80px 24px" }}>
        <div style={{ maxWidth: 950, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, color: "#0F172A", marginBottom: 10, letterSpacing: "-0.02em" }}>Simple, honest pricing</h2>
          <p style={{ textAlign: "center", color: "#64748B", fontSize: 16, marginBottom: 52 }}>Start free, upgrade when you need more power</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ borderRadius: 20, border: plan.highlight ? "2px solid #1D9E75" : "1px solid #E2E8F0", padding: "32px", position: "relative", background: "#fff", boxShadow: plan.highlight ? "0 12px 28px rgba(29, 158, 117, 0.15)" : "0 4px 12px rgba(0,0,0,0.03)" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #0F6E56, #1D9E75)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.05em" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 22 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? "#0F6E56" : "#0F172A" }}>{plan.price}</span>
                  <span style={{ color: "#64748B", fontSize: 14, fontWeight: 500 }}>{plan.desc}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155" }}>
                      <CheckCircle size={16} color="#1D9E75" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 12, background: plan.highlight ? "linear-gradient(135deg, #0F6E56, #1D9E75)" : "#F1F5F9", color: plan.highlight ? "#fff" : "#334155", textDecoration: "none", fontSize: 14, fontWeight: 700, transition: "all 0.2s" }}>
                  {plan.name === "Free" ? "Get started free" : `Start ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #E2E8F0", padding: "36px 24px", textAlign: "center", color: "#64748B", fontSize: 14, background: "#F8FAFC" }}>
        <span style={{ fontWeight: 800, color: "#0F6E56", marginRight: 12, fontSize: 16 }}>SkillSync</span>
        © {new Date().getFullYear()} SkillSync. Built to help real people get real jobs.
      </footer>
    </div>
  );
}
