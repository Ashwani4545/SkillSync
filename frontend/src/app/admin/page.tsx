"use client";
import { useState, useEffect } from "react";
import { BarChart2, AlertTriangle, CheckCircle, RefreshCw, Users, Zap, DollarSign, Activity } from "lucide-react";
import { apiClient } from "@/lib/api";

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
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: ok ? "var(--teal-500)" : "var(--coral-500)", display: "inline-block" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
            <span style={{ color: "var(--gray-300)" }}>›</span>
            <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Admin</span>
          </div>
          <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)", fontSize: 13, cursor: "pointer" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 28 }}>System dashboard</h1>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {alerts.map((a: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "12px 16px", background: a.level === "critical" ? "var(--coral-50)" : "var(--amber-50)", borderRadius: "var(--radius-md)", border: `1px solid ${a.level === "critical" ? "var(--coral-200)" : "var(--amber-200)"}`, marginBottom: 8 }}>
                <AlertTriangle size={16} color={a.level === "critical" ? "var(--coral-700)" : "var(--amber-700)"} />
                <span style={{ fontSize: 14, color: a.level === "critical" ? "var(--coral-700)" : "var(--amber-700)" }}>{a.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* System health */}
        {health && (
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Activity size={18} />
              <h3 style={{ margin: 0, fontSize: 16 }}>System health</h3>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: health.overall === "ok" ? "var(--teal-50)" : "var(--amber-50)", color: health.overall === "ok" ? "var(--teal-700)" : "var(--amber-700)" }}>
                {health.overall?.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { label: "Database",      val: health.database  },
                { label: "Redis",         val: health.redis     },
                { label: "Celery workers",val: health.celery    },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  {statusDot(item.val === "ok")}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>{item.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: item.val === "ok" ? "var(--teal-700)" : "var(--coral-700)", fontWeight: 700 }}>{item.val}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>Workers online</span>
                <span style={{ marginLeft: "auto", fontSize: 16, fontWeight: 800, color: "var(--gray-900)", fontFamily: "Syne" }}>{health.worker_count}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* LLM spend */}
          {spend && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <DollarSign size={18} />
                <h3 style={{ margin: 0, fontSize: 16 }}>LLM spend</h3>
              </div>
              {[
                { label: "Today",       val: spend.daily_usd,   limit: spend.daily_limit_usd,   period: "day"   },
                { label: "This month",  val: spend.monthly_usd, limit: spend.monthly_limit_usd, period: "month" },
              ].map(s => {
                const pct = Math.min(100, Math.round((s.val / s.limit) * 100));
                const barColor = pct >= 90 ? "var(--coral-500)" : pct >= 70 ? "var(--amber-500)" : "var(--teal-500)";
                return (
                  <div key={s.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--gray-600)" }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>${s.val.toFixed(2)} / ${s.limit}</span>
                    </div>
                    <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>{pct}% of {s.period}ly limit</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User stats */}
          {stats && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Users size={18} />
                <h3 style={{ margin: 0, fontSize: 16 }}>Users</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-md)", padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>{stats.total_users}</div>
                  <div style={{ fontSize: 12, color: "var(--teal-700)", fontWeight: 600 }}>Total users</div>
                </div>
                <div style={{ background: "var(--blue-50)", borderRadius: "var(--radius-md)", padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--blue-700)", fontFamily: "Syne" }}>{stats.total_analyses}</div>
                  <div style={{ fontSize: 12, color: "var(--blue-700)", fontWeight: 600 }}>Analyses run</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 8 }}>BY PLAN</div>
              {Object.entries(stats.by_plan ?? {}).map(([plan, count]) => (
                <div key={plan} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-100)", fontSize: 13 }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--gray-700)" }}>{plan}</span>
                  <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{String(count)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature cost breakdown */}
        {breakdown.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <BarChart2 size={18} />
              <h3 style={{ margin: 0, fontSize: 16 }}>Cost by feature — last 7 days</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {breakdown.map((item: any) => (
                <div key={item.feature} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 4, textTransform: "uppercase" }}>{item.feature.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", fontFamily: "Syne" }}>${item.cost_usd}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>{item.calls} calls · {item.total_tokens?.toLocaleString()} tokens</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
