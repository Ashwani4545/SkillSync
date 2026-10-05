"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Target,
  TrendingUp,
  Bot,
  Briefcase,
  Brain,
  GitCompare,
  Award,
  Shield,
  Gauge,
  Flame,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";

// ─── Data ────────────────────────────────────────────────────────────────────

const READERS = [
  {
    id: "ats",
    label: "ATS Bot",
    accent: "#1D9E75",
    bg: "linear-gradient(135deg, #064035 0%, #0F6E56 100%)",
    badge: "LAYER 1",
    headline: "Your resume never reaches a human.",
    body: "The ATS bot rejected you at keyword density. It found 3 missing required skills, a two-column layout it can't parse, and a summary section with no job-title match.",
    stopAt: "Stopped reading at: Line 4 — Skills section",
    score: 61,
    pills: ["Missing: Python", "Missing: REST APIs", "Layout: Two columns"],
  },
  {
    id: "recruiter",
    label: "HR Recruiter",
    accent: "#378ADD",
    bg: "linear-gradient(135deg, #0D2E5A 0%, #185FA5 100%)",
    badge: "LAYER 2",
    headline: "She skimmed for 6 seconds and moved on.",
    body: "A 7-month gap in 2022. No seniority signal in the title. Three vague bullets that don't say what you actually built. She's already on the next resume.",
    stopAt: "Stopped reading at: Line 11 — First job bullet",
    score: 54,
    pills: ["Gap: 7 months unexplained", "Tone: Passive voice", "Seniority: Unclear"],
  },
  {
    id: "hm",
    label: "Hiring Manager",
    accent: "#7F77DD",
    bg: "linear-gradient(135deg, #2A2060 0%, #534AB7 100%)",
    badge: "LAYER 3",
    headline: "He wanted evidence. You gave him claims.",
    body: "'Led a cross-functional team' — how large? 'Improved performance' — by how much? Every bullet is a claim without a number. He's skeptical you can do the job.",
    stopAt: "Stopped reading at: Line 18 — Project description",
    score: 48,
    pills: ["No metrics", "Unquantified impact", "Vague ownership"],
  },
];

const COMPARISONS = [
  { tool: "Jobscan", them: "Keyword match vs JD", us: "Persona analysis + tone scoring + interview predictor" },
  { tool: "Resume Worded", them: "Generic improvement tips", us: "Role-specific benchmarking against real top candidates" },
  { tool: "Rezi.ai", them: "ATS scoring only", us: "Full career intelligence — trajectory, salary, interviews" },
  { tool: "Enhancv", them: "Design-focused output", us: "Deep content quality analysis, not just visual layout" },
  { tool: "Teal HQ", them: "Job tracking platform", us: "Resume AI as the primary product, not an afterthought" },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    label: "MVP",
    timeline: "Weeks 1–8",
    status: "done",
    items: [
      "Resume upload + parsing (PDF & DOCX)",
      "ATS compatibility scoring",
      "Section-by-section grading",
      "Bullet rewriter",
      "Tone + confidence analyzer",
      "Persona-based analysis (ATS / HR / HM)",
    ],
  },
  {
    phase: "Phase 2",
    label: "Differentiators",
    timeline: "Weeks 9–16",
    status: "active",
    items: [
      "One-click JD adapter",
      "Interview question predictor",
      "Resume A/B tester",
      "Skill authenticity checker",
      "Career gap advisor",
      "Industry benchmark comparison DONE",
    ],
  },
  {
    phase: "Phase 3",
    label: "Career Intelligence",
    timeline: "Weeks 17–24",
    status: "upcoming",
    items: [
      "Career trajectory predictor",
      "Real-time salary calibration",
      "GitHub portfolio integration DONE",
      "LinkedIn OAuth + profile sync",
      "Expanded benchmark database",
    ],
  },
  {
    phase: "Phase 4",
    label: "V2 Advanced",
    timeline: "Month 7+",
    status: "future",
    items: [
      "Multilingual + cultural format adapter",
      "Bias and inclusivity language scanner",
      "Recruiter / team dashboard (B2B)",
      "Bulk resume screening API",
      "White-label licensing",
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

type Reader = typeof READERS[0];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: color,
          borderRadius: 3,
          transition: "width 1s ease",
        }}
      />
    </div>
  );
}

