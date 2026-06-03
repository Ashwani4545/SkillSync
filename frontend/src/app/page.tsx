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
    <div style={{ background: "var(--gray-50)", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: "1px solid var(--gray-200)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--teal-700)" }}>ResumeAI</span>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/sign-in" style={{ padding: "8px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", color: "var(--gray-700)", textDecoration: "none", fontSize: 14 }}>Sign in</Link>
            <Link href="/sign-up" style={{ padding: "8px 18px", borderRadius: "var(--radius-md)", background: "var(--teal-700)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "96px 24px 64px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "var(--teal-50)", color: "var(--teal-700)", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, marginBottom: 24, border: "1px solid var(--teal-100)" }}>
          AI-powered • Built for real job seekers
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", marginBottom: 20, color: "var(--gray-900)" }}>
          Your resume, seen through<br />
          <span style={{ color: "var(--teal-700)" }}>three sets of eyes</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--gray-500)", lineHeight: 1.7, marginBottom: 40 }}>
          ATS bot. HR recruiter. Hiring manager. ResumeAI shows you exactly where each one would stop reading — and how to fix it.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: "var(--radius-md)", background: "var(--teal-700)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
            Analyze my resume free <ArrowRight size={16} />
          </Link>
          <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", color: "var(--gray-700)", textDecoration: "none", fontSize: 15 }}>
            See a live demo
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--gray-400)" }}>No credit card required · 3 free analyses per month</p>
      </section>

      {/* ── Feature grid ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-700)" }}>{f.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: f.badge === "Unique" ? "var(--teal-50)" : f.badge === "Pro" ? "var(--blue-50)" : "var(--purple-50)", color: f.badge === "Unique" ? "var(--teal-700)" : f.badge === "Pro" ? "var(--blue-700)" : "var(--purple-700)" }}>{f.badge}</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: "var(--gray-900)" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--gray-200)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 36, marginBottom: 8 }}>Simple, honest pricing</h2>
          <p style={{ textAlign: "center", color: "var(--gray-500)", marginBottom: 48 }}>Start free, upgrade when you need more</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ borderRadius: "var(--radius-lg)", border: plan.highlight ? "2px solid var(--teal-500)" : "1px solid var(--gray-200)", padding: "28px", position: "relative", background: "#fff" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--teal-700)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>MOST POPULAR</div>}
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: plan.highlight ? "var(--teal-700)" : "var(--gray-900)" }}>{plan.price}</span>
                  <span style={{ color: "var(--gray-400)", fontSize: 14 }}>{plan.desc}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--gray-700)" }}>
                      <CheckCircle size={15} color="var(--teal-500)" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" style={{ display: "block", textAlign: "center", padding: "11px", borderRadius: "var(--radius-md)", background: plan.highlight ? "var(--teal-700)" : "var(--gray-100)", color: plan.highlight ? "#fff" : "var(--gray-700)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                  {plan.name === "Free" ? "Get started free" : `Start ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--gray-200)", padding: "32px 24px", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
        <span style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--teal-700)", marginRight: 16 }}>ResumeAI</span>
        © {new Date().getFullYear()} ResumeAI. Built to help real people get real jobs.
      </footer>
    </div>
  );
}
