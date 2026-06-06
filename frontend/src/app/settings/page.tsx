"use client";
import { useState, useEffect } from "react";
import { Settings, Key, Palette, Trash2, Plus, Copy, Check } from "lucide-react";
import { apiClient } from "@/lib/api";

type Tab = "account" | "apikeys" | "branding";

export default function SettingsPage() {
  const [tab, setTab]             = useState<Tab>("account");
  const [apiKeys, setApiKeys]     = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey]       = useState<string | null>(null);
  const [branding, setBranding]   = useState<any>({});
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    apiClient.get("/keys").then(({ data }) => setApiKeys(data.keys ?? [])).catch(() => {});
    apiClient.get("/whitelabel/config").then(({ data }) => setBranding(data)).catch(() => {});
  }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const { data } = await apiClient.post("/keys/create", { name: newKeyName.trim() });
      setNewKey(data.api_key);
      setNewKeyName("");
      const { data: keys } = await apiClient.get("/keys");
      setApiKeys(keys.keys ?? []);
    } catch (e: any) {
      alert(e.message || "Failed to create key");
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    await apiClient.delete(`/keys/${id}`);
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      await apiClient.post("/whitelabel/config", branding);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const copyKey = () => {
    if (newKey) navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account",  label: "Account",    icon: <Settings size={16} /> },
    { id: "apikeys",  label: "API Keys",   icon: <Key size={16} /> },
    { id: "branding", label: "Branding",   icon: <Palette size={16} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
          <span style={{ color: "var(--gray-300)" }}>›</span>
          <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Settings</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>

        {/* Sidebar nav */}
        <div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none", background: tab === t.id ? "var(--teal-50)" : "transparent", color: tab === t.id ? "var(--teal-700)" : "var(--gray-600)", fontWeight: tab === t.id ? 600 : 400, fontSize: 14, cursor: "pointer", marginBottom: 4, textAlign: "left" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div>
          {tab === "account" && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 28 }}>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>Account</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Plan",     value: "Career",               action: <a href="/billing" style={{ fontSize: 13, color: "var(--teal-700)", fontWeight: 600, textDecoration: "none" }}>Upgrade →</a> },
                  { label: "Member since", value: "2025",             action: null },
                  { label: "Analyses used", value: "47 this month",   action: null },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                    <span style={{ fontSize: 14, color: "var(--gray-600)" }}>{row.label}</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>{row.value}</span>
                      {row.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "apikeys" && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 28 }}>
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>API Keys</h2>
              <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
                Use API keys to integrate ResumeAI into your own applications. Keys are only shown once.
              </p>

              {/* New key banner */}
              {newKey && (
                <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24, border: "1px solid var(--teal-200)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal-700)", marginBottom: 8 }}>⚠️ Copy this key now — it won't be shown again</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <code style={{ flex: 1, fontSize: 13, fontFamily: "DM Mono, monospace", background: "#fff", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--teal-200)", color: "var(--gray-900)", wordBreak: "break-all" }}>{newKey}</code>
                    <button onClick={copyKey} style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", border: "none", background: copied ? "var(--teal-700)" : "var(--teal-100)", color: copied ? "#fff" : "var(--teal-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} style={{ marginTop: 10, fontSize: 12, color: "var(--gray-400)", background: "none", border: "none", cursor: "pointer" }}>
                    I've copied it, dismiss
                  </button>
                </div>
              )}

              {/* Create new key */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                  placeholder="Key name e.g. production-app"
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none" }}
                />
                <button onClick={createKey} disabled={!newKeyName.trim()}
                  style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", background: !newKeyName.trim() ? "var(--gray-200)" : "var(--teal-700)", color: !newKeyName.trim() ? "var(--gray-400)" : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={15} /> Create
                </button>
              </div>

              {/* Keys list */}
              {apiKeys.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-400)", fontSize: 14 }}>
                  No API keys yet. Create one above.
                </div>
              ) : (
                apiKeys.map(k => (
                  <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                    <Key size={16} color={k.is_active ? "var(--teal-500)" : "var(--gray-300)"} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{k.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                        Created {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: k.is_active ? "var(--teal-50)" : "var(--gray-100)", color: k.is_active ? "var(--teal-700)" : "var(--gray-400)" }}>
                      {k.is_active ? "Active" : "Revoked"}
                    </span>
                    {k.is_active && (
                      <button onClick={() => revokeKey(k.id)} style={{ padding: "6px", borderRadius: "var(--radius-md)", border: "1px solid var(--coral-200)", background: "#fff", color: "var(--coral-700)", cursor: "pointer", display: "flex" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "branding" && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 28 }}>
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>White-label branding</h2>
              <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>
                Customize how ResumeAI appears to your team. Changes apply immediately.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { key: "product_name",    label: "Product name",   type: "text",  placeholder: "ResumeAI" },
                  { key: "primary_color",   label: "Primary color",  type: "color", placeholder: "#0F6E56"  },
                  { key: "logo_url",        label: "Logo URL",        type: "url",   placeholder: "https://..." },
                  { key: "support_email",   label: "Support email",   type: "email", placeholder: "support@yourcompany.com" },
                  { key: "welcome_message", label: "Welcome message", type: "text",  placeholder: "Welcome to our resume platform" },
                  { key: "footer_text",     label: "Footer text",     type: "text",  placeholder: "Powered by ResumeAI" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-600)", display: "block", marginBottom: 6 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={branding[field.key] ?? ""}
                      onChange={e => setBranding((b: any) => ({ ...b, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif" }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={branding.hide_powered_by ?? false}
                      onChange={e => setBranding((b: any) => ({ ...b, hide_powered_by: e.target.checked }))}
                      style={{ accentColor: "var(--teal-700)", width: 16, height: 16 }} />
                    <span style={{ fontSize: 14, color: "var(--gray-700)" }}>Hide "Powered by ResumeAI" badge</span>
                  </label>
                </div>
              </div>
              <button onClick={saveBranding} disabled={saving}
                style={{ marginTop: 24, padding: "12px 28px", borderRadius: "var(--radius-md)", border: "none", background: saving ? "var(--gray-200)" : "var(--teal-700)", color: saving ? "var(--gray-400)" : "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {saved ? <><Check size={15} /> Saved!</> : saving ? "Saving..." : "Save branding"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
