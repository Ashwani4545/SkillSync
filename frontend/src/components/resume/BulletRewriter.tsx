"use client";
import { useState } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";

export function BulletRewriter({ data }: { data: any }) {
  const rewrites: any[] = data?.rewrites ?? [];
  const [accepted, setAccepted] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);

  if (!rewrites.length) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}>
        No bullets found to rewrite.
      </div>
    );
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Bullet rewriter</h2>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
        Click "Accept" to copy the improved version. Formula: Strong verb + what you did + measurable outcome.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rewrites.map((r: any, i: number) => (
          <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: `1px solid ${accepted[i] ? "var(--teal-500)" : "var(--gray-200)"}`, padding: 20, transition: "border-color 0.2s" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Before */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--coral-700)", marginBottom: 6 }}>BEFORE</div>
                <div style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.5, textDecoration: "line-through" }}>{r.original}</div>
                <div style={{ marginTop: 8, display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "var(--coral-50)", color: "var(--coral-700)" }}>{r.score_before}/100</div>
              </div>

              <ArrowRight size={20} color="var(--gray-300)" style={{ marginTop: 20, flexShrink: 0 }} />

              {/* After */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-700)", marginBottom: 6 }}>AFTER</div>
                <div style={{ fontSize: 14, color: "var(--gray-900)", lineHeight: 1.5, fontWeight: 500 }}>{r.rewritten}</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "var(--teal-50)", color: "var(--teal-700)" }}>{r.score_after}/100</span>
                  <span style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "capitalize" }}>{r.improvement_type?.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              {accepted[i] ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--teal-700)", fontWeight: 600 }}>
                  <Check size={14} /> Accepted
                  <button onClick={() => setAccepted((a) => ({ ...a, [i]: false }))} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <RotateCcw size={12} /> Undo
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleCopy(r.rewritten, i)}
                    style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "none", cursor: "pointer", fontSize: 13, color: "var(--gray-600)" }}
                  >
                    {copied === i ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => setAccepted((a) => ({ ...a, [i]: true }))}
                    style={{ padding: "7px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--teal-700)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Accept
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: "var(--gray-400)", textAlign: "center" }}>
        {Object.values(accepted).filter(Boolean).length} of {rewrites.length} bullets accepted
      </div>
    </div>
  );
}
