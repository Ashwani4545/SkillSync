"use client";
import { useState, useEffect } from "react";
import { BarChart2, AlertTriangle, RefreshCw, Users, DollarSign, Activity } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminPage() {
  const [spend, setSpend]         = useState<any | null>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [alerts, setAlerts]       = useState<any[]>([]);
  const [health, setHealth]       = useState<any | null>(null);
  const [stats, setStats]         = useState<any | null>(null);
  const [loading, setLoading]     = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [spendRes, breakdownRes, alertsRes, healthRes, statsRes] = await Promise.allSettled([
        apiClient.get("/admin/spend"),
        apiClient.get("/admin/spend/breakdown?days=7"),
        apiClient.get("/admin/alerts"),
        apiClient.get("/admin/health"),
        apiClient.get("/admin/users/stats"),
      ]);
      if (spendRes.status    === "fulfilled") setSpend(spendRes.value.data);
      if (breakdownRes.status=== "fulfilled") setBreakdown(breakdownRes.value.data.breakdown ?? []);
      if (alertsRes.status   === "fulfilled") setAlerts(alertsRes.value.data.alerts ?? []);
      if (healthRes.status   === "fulfilled") setHealth(healthRes.value.data);
      if (statsRes.status    === "fulfilled") setStats(statsRes.value.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const statusDot = (ok: boolean) => (
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: ok ? "#2DD4BF" : "#F87171", display: "inline-block", boxShadow: ok ? "0 0 8px #2DD4BF" : "0 0 8px #F87171" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(248, 113, 113, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Admin Console" badge="SYS" badgeColor="#F87171" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>System Dashboard</h1>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>Global infra monitoring, LLM spend, and live telemetry</p>
          </div>
          <button onClick={fetchAll} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {alerts.map((a: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: a.level === "critical" ? "rgba(239, 68, 68, 0.15)" : "rgba(251, 191, 36, 0.15)", borderRadius: 14, border: `1px solid ${a.level === "critical" ? "rgba(239, 68, 68, 0.3)" : "rgba(251, 191, 36, 0.3)"}`, marginBottom: 8, alignItems: "center" }}>
                <AlertTriangle size={18} color={a.level === "critical" ? "#F87171" : "#FBBF24"} />
                <span style={{ fontSize: 14, color: a.level === "critical" ? "#FCA5A5" : "#FDE68A" }}>{a.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* System health */}
        {health && (
          <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Activity size={18} color="#2DD4BF" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>System Health</h3>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: health.overall === "ok" ? "rgba(45, 212, 191, 0.15)" : "rgba(251, 191, 36, 0.15)", color: health.overall === "ok" ? "#2DD4BF" : "#FBBF24", border: `1px solid ${health.overall === "ok" ? "rgba(45, 212, 191, 0.3)" : "rgba(251, 191, 36, 0.3)"}` }}>
                {health.overall?.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {[
                { label: "Database",      val: health.database  },
                { label: "Redis",         val: health.redis     },
                { label: "Celery workers",val: health.celery    },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  {statusDot(item.val === "ok")}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{item.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: item.val === "ok" ? "#2DD4BF" : "#F87171", fontWeight: 700 }}>{item.val}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Workers online</span>
                <span style={{ marginLeft: "auto", fontSize: 16, fontWeight: 800, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>{health.worker_count}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* LLM spend */}
          {spend && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <DollarSign size={18} color="#2DD4BF" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>LLM Spend</h3>
              </div>
              {[
                { label: "Today",       val: spend.daily_usd,   limit: spend.daily_limit_usd,   period: "day"   },
                { label: "This month",  val: spend.monthly_usd, limit: spend.monthly_limit_usd, period: "month" },
              ].map(s => {
                const pct = Math.min(100, Math.round((s.val / s.limit) * 100));
                const barColor = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#1D9E75";
                return (
                  <div key={s.label} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#94A3B8" }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>${s.val.toFixed(2)} / ${s.limit}</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255, 255, 255, 0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{pct}% of {s.period}ly limit</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User stats */}
          {stats && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Users size={18} color="#60A5FA" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>Users</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div style={{ background: "rgba(45, 212, 191, 0.08)", border: "1px solid rgba(45, 212, 191, 0.25)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#2DD4BF", fontFamily: "Syne, sans-serif" }}>{stats.total_users}</div>
                  <div style={{ fontSize: 12, color: "#2DD4BF", fontWeight: 600, marginTop: 2 }}>Total users</div>
                </div>
                <div style={{ background: "rgba(96, 165, 250, 0.08)", border: "1px solid rgba(96, 165, 250, 0.25)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#60A5FA", fontFamily: "Syne, sans-serif" }}>{stats.total_analyses}</div>
                  <div style={{ fontSize: 12, color: "#60A5FA", fontWeight: 600, marginTop: 2 }}>Analyses run</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", marginBottom: 8 }}>BY PLAN</div>
              {Object.entries(stats.by_plan ?? {}).map(([plan, count]) => (
                <div key={plan} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", fontSize: 13 }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize", color: "#CBD5E1" }}>{plan}</span>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{String(count)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature cost breakdown */}
        {breakdown.length > 0 && (
          <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <BarChart2 size={18} color="#C084FC" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF" }}>Cost by feature — last 7 days</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {breakdown.map((item: any) => (
                <div key={item.feature} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.feature.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", fontFamily: "Syne, sans-serif" }}>${item.cost_usd}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{item.calls} calls · {item.total_tokens?.toLocaleString()} tokens</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
