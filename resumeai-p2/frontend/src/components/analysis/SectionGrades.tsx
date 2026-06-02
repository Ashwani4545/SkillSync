"use client";

const SECTION_META: Record<string, { label: string; color: string; bg: string }> = {
  summary:    { label: "Summary",    color: "var(--blue-700)",   bg: "var(--blue-50)"   },
  experience: { label: "Experience", color: "var(--teal-700)",   bg: "var(--teal-50)"   },
  education:  { label: "Education",  color: "var(--purple-700)", bg: "var(--purple-50)" },
  skills:     { label: "Skills",     color: "var(--amber-700)",  bg: "var(--amber-50)"  },
};

export function SectionGrades({ data }: { data: any }) {
  if (!data) return null;

  const sections = Object.entries(SECTION_META).map(([key, meta]) => ({
    key, ...meta,
    score: data[key]?.score ?? 0,
    grade: data[key]?.grade ?? "—",
    issues: data[key]?.issues ?? [],
    tips:   data[key]?.tips   ?? [],
  }));

  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Section grades</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {sections.map((s) => (
          <div key={s.key} style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 20 }}>{s.label}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.grade}</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, background: "var(--gray-100)", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${s.score}%`, background: s.color, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
            {s.tips.slice(0, 2).map((tip: string, i: number) => (
              <div key={i} style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${s.color}` }}>{tip}</div>
            ))}
          </div>
        ))}
      </div>
      {data.overall?.top3_fixes?.length > 0 && (
        <div style={{ marginTop: 20, padding: "16px", background: "var(--teal-50)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)", marginBottom: 10 }}>TOP 3 QUICK WINS</div>
          {data.overall.top3_fixes.map((fix: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "var(--gray-700)", alignItems: "flex-start" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--teal-700)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              {fix}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
