"use client";
import { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Palette,
  Trash2,
  Plus,
  Copy,
  Check,
  User,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Sparkles,
  Upload,
  AlertTriangle,
  Mail,
  Building,
  MapPin,
  CheckCircle,
  X,
  QrCode,
  Download,
} from "lucide-react";
import { apiClient } from "@/lib/api";

type Tab = "account" | "apikeys" | "branding" | "security" | "notifications";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("account");
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: "Ashwani Pandey",
    email: "ashwani.pandey@gmail.com",
    role: "Senior Software Engineer & Data Analyst",
    company: "SkillSync Inc.",
    location: "San Francisco, CA",
    bio: "Passionate engineer optimizing resume performance and AI ATS extraction systems.",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Security Form State
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaved, setPasswordSaved] = useState(false);

  // 2FA Flow State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [setup2FAData, setSetup2FAData] = useState<{
    secret: string;
    qr_code_base64: string;
    backup_codes: string[];
  } | null>(null);
  const [totpCodeInput, setTotpCodeInput] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [setupStep, setSetupStep] = useState<"qr" | "backup">("qr");
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupsCopied, setBackupsCopied] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    atsWeeklyDigest: true,
    careerAlerts: true,
    productUpdates: false,
    securityAlerts: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name");
      const storedEmail = localStorage.getItem("user_email");
      if (storedName || storedEmail) {
        setProfile((prev) => ({
          ...prev,
          fullName: storedName || prev.fullName,
          email: storedEmail || prev.email,
        }));
      }
    }
    apiClient.get("/keys").then(({ data }) => setApiKeys(data.keys ?? [])).catch(() => {});
    apiClient.get("/whitelabel/config").then(({ data }) => setBranding(data)).catch(() => {});
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("user_name", profile.fullName);
      localStorage.setItem("user_email", profile.email);
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordSaved(true);
    setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const start2FASetup = async () => {
    setIs2FALoading(true);
    try {
      const { data } = await apiClient.post("/auth/2fa/setup");
      setSetup2FAData(data);
      setSetupStep("qr");
      setTotpCodeInput("");
      setShow2FAModal(true);
    } catch (err: any) {
      alert("Error generating 2FA setup: " + (err.message || err));
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setup2FAData || !totpCodeInput.trim()) return;
    setIs2FALoading(true);
    try {
      const { data } = await apiClient.post("/auth/2fa/verify", {
        secret: setup2FAData.secret,
        code: totpCodeInput,
        backup_codes: setup2FAData.backup_codes,
      });
      if (data.verified) {
        setTwoFactorActive(true);
        setSetupStep("backup");
      }
    } catch (err: any) {
      alert("Invalid 6-digit verification code. Please check your Authenticator app and try again.");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication? Your account security level will decrease.")) return;
    try {
      await apiClient.post("/auth/2fa/disable");
      setTwoFactorActive(false);
      setSetup2FAData(null);
    } catch (err: any) {
      alert("Failed to disable 2FA: " + err.message);
    }
  };

  const copySecret = () => {
    if (setup2FAData) navigator.clipboard.writeText(setup2FAData.secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const copyBackupCodes = () => {
    if (setup2FAData) navigator.clipboard.writeText(setup2FAData.backup_codes.join("\n"));
    setBackupsCopied(true);
    setTimeout(() => setBackupsCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    if (!setup2FAData) return;
    const textContent = `RESUMEAI EMERGENCY RECOVERY BACKUP CODES\nAccount: ${profile.email}\nGenerated: ${new Date().toLocaleString()}\n\n` + setup2FAData.backup_codes.join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ResumeAI-2FA-Backup-Codes.txt";
    a.click();
  };

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
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
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
    { id: "account", label: "Account Profile", icon: <User size={16} /> },
    { id: "apikeys", label: "API Keys", icon: <Key size={16} /> },
    { id: "branding", label: "Branding", icon: <Palette size={16} /> },
    { id: "security", label: "Security & Passwords", icon: <Shield size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Header */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #E2E8F0", padding: "0 24px" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/dashboard" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#0F6E56", textDecoration: "none" }}>ResumeAI</a>
            <span style={{ color: "#CBD5E1", fontSize: 16 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Account Settings</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "230px 1fr", gap: 32 }}>

        {/* Sidebar Nav */}
        <div>
          <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: tab === t.id ? "#E6F4F1" : "transparent",
                  color: tab === t.id ? "#0F6E56" : "#475569",
                  fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  marginBottom: 2,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ color: tab === t.id ? "#0F6E56" : "#94A3B8" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Subscription Mini Badge */}
          <div style={{ marginTop: 20, background: "linear-gradient(135deg, #0F6E56, #1D9E75)", borderRadius: 14, padding: 18, color: "#ffffff", boxShadow: "0 4px 14px rgba(15, 110, 86, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(255,255,255,0.2)", padding: "3px 8px", borderRadius: 12 }}>
                CAREER PLAN
              </span>
              <Sparkles size={16} />
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
              47 / 100 Analyses used this month
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ width: "47%", height: "100%", background: "#ffffff", borderRadius: 3 }} />
            </div>
            <a href="/billing" style={{ display: "block", textAlign: "center", background: "#ffffff", color: "#0F6E56", fontSize: 13, fontWeight: 700, padding: "8px 12px", borderRadius: 8, textDecoration: "none" }}>
              Upgrade Plan →
            </a>
          </div>
        </div>

        {/* Main Content Pane */}
        <div>
          {/* TAB 1: ACCOUNT PROFILE */}
          {tab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Profile Card */}
              <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 20, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Personal Profile</h2>
                  <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                    Manage your identity, account details, and preferences.
                  </p>
                </div>

                {/* Avatar Section */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, padding: 20, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg, #0F6E56, #1D9E75)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, boxShadow: "0 4px 10px rgba(15, 110, 86, 0.25)" }}>
                    {profile.fullName ? profile.fullName[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Profile Photo</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>PNG, JPG or GIF up to 5MB</div>
                    <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#ffffff", fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                      <Upload size={14} /> Upload Avatar
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A", outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                        Work Email
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A", outline: "none" }}
                        />
                        <CheckCircle size={16} color="#0F6E56" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Job Title / Primary Role</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A", outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Company / Organization</label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Professional Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A", outline: "none", resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      borderRadius: 10,
                      background: profileSaved ? "#0F6E56" : "linear-gradient(135deg, #0F6E56, #1D9E75)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(15, 110, 86, 0.2)",
                      transition: "all 0.2s",
                    }}
                  >
                    {profileSaved ? <><Check size={16} /> Profile Saved!</> : "Save Profile Changes"}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #FEE2E2", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#DC2626", marginBottom: 8 }}>
                  <AlertTriangle size={18} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Danger Zone</h3>
                </div>
                <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 16px" }}>
                  Permanently delete your ResumeAI account and all stored analysis data. This action is immediate and cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => alert("Deleting account safeguard triggered. Please contact support@resumai.com to verify identity.")}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    border: "1px solid #FCA5A5",
                    background: "#FEF2F2",
                    color: "#991B1B",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS */}
          {tab === "apikeys" && (
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>API Keys</h2>
              <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>
                Generate secret API keys to integrate ResumeAI analysis into your ATS or custom web tools.
              </p>

              {newKey && (
                <div style={{ background: "#E6F4F1", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #A3E0D3" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F6E56", marginBottom: 8 }}>⚠️ Copy this key now — it won't be shown again</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <code style={{ flex: 1, fontSize: 13, fontFamily: "DM Mono, monospace", background: "#ffffff", padding: "10px 14px", borderRadius: 8, border: "1px solid #A3E0D3", color: "#0F172A", wordBreak: "break-all" }}>{newKey}</code>
                    <button onClick={copyKey} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: copied ? "#0F6E56" : "#0F6E56", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                      {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} style={{ marginTop: 10, fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>
                    I've copied it, dismiss
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name e.g. production-app-key"
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={createKey}
                  disabled={!newKeyName.trim()}
                  style={{
                    padding: "11px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: !newKeyName.trim() ? "#CBD5E1" : "linear-gradient(135deg, #0F6E56, #1D9E75)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} /> Create Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #CBD5E1", color: "#64748B", fontSize: 14 }}>
                  No API keys generated yet. Create one above to get started.
                </div>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E6F4F1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F6E56" }}>
                      <Key size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{k.name}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        Created {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: k.is_active ? "#E6F4F1" : "#F1F5F9", color: k.is_active ? "#0F6E56" : "#64748B" }}>
                      {k.is_active ? "Active" : "Revoked"}
                    </span>
                    {k.is_active && (
                      <button onClick={() => revokeKey(k.id)} style={{ padding: "8px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#ffffff", color: "#DC2626", cursor: "pointer", display: "flex" }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: BRANDING */}
          {tab === "branding" && (
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>White-label Branding</h2>
              <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>
                Customize how ResumeAI appears to your candidates and internal reviewers.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { key: "product_name", label: "Custom Brand Name", type: "text", placeholder: "ResumeAI" },
                  { key: "primary_color", label: "Primary Theme Color", type: "color", placeholder: "#0F6E56" },
                  { key: "logo_url", label: "Company Logo URL", type: "url", placeholder: "https://yourcompany.com/logo.png" },
                  { key: "support_email", label: "Support Email", type: "email", placeholder: "support@yourcompany.com" },
                  { key: "welcome_message", label: "Dashboard Welcome Banner", type: "text", placeholder: "Welcome to candidate screening portal" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={branding[field.key] ?? ""}
                      onChange={(e) => setBranding((b: any) => ({ ...b, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                    />
                  </div>
                ))}
                <div style={{ marginTop: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={branding.hide_powered_by ?? false}
                      onChange={(e) => setBranding((b: any) => ({ ...b, hide_powered_by: e.target.checked }))}
                      style={{ accentColor: "#0F6E56", width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Hide "Powered by ResumeAI" badge on reports</span>
                  </label>
                </div>
              </div>
              <button
                onClick={saveBranding}
                disabled={saving}
                style={{
                  marginTop: 24,
                  padding: "12px 26px",
                  borderRadius: 10,
                  border: "none",
                  background: saving ? "#CBD5E1" : "linear-gradient(135deg, #0F6E56, #1D9E75)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {saved ? <><Check size={16} /> Branding Saved!</> : saving ? "Saving..." : "Save Branding Settings"}
              </button>
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORDS & REAL 2FA */}
          {tab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 16, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Security & Password</h2>
                  <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Update your account password and security options.</p>
                </div>

                <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 450 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordState.currentPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordState.newPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                      placeholder="••••••••••••"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordState.confirmPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: 6,
                      alignSelf: "flex-start",
                      padding: "11px 22px",
                      borderRadius: 10,
                      border: "none",
                      background: passwordSaved ? "#0F6E56" : "linear-gradient(135deg, #0F6E56, #1D9E75)",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {passwordSaved ? <><Check size={16} /> Password Updated!</> : "Update Password"}
                  </button>
                </form>
              </div>

              {/* 2FA Card */}
              <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Shield size={20} color={twoFactorActive ? "#0F6E56" : "#64748B"} />
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Two-Factor Authentication (2FA)</div>
                    </div>
                    <p style={{ fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>
                      Protect your account with Google Authenticator, Authy, or 1Password TOTP verification.
                    </p>
                  </div>

                  {twoFactorActive ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "#E6F4F1", color: "#0F6E56", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle size={15} /> ✓ 2FA Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={start2FASetup}
                      disabled={is2FALoading}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 3px 10px rgba(15, 110, 86, 0.2)",
                      }}
                    >
                      {is2FALoading ? "Generating Setup..." : "Enable 2FA"}
                    </button>
                  )}
                </div>

                {twoFactorActive && (
                  <div style={{ paddingTop: 16, borderTop: "1px solid #F1F5F9", display: "flex", gap: 12 }}>
                    <button
                      onClick={() => { setSetupStep("backup"); setShow2FAModal(true); }}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#ffffff", color: "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      View Emergency Recovery Codes
                    </button>
                    <button
                      onClick={handleDisable2FA}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Disable 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {tab === "notifications" && (
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>Notification Preferences</h2>
              <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>
                Control which email alerts and resume insights you receive.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { key: "atsWeeklyDigest", title: "Weekly ATS Performance Digest", desc: "Summary of your resume ATS score changes and keyword optimization trends." },
                  { key: "careerAlerts", title: "Career Path & Role Opportunities", desc: "Alerts when your resume matches high-growth target role requirements." },
                  { key: "securityAlerts", title: "Security & Login Alerts", desc: "Immediate email when a new device accesses your ResumeAI account." },
                  { key: "productUpdates", title: "Product Features & AI Updates", desc: "Monthly newsletter highlighting new AI resume analysis features." },
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      style={{ accentColor: "#0F6E56", width: 20, height: 20, cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA SETUP MODAL DIALOG */}
      {show2FAModal && setup2FAData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 520, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid #E2E8F0", position: "relative" }}>
            <button onClick={() => setShow2FAModal(false)} style={{ position: "absolute", right: 20, top: 20, background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>
              <X size={20} />
            </button>

            {setupStep === "qr" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Shield size={22} color="#0F6E56" />
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Set Up Two-Factor Auth</h3>
                </div>
                <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px" }}>
                  Scan this QR code with Google Authenticator, Authy, or 1Password to bind your account.
                </p>

                {/* QR Code display */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, padding: 16, background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                  <img src={setup2FAData.qr_code_base64} alt="2FA QR Code" style={{ width: 180, height: 180, borderRadius: 8 }} />
                </div>

                {/* Manual Secret Entry */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>OR ENTER SECRET KEY MANUALLY</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <code style={{ flex: 1, padding: "10px 12px", background: "#F1F5F9", borderRadius: 8, fontSize: 14, fontFamily: "DM Mono, monospace", color: "#0F172A", fontWeight: 700, wordBreak: "break-all" }}>
                      {setup2FAData.secret}
                    </code>
                    <button type="button" onClick={copySecret} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: secretCopied ? "#0F6E56" : "#E6F4F1", color: secretCopied ? "#ffffff" : "#0F6E56", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {secretCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* 6-Digit TOTP Verification Form */}
                <form onSubmit={handleVerify2FACode}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
                    Enter 6-Digit Code from Authenticator App
                  </label>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. 123456"
                      value={totpCodeInput}
                      onChange={(e) => setTotpCodeInput(e.target.value)}
                      style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #0F6E56", fontSize: 18, fontFamily: "DM Mono, monospace", textAlign: "center", letterSpacing: "0.2em", fontWeight: 700, outline: "none" }}
                    />
                    <button
                      type="submit"
                      disabled={is2FALoading || !totpCodeInput.trim()}
                      style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0F6E56, #1D9E75)", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      {is2FALoading ? "Verifying..." : "Verify & Activate"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {setupStep === "backup" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <CheckCircle size={24} color="#0F6E56" />
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>2FA Successfully Activated!</h3>
                </div>
                <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px" }}>
                  Save your emergency recovery codes. You can use these to log in if you ever lose your phone.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 20 }}>
                  {setup2FAData.backup_codes.map((code, idx) => (
                    <div key={idx} style={{ padding: "8px 12px", background: "#ffffff", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 700, color: "#0F172A", textAlign: "center" }}>
                      {code}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button type="button" onClick={copyBackupCodes} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#ffffff", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {backupsCopied ? <><Check size={14} /> Copied All</> : <><Copy size={14} /> Copy Codes</>}
                  </button>
                  <button type="button" onClick={downloadBackupCodes} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#ffffff", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Download size={14} /> Download (.txt)
                  </button>
                </div>

                <button onClick={() => setShow2FAModal(false)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#0F6E56", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Finish 2FA Setup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
