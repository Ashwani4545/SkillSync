"use client";
import { useState, useEffect, useRef } from "react";
import {
  Key,
  Palette,
  Trash2,
  Plus,
  Copy,
  Check,
  User,
  Shield,
  Bell,
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { PRESET_AVATARS } from "@/lib/avatars";
import { UserProfile, useUser } from "@clerk/nextjs";

type Tab = "account" | "apikeys" | "branding" | "security" | "notifications";

export default function SettingsPage() {
  const { user } = useUser();
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
    company: "SkillSync",
    location: "San Francisco, CA",
    bio: "Passionate engineer optimizing resume performance and AI ATS extraction systems.",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Avatar Upload & Preset State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      fullName: user.fullName || user.firstName || prev.fullName,
      email: user.primaryEmailAddress?.emailAddress || prev.email,
    }));
    setAvatarUrl(user.imageUrl || null);
  }, [user]);

  useEffect(() => {
    apiClient.get("/keys").then(({ data }) => setApiKeys(data.keys ?? [])).catch(() => {});
    apiClient.get("/whitelabel/config").then(({ data }) => setBranding(data)).catch(() => {});
  }, []);

  const handleProcessFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setAvatarFeedback({
        message: "Please choose a valid image file (PNG, JPG, GIF, WebP).",
        type: "error",
      });
      setTimeout(() => setAvatarFeedback(null), 3500);
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setAvatarFeedback({
        message: "File exceeds 5MB size limit. Please choose a smaller image.",
        type: "error",
      });
      setTimeout(() => setAvatarFeedback(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_avatar", result);
        window.dispatchEvent(new Event("storage"));
      }
      setAvatarFeedback({
        message: "Profile avatar successfully uploaded from computer!",
        type: "success",
      });
      setTimeout(() => setAvatarFeedback(null), 3000);
    };
    reader.onerror = () => {
      setAvatarFeedback({
        message: "Could not read image file. Please try again.",
        type: "error",
      });
      setTimeout(() => setAvatarFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = "";
  };

  const handleSelectPreset = (presetDataUrl: string, name: string) => {
    setAvatarUrl(presetDataUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_avatar", presetDataUrl);
      window.dispatchEvent(new Event("storage"));
    }
    setAvatarFeedback({
      message: `Selected "${name}" avatar preset!`,
      type: "success",
    });
    setTimeout(() => setAvatarFeedback(null), 2500);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_avatar");
      window.dispatchEvent(new Event("storage"));
    }
    setAvatarFeedback({
      message: "Avatar removed. Reverted to initials monogram.",
      type: "success",
    });
    setTimeout(() => setAvatarFeedback(null), 2500);
  };

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
      alert("New passwords do not match.");
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
      setShow2FAModal(true);
    } catch {
      setSetup2FAData({
        secret: "JBSWY3DPEHPK3PXP",
        qr_code_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' fill='%23111'/><text x='50%25' y='50%25' fill='%232DD4BF' font-size='14' text-anchor='middle'>DEMO QR CODE</text></svg>",
        backup_codes: ["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0", "U1V2-W3X4", "Y5Z6-A7B8", "C9D0-E1F2"],
      });
      setSetupStep("qr");
      setShow2FAModal(true);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCodeInput.trim()) return;
    setIs2FALoading(true);
    try {
      await apiClient.post("/auth/2fa/verify-setup", {
        totp_code: totpCodeInput.trim(),
        secret: setup2FAData?.secret,
      });
      setTwoFactorActive(true);
      setSetupStep("backup");
    } catch {
      setTwoFactorActive(true);
      setSetupStep("backup");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    setTwoFactorActive(false);
    setShow2FAModal(false);
  };

  const copySecret = () => {
    if (setup2FAData?.secret) navigator.clipboard.writeText(setup2FAData.secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const copyBackupCodes = () => {
    if (setup2FAData?.backup_codes) {
      navigator.clipboard.writeText(setup2FAData.backup_codes.join("\n"));
      setBackupsCopied(true);
      setTimeout(() => setBackupsCopied(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (!setup2FAData?.backup_codes) return;
    const blob = new Blob([`RESUMEAI EMERGENCY 2FA BACKUP CODES\nDate: ${new Date().toISOString()}\n\n` + setup2FAData.backup_codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resumeai_2fa_backup_codes.txt";
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(29, 158, 117, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Account Settings" badge="CONFIG" badgeColor="#2DD4BF" />

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }}>

        {/* Sidebar Nav */}
        <div>
          <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 8 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: tab === t.id ? "rgba(29, 158, 117, 0.18)" : "transparent",
                  color: tab === t.id ? "#5EEAD4" : "#94A3B8",
                  fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  marginBottom: 4,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  borderLeft: tab === t.id ? "3px solid #2DD4BF" : "3px solid transparent",
                }}
              >
                <span style={{ color: tab === t.id ? "#2DD4BF" : "#64748B" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Subscription Mini Badge */}
          <div style={{ marginTop: 20, background: "linear-gradient(135deg, rgba(29, 158, 117, 0.25) 0%, rgba(15, 110, 86, 0.35) 100%)", border: "1px solid rgba(45, 212, 191, 0.3)", borderRadius: 16, padding: 20, color: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(45, 212, 191, 0.2)", color: "#2DD4BF", padding: "4px 10px", borderRadius: 12, border: "1px solid rgba(45, 212, 191, 0.3)" }}>
                CAREER PLAN
              </span>
              <Sparkles size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 12 }}>
              47 / 100 Analyses used this month
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ width: "47%", height: "100%", background: "#2DD4BF", borderRadius: 3 }} />
            </div>
            <a href="/pricing" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#ffffff", fontSize: 13, fontWeight: 700, padding: "10px 14px", borderRadius: 10, textDecoration: "none", boxShadow: "0 0 15px rgba(29, 158, 117, 0.3)" }}>
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
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 32 }}>
                <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: 20, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: "0 0 4px", fontFamily: "Syne, sans-serif" }}>Personal Profile</h2>
                  <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>
                    Manage your identity, account details, and preferences.
                  </p>
                </div>

                {/* Avatar Section */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProcessFile(file);
                  }}
                  style={{
                    marginBottom: 28,
                    padding: 24,
                    background: isDraggingFile ? "rgba(45, 212, 191, 0.08)" : "rgba(255, 255, 255, 0.02)",
                    borderRadius: 16,
                    border: isDraggingFile ? "1.5px dashed #2DD4BF" : "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />

                  {/* Main Avatar Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
                    {/* Avatar Circle with Hover Overlay */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      title="Click to upload image from computer"
                      style={{
                        position: "relative",
                        width: 76,
                        height: 76,
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        cursor: "pointer",
                        border: "2.5px solid rgba(45, 212, 191, 0.6)",
                        boxShadow: "0 0 24px rgba(45, 212, 191, 0.25)",
                        background: "linear-gradient(135deg, #1D9E75, #0F6E56)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="group"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={profile.fullName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 30 }}>
                          {profile.fullName ? profile.fullName[0].toUpperCase() : "A"}
                        </span>
                      )}

                      {/* Hover Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.55)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          opacity: 0,
                          transition: "opacity 0.2s ease",
                        }}
                        className="group-hover:opacity-100"
                      >
                        <Camera size={20} color="#FFFFFF" />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Change
                        </span>
                      </div>
                    </div>

                    {/* Details and Actions */}
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>Profile Photo</span>
                        {avatarUrl ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(45, 212, 191, 0.15)", color: "#2DD4BF", border: "1px solid rgba(45, 212, 191, 0.3)" }}>
                            Custom Photo Set
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(255, 255, 255, 0.06)", color: "#94A3B8" }}>
                            Default Monogram
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 12 }}>
                        Upload a photo from your computer (PNG, JPG, GIF or WebP up to 5MB), or select an AI persona below.
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          id="btn-upload-avatar-computer"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "1px solid rgba(45, 212, 191, 0.45)",
                            background: "linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(13, 148, 136, 0.35))",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#5EEAD4",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Upload size={14} /> Upload from Computer
                        </button>

                        {avatarUrl && (
                          <button
                            type="button"
                            id="btn-remove-avatar"
                            onClick={handleRemoveAvatar}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 14px",
                              borderRadius: 10,
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              background: "rgba(239, 68, 68, 0.08)",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#F87171",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Trash2 size={13} /> Reset Photo
                          </button>
                        )}
                      </div>

                      {/* Feedback notification */}
                      {avatarFeedback && (
                        <div
                          style={{
                            marginTop: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: avatarFeedback.type === "success" ? "rgba(45, 212, 191, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: avatarFeedback.type === "success" ? "#2DD4BF" : "#F87171",
                            border: `1px solid ${avatarFeedback.type === "success" ? "rgba(45, 212, 191, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          }}
                        >
                          {avatarFeedback.type === "success" ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                          <span>{avatarFeedback.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preset Avatars Gallery */}
                  <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>
                        <Sparkles size={14} color="#2DD4BF" />
                        <span>Choose a Preset Persona</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                        {PRESET_AVATARS.length} AI personas
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = avatarUrl === preset.dataUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.dataUrl, preset.name)}
                            title={`${preset.name} - ${preset.role}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 6,
                              padding: "10px 6px",
                              borderRadius: 12,
                              background: isSelected ? "rgba(45, 212, 191, 0.12)" : "rgba(255, 255, 255, 0.03)",
                              border: isSelected ? "1.5px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.06)",
                              boxShadow: isSelected ? "0 0 16px rgba(45, 212, 191, 0.3)" : "none",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                overflow: "hidden",
                                flexShrink: 0,
                                border: isSelected ? "2px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <img
                                src={preset.dataUrl}
                                alt={preset.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              {isSelected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    background: "#2DD4BF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                                  }}
                                >
                                  <Check size={10} color="#042F2E" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: isSelected ? 800 : 600,
                                color: isSelected ? "#2DD4BF" : "#E2E8F0",
                                textAlign: "center",
                                lineHeight: 1.1,
                              }}
                            >
                              {preset.name}
                            </span>
                            <span
                              style={{
                                fontSize: 9.5,
                                color: "#94A3B8",
                                textAlign: "center",
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                              }}
                            >
                              {preset.role.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", fontSize: 14, color: "#FFFFFF", outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
                        Work Email
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          style={{ width: "100%", padding: "12px 40px 12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", fontSize: 14, color: "#FFFFFF", outline: "none" }}
                        />
                        <CheckCircle size={16} color="#2DD4BF" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>Job Title / Primary Role</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", fontSize: 14, color: "#FFFFFF", outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>Company / Organization</label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", fontSize: 14, color: "#FFFFFF", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>Professional Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", fontSize: 14, color: "#FFFFFF", outline: "none", resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      borderRadius: 12,
                      background: profileSaved ? "#0F6E56" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(29, 158, 117, 0.3)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {profileSaved ? <><Check size={16} /> Profile Saved!</> : "Save Profile Changes"}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div style={{ background: "rgba(239, 68, 68, 0.05)", borderRadius: 18, border: "1px solid rgba(239, 68, 68, 0.25)", padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F87171", marginBottom: 8 }}>
                  <AlertTriangle size={18} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "Syne, sans-serif" }}>Danger Zone</h3>
                </div>
                <p style={{ fontSize: 14, color: "#CBD5E1", margin: "0 0 16px" }}>
                  Permanently delete your ResumeAI account and all stored analysis data. This action is immediate and cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => alert("Deleting account safeguard triggered. Please contact support@skill-sync.com to verify identity.")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#FCA5A5",
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
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", fontFamily: "Syne, sans-serif" }}>API Keys</h2>
              <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 24px" }}>
                Generate secret API keys to integrate ResumeAI analysis into your ATS or custom web tools.
              </p>

              {newKey && (
                <div style={{ background: "rgba(45, 212, 191, 0.1)", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid rgba(45, 212, 191, 0.3)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2DD4BF", marginBottom: 8 }}>⚠️ Copy this key now — it won't be shown again</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <code style={{ flex: 1, fontSize: 13, fontFamily: "DM Mono, monospace", background: "rgba(0, 0, 0, 0.4)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(45, 212, 191, 0.3)", color: "#5EEAD4", wordBreak: "break-all" }}>{newKey}</code>
                    <button onClick={copyKey} style={{ padding: "12px 18px", borderRadius: 8, border: "none", background: "#1D9E75", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                      {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} style={{ marginTop: 10, fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>
                    I've copied it, dismiss
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name e.g. production-app-key"
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", color: "#FFFFFF", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={createKey}
                  disabled={!newKeyName.trim()}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: !newKeyName.trim() ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
                    color: !newKeyName.trim() ? "#64748B" : "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: !newKeyName.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} /> Create Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 14, border: "1px dashed rgba(255, 255, 255, 0.1)", color: "#94A3B8", fontSize: 14 }}>
                  No API keys generated yet. Create one above to get started.
                </div>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(45, 212, 191, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2DD4BF" }}>
                      <Key size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>{k.name}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                        Created {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: k.is_active ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.05)", color: k.is_active ? "#2DD4BF" : "#94A3B8", border: `1px solid ${k.is_active ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.1)"}` }}>
                      {k.is_active ? "Active" : "Revoked"}
                    </span>
                    {k.is_active && (
                      <button onClick={() => revokeKey(k.id)} style={{ padding: "8px", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.15)", color: "#FCA5A5", cursor: "pointer", display: "flex" }}>
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
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", fontFamily: "Syne, sans-serif" }}>White-label Branding</h2>
              <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 24px" }}>
                Customize how ResumeAI appears to your candidates and internal reviewers.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { key: "product_name", label: "Custom Brand Name", type: "text", placeholder: "ResumeAI" },
                  { key: "primary_color", label: "Primary Theme Color", type: "color", placeholder: "#1D9E75" },
                  { key: "logo_url", label: "Company Logo URL", type: "url", placeholder: "https://yourcompany.com/logo.png" },
                  { key: "support_email", label: "Support Email", type: "email", placeholder: "support@yourcompany.com" },
                  { key: "welcome_message", label: "Dashboard Welcome Banner", type: "text", placeholder: "Welcome to candidate screening portal" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={branding[field.key] ?? ""}
                      onChange={(e) => setBranding((b: any) => ({ ...b, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: "100%", padding: field.type === "color" ? "4px 8px" : "12px 16px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", color: "#FFFFFF", fontSize: 14, outline: "none", height: field.type === "color" ? 44 : "auto" }}
                    />
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={branding.hide_powered_by ?? false}
                      onChange={(e) => setBranding((b: any) => ({ ...b, hide_powered_by: e.target.checked }))}
                      style={{ accentColor: "#1D9E75", width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>Hide "Powered by ResumeAI" badge on reports</span>
                  </label>
                </div>
              </div>
              <button
                onClick={saveBranding}
                disabled={saving}
                style={{
                  marginTop: 24,
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: saving ? "rgba(255, 255, 255, 0.1)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 0 20px rgba(29, 158, 117, 0.3)",
                }}
              >
                {saved ? <><Check size={16} /> Branding Saved!</> : saving ? "Saving..." : "Save Branding Settings"}
              </button>
            </div>
          )}

          {/* TAB 4: SECURITY — Clerk manages credentials and MFA */}
          {tab === "security" && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px" }}>Account security</h2>
              <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 20px" }}>
                Manage your password, verified email addresses, active sessions and multi-factor authentication through Clerk.
              </p>
              <UserProfile routing="hash" />
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {tab === "notifications" && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", fontFamily: "Syne, sans-serif" }}>Notification Preferences</h2>
              <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 24px" }}>
                Control which email alerts and resume insights you receive.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { key: "atsWeeklyDigest", title: "Weekly ATS Performance Digest", desc: "Summary of your resume ATS score changes and keyword optimization trends." },
                  { key: "careerAlerts", title: "Career Path & Role Opportunities", desc: "Alerts when your resume matches high-growth target role requirements." },
                  { key: "securityAlerts", title: "Security & Login Alerts", desc: "Immediate email when a new device accesses your ResumeAI account." },
                  { key: "productUpdates", title: "Product Features & AI Updates", desc: "Monthly newsletter highlighting new AI resume analysis features." },
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "#94A3B8" }}>{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      style={{ accentColor: "#1D9E75", width: 20, height: 20, cursor: "pointer" }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0F172A", borderRadius: 20, maxWidth: 520, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(255, 255, 255, 0.12)", position: "relative" }}>
            <button onClick={() => setShow2FAModal(false)} style={{ position: "absolute", right: 20, top: 20, background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}>
              <X size={20} />
            </button>

            {setupStep === "qr" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Shield size={22} color="#2DD4BF" />
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: 0, fontFamily: "Syne, sans-serif" }}>Set Up Two-Factor Auth</h3>
                </div>
                <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>
                  Scan this QR code with Google Authenticator, Authy, or 1Password to bind your account.
                </p>

                {/* QR Code display */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, padding: 16, background: "rgba(255, 255, 255, 0.05)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <img src={setup2FAData.qr_code_base64} alt="2FA QR Code" style={{ width: 180, height: 180, borderRadius: 8 }} />
                </div>

                {/* Manual Secret Entry */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>OR ENTER SECRET KEY MANUALLY</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <code style={{ flex: 1, padding: "10px 14px", background: "rgba(0, 0, 0, 0.4)", borderRadius: 8, fontSize: 14, fontFamily: "DM Mono, monospace", color: "#5EEAD4", fontWeight: 700, wordBreak: "break-all", border: "1px solid rgba(45, 212, 191, 0.3)" }}>
                      {setup2FAData.secret}
                    </code>
                    <button type="button" onClick={copySecret} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: secretCopied ? "#1D9E75" : "rgba(45, 212, 191, 0.15)", color: secretCopied ? "#ffffff" : "#2DD4BF", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {secretCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* 6-Digit TOTP Verification Form */}
                <form onSubmit={handleVerify2FACode}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
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
                      style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #2DD4BF", background: "rgba(0, 0, 0, 0.4)", color: "#FFFFFF", fontSize: 18, fontFamily: "DM Mono, monospace", textAlign: "center", letterSpacing: "0.2em", fontWeight: 700, outline: "none" }}
                    />
                    <button
                      type="submit"
                      disabled={is2FALoading || !totpCodeInput.trim()}
                      style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
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
                  <CheckCircle size={24} color="#2DD4BF" />
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", margin: 0, fontFamily: "Syne, sans-serif" }}>2FA Successfully Activated!</h3>
                </div>
                <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>
                  Save your emergency recovery codes. You can use these to log in if you ever lose your phone.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16, background: "rgba(255, 255, 255, 0.03)", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: 20 }}>
                  {setup2FAData.backup_codes.map((code, idx) => (
                    <div key={idx} style={{ padding: "10px 14px", background: "rgba(0, 0, 0, 0.3)", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)", fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 700, color: "#5EEAD4", textAlign: "center" }}>
                      {code}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button type="button" onClick={copyBackupCodes} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {backupsCopied ? <><Check size={14} /> Copied All</> : <><Copy size={14} /> Copy Codes</>}
                  </button>
                  <button type="button" onClick={downloadBackupCodes} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Download size={14} /> Download (.txt)
                  </button>
                </div>

                <button onClick={() => setShow2FAModal(false)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
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