function ReaderCard({
  reader,
  depth,
  onClick,
}: {
  reader: Reader;
  depth: number;
  onClick: () => void;
}) {
  const offset = depth * 18;
  const scale = 1 - depth * 0.04;
  const opacity = depth === 0 ? 1 : 1 - depth * 0.25;

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        top: offset,
        left: offset * 0.6,
        right: -offset * 0.6,
        bottom: -offset,
        background: reader.bg,
        borderRadius: 20,
        padding: "28px 30px",
        cursor: depth > 0 ? "pointer" : "default",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        opacity,
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow:
          depth === 0
            ? "0 24px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)"
            : "0 8px 20px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 10 - depth,
        userSelect: "none" as const,
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.1)",
            padding: "4px 10px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {reader.badge}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.12)",
            padding: "4px 12px",
            borderRadius: 20,
          }}
        >
          {reader.label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{reader.score}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)", paddingBottom: 6 }}>/100</span>
      </div>

      <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.4 }}>
        {reader.headline}
      </p>

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
        {reader.body}
      </p>

      <div
        style={{
          background: "rgba(0,0,0,0.25)",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          fontWeight: 600,
          fontFamily: "monospace",
          borderLeft: `3px solid ${reader.accent}`,
        }}
      >
        {reader.stopAt}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {reader.pills.map((pill, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReaderStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ordered = [
    READERS[activeIndex],
    READERS[(activeIndex + 1) % 3],
    READERS[(activeIndex + 2) % 3],
  ];

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        {READERS.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setActiveIndex(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 30,
              border: activeIndex === i ? "none" : "1px solid rgba(255,255,255,0.12)",
              background: activeIndex === i ? r.accent : "rgba(255,255,255,0.06)",
              color: activeIndex === i ? "#fff" : "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.25s",
            }}
          >
            {i === 0 && <Bot size={14} />}
            {i === 1 && <Briefcase size={14} />}
            {i === 2 && <Brain size={14} />}
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", height: 420 }}>
        {ordered.map((reader, depth) => (
          <ReaderCard
            key={reader.id}
            reader={reader}
            depth={depth}
            onClick={() => {
              if (depth > 0) {
                const idx = READERS.findIndex((r) => r.id === reader.id);
                setActiveIndex(idx);
              }
            }}
          />
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
          marginTop: 24,
          fontStyle: "italic",
        }}
      >
        Click a card behind to pull it forward
      </p>
    </div>
  );
}

// ─── Feature data (defined inline to avoid JSX in const arrays at module scope) ──

const FEATURE_DATA = [
  { iconName: "Users", title: "Persona-based analysis", desc: "Three simultaneous reviewer perspectives — ATS bot, HR recruiter, hiring manager — each with a stop-reading timestamp and specific fix list.", badge: "Unique", badgeColor: "#0F6E56" },
  { iconName: "Brain", title: "Interview question predictor", desc: "Every vague bullet becomes a predicted interview question. You see the question before the recruiter asks it — plus the rewrite that makes it disappear.", badge: "Unique", badgeColor: "#0F6E56" },
  { iconName: "Target", title: "JD adapter", desc: "Paste any job description. Get a tailored resume variant optimised for that role's keywords, seniority signals, and exact phrasing.", badge: "Pro", badgeColor: "#185FA5" },
  { iconName: "GitCompare", title: "Resume A/B tester", desc: "Upload two versions. Run them against the same role. Get a winner and a reasoning summary that explains exactly what changed the outcome.", badge: "Pro", badgeColor: "#185FA5" },
  { iconName: "Zap", title: "Bullet rewriter", desc: "Passive bullet in → action-verb + metric + outcome out. In one click, every weak line becomes something a hiring manager will actually remember.", badge: "Free", badgeColor: "#475569" },
  { iconName: "Shield", title: "Skill authenticity checker", desc: "Claims 'Python' but no Python in your project descriptions? Flagged. It cross-references every skill against the work you describe, not just the skills section.", badge: "Unique", badgeColor: "#0F6E56" },
  { iconName: "Award", title: "Industry benchmark", desc: "Real vector-similarity comparison against top-10% resumes in your role. Not simulated — actual percentile rankings from ingested top-performer data.", badge: "Career", badgeColor: "#534AB7" },
  { iconName: "Clock", title: "Career gap disguiser", desc: "A gap is a question mark in a recruiter's mind. SkillSync reframes it as a narrative — honest, confident, and structured to pass the 6-second scan.", badge: "Pro", badgeColor: "#185FA5" },
  { iconName: "TrendingUp", title: "Career trajectory predictor", desc: "Based on your resume and live market signals, predict your most realistic next 2 roles and the exact skill gaps blocking you from each one.", badge: "Career", badgeColor: "#534AB7" },
];

function FeatureIcon({ name }: { name: string }) {
  const sz = 22;
  if (name === "Users") return <Users size={sz} />;
  if (name === "Brain") return <Brain size={sz} />;
  if (name === "Target") return <Target size={sz} />;
  if (name === "GitCompare") return <GitCompare size={sz} />;
  if (name === "Zap") return <Zap size={sz} />;
  if (name === "Shield") return <Shield size={sz} />;
  if (name === "Award") return <Award size={sz} />;
  if (name === "Clock") return <Clock size={sz} />;
  if (name === "TrendingUp") return <TrendingUp size={sz} />;
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      style={{
        background: "#0A0F1E",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15,110,86,0.18) 0%, rgba(10,15,30,0) 70%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "10%",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(15,110,86,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 120,
            right: "8%",
            width: 260,
            height: 260,
            background: "radial-gradient(circle, rgba(55,138,221,0.10) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(15, 110, 86, 0.15)",
                border: "1px solid rgba(29, 158, 117, 0.3)",
                color: "#1D9E75",
                fontSize: 12,
                fontWeight: 800,
                padding: "7px 20px",
                borderRadius: 30,
                letterSpacing: "0.06em",
              }}
            >
              <Zap size={13} fill="currentColor" /> AI-POWERED RESUME INTELLIGENCE
            </div>
          </div>

          <h1
            style={{
              textAlign: "center",
              fontSize: "clamp(36px, 5.5vw, 68px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              marginBottom: 20,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Three readers.{" "}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>One resume.</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #1D9E75 0%, #378ADD 50%, #7F77DD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              See where each one quits.
            </span>
          </h1>

          <p
            style={{
              textAlign: "center",
              fontSize: 19,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 580,
              margin: "0 auto 52px",
              lineHeight: 1.7,
            }}
          >
            Analyze your resume through the eyes of an ATS bot, a recruiter and a hiring manager at once.
            Get AI fixes, predicted interview questions and a benchmark against top candidates in your field.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: 60,
              alignItems: "center",
            }}
          >
            {/* Left column */}
            <div>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  borderLeft: "2px solid rgba(29, 158, 117, 0.4)",
                  paddingLeft: 16,
                }}
              >
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>Each page in the stack</strong>{" "}
                is how one reviewer sees the same resume. Choose one to pull it forward. Fix what
                they&apos;re stopping on.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {READERS.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: r.accent,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${r.accent}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.8)",
                        minWidth: 110,
                      }}
                    >
                      {r.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <ScoreBar value={r.score} color={r.accent} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: r.accent,
                        minWidth: 36,
                        textAlign: "right",
                      }}
                    >
                      {r.score}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "15px 30px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(15, 110, 86, 0.4)",
                  }}
                >
                  Analyze my resume free <ArrowRight size={17} />
                </Link>
                <Link
                  href="/build"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "15px 24px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Build my resume
                </Link>
              </div>
              <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                No credit card required · 3 free analyses per month
              </p>
            </div>

            {/* Right column: stacked reader cards */}
            <ReaderStack />
          </div>
        </div>
      </section>

      {/* ── "0 tools" callout ── */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 24px",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap" as const,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, #1D9E75, #378ADD)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}
          >
            0
          </div>
          <div style={{ maxWidth: 520 }}>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 6px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Resume tools that actually explain why you&apos;re filtered out.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
              Every other tool tells you <em>what&apos;s missing.</em> SkillSync tells you{" "}
              <em>why you&apos;re being filtered out</em> — and exactly how to fix it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Nine Features ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#1D9E75",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            Nine features
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Most tools say what is missing.
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              SkillSync says why you get filtered out.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto" }}>
            Nine features built around that one question.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURE_DATA.map((f, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "26px 28px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${f.badgeColor}80, transparent)`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: `${f.badgeColor}20`,
                    border: `1px solid ${f.badgeColor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.badgeColor,
                  }}
                >
                  <FeatureIcon name={f.iconName} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: `${f.badgeColor}20`,
                    color: f.badgeColor,
                    border: `1px solid ${f.badgeColor}40`,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {f.badge}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 10,
                  color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section
        style={{
          padding: "100px 24px",
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "#378ADD",
                marginBottom: 16,
                textTransform: "uppercase",
              }}
            >
              How it compares
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 900,
                fontFamily: "'Syne', sans-serif",
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 14,
              }}
            >
              What other resume tools do,
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>
                and what SkillSync does differently.
              </span>
            </h2>
          </div>

          <div
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 1fr",
                background: "rgba(255,255,255,0.05)",
                padding: "14px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Tool
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                What they do
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#1D9E75",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                SkillSync does differently
              </span>
            </div>

            {COMPARISONS.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr 1fr",
                  padding: "18px 24px",
                  borderBottom:
                    i < COMPARISONS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "4px 10px",
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                >
                  {row.tool}
                </span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  {row.them}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.5,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <CheckCircle
                    size={14}
                    color="#1D9E75"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  {row.us}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#7F77DD",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            Roadmap
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: 14,
            }}
          >
            Four phases over roughly seven months.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
            Phase 1 is complete and tested end-to-end. Phase 2 is actively in progress.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {ROADMAP.map((phase, i) => {
            type StatusKey = "done" | "active" | "upcoming" | "future";
            const STATUS_MAP: Record<StatusKey, { dot: string; label: string; labelBg: string; labelColor: string }> = {
              done: { dot: "#1D9E75", label: "Complete", labelBg: "rgba(29, 158, 117, 0.15)", labelColor: "#1D9E75" },
              active: { dot: "#378ADD", label: "In progress", labelBg: "rgba(55, 138, 221, 0.15)", labelColor: "#378ADD" },
              upcoming: { dot: "#7F77DD", label: "Upcoming", labelBg: "rgba(127, 119, 221, 0.15)", labelColor: "#7F77DD" },
              future: { dot: "rgba(255,255,255,0.2)", label: "Planned", labelBg: "rgba(255,255,255,0.05)", labelColor: "rgba(255,255,255,0.4)" },
            };
            const sc = STATUS_MAP[phase.status as StatusKey];

            return (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${phase.status === "active" ? "rgba(55, 138, 221, 0.25)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 18,
                  padding: "24px 26px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {phase.status === "active" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "linear-gradient(90deg, transparent, #378ADD, transparent)",
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                    }}
                  >
                    {phase.phase}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: sc.labelBg,
                      color: sc.labelColor,
                      border: `1px solid ${sc.dot}40`,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: sc.dot,
                        display: "inline-block",
                        boxShadow: phase.status !== "future" ? `0 0 6px ${sc.dot}` : "none",
                      }}
                    />
                    {sc.label}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "'Syne', sans-serif",
                    marginBottom: 4,
                  }}
                >
                  {phase.label}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 18,
                    fontWeight: 600,
                  }}
                >
                  {phase.timeline}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {phase.items.map((item, j) => {
                    const isDone =
                      item.includes("DONE") || phase.status === "done";
                    const cleanItem = item.replace(" DONE", "");
                    return (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: isDone
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.35)",
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: isDone
                              ? "rgba(29, 158, 117, 0.2)"
                              : "rgba(255,255,255,0.06)",
                            border: isDone
                              ? "1px solid rgba(29, 158, 117, 0.4)"
                              : "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          {isDone && <CheckCircle size={10} color="#1D9E75" />}
                        </span>
                        {cleanItem}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Sample interface CTA ── */}
      <section
        style={{
          padding: "80px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(29,158,117,0.08) 0%, transparent 70%)",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "8px 18px",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <Gauge size={13} />
            SkillSync sample interface · All scores, resume text, prices and salaries are
            placeholder data
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            Stop guessing. Start knowing
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #1D9E75 0%, #378ADD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              exactly why you&apos;re rejected.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Your next application deserves more than a keyword checker. Run it through three reviewer
            lenses and fix the actual problems — before a human ever reads it.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 32px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 8px 32px rgba(15, 110, 86, 0.45)",
              }}
            >
              <Flame size={16} />
              Start for free
            </Link>
            <Link
              href="/analyze/upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 24px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Upload a resume <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap" as const,
          gap: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
            }}
          >
            S
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "#1D9E75",
            }}
          >
            SkillSync
          </span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          &copy; {new Date().getFullYear()} SkillSync &middot; Built to help real people get real jobs.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Dashboard", "Analyze", "Benchmark", "Career Path"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(" ", "-")}`}
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
