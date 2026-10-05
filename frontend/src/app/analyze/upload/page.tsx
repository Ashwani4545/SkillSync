"use client";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Briefcase, Code, FileCode, CheckCircle, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";

function UploadFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUniversalModeParam = searchParams.get("mode") === "universal";

  const [file, setFile] = useState<File | null>(null);
  
  // Universal mode state
  const [isUniversalMode, setIsUniversalMode] = useState(isUniversalModeParam);

  // New Target Job Info states
  const [targetRole, setTargetRole] = useState("");
  const [demandedSkills, setDemandedSkills] = useState("");
  
  // Job Description states
  const [jdText, setJdText] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [extractingJd, setExtractingJd] = useState(false);
  
  // Global page states
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isUniversalModeParam) {
      setIsUniversalMode(true);
    }
  }, [isUniversalModeParam]);

  // Resume Dropzone
  const onDrop = useCallback((accepted: File[]) => {
    setError("");
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (r) => setError(r[0]?.errors[0]?.message || "Invalid resume file"),
  });

  // JD File Handler
  const handleJdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError("");
    setJdFile(selectedFile);
    setExtractingJd(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);
      
      const { data } = await apiClient.post("/jd/extract-text", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.text) {
        setJdText(data.text);
      } else {
        setError("Could not extract any text from the Job Description file.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to extract text from Job Description.");
    } finally {
      setExtractingJd(false);
    }
  };

  const handleRemoveJdFile = () => {
    setJdFile(null);
    setJdText("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select or drop a resume file first.");
      return;
    }

    if (!isUniversalMode) {
      if (!targetRole.trim()) {
        setError("Target job role is required for role-targeted analysis. Or switch to Universal ATS mode.");
        return;
      }
      if (!demandedSkills.trim()) {
        setError("Please specify demanded skills for role-targeted analysis. Or switch to Universal ATS mode.");
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      // 1. Upload Resume
      const form = new FormData();
      form.append("file", file);
      const { data: resume } = await apiClient.post("/resume/upload", form);

      // 2. Trigger Comprehensive Audit
      const { data: analysis } = await apiClient.post("/analysis/start", {
        resume_id: resume.id,
        jd_text: isUniversalMode ? null : (jdText || null),
        target_role: isUniversalMode ? "General Professional" : targetRole,
        demanded_skills: isUniversalMode ? "General Industry Competencies" : demandedSkills,
      });

      router.push(`/analyze/result/${analysis.id}`);
    } catch (e: any) {
      console.error("Upload error:", e);
      const detailMsg = e?.response?.data?.detail;
      const errorText = typeof detailMsg === "string" ? detailMsg : detailMsg ? JSON.stringify(detailMsg) : (e?.message || "Upload or analysis initiation failed. Please try again.");
      setError(errorText);
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 10%, rgba(29, 158, 117, 0.12) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <Navbar />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 680, background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: "24px", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", padding: "40px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#2DD4BF", textTransform: "uppercase", background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(29, 158, 117, 0.3)", padding: "5px 14px", borderRadius: 20 }}>Interactive CV Auditor</span>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", marginTop: 14, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Audit Your Resume</h1>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 15, margin: 0 }}>Find mistakes, grammar issues, quantify impact, and adapt your CV directly to a job role.</p>
          </div>

          {/* Mode Selector Toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: "rgba(255, 255, 255, 0.04)", borderRadius: 14, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <button
              type="button"
              onClick={() => setIsUniversalMode(false)}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: !isUniversalMode ? "rgba(29, 158, 117, 0.25)" : "transparent",
                color: !isUniversalMode ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                borderBottom: !isUniversalMode ? "1px solid rgba(45, 212, 191, 0.5)" : "none",
                transition: "all 0.2s"
              }}
            >
              Targeted Job Role & Skills
            </button>
            <button
              type="button"
              onClick={() => setIsUniversalMode(true)}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: isUniversalMode ? "rgba(29, 158, 117, 0.25)" : "transparent",
                color: isUniversalMode ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                borderBottom: isUniversalMode ? "1px solid rgba(45, 212, 191, 0.5)" : "none",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <ShieldCheck size={16} /> Universal ATS Check
            </button>
          </div>

          {error && (
            <div style={{ padding: "14px 18px", background: "rgba(248, 113, 113, 0.15)", borderLeft: "4px solid #F87171", borderRadius: "8px", color: "#FCA5A5", fontSize: 14, marginBottom: 24 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
            
            {/* Target Role & Skills Input Group */}
            {!isUniversalMode ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <Briefcase size={14} color="#2DD4BF" /> Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Web Developer"
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 14, outline: "none", background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", transition: "all 0.2s" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <Code size={14} color="#2DD4BF" /> Demanded Skills
                  </label>
                  <input
                    type="text"
                    value={demandedSkills}
                    onChange={(e) => setDemandedSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, AWS"
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 14, outline: "none", background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", transition: "all 0.2s" }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(29, 158, 117, 0.12)", border: "1px solid rgba(29, 158, 117, 0.3)", color: "rgba(255, 255, 255, 0.9)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldCheck size={20} color="#2DD4BF" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#2DD4BF" }}>Universal ATS Readiness Mode Active:</strong> Evaluating file parseability, contact validation, keyword density, section structure, and formatting quality without assuming any specific profession.
                </div>
              </div>
            )}

            {/* Resume Dropzone */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Upload Resume (CV)
              </label>
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? "#2DD4BF" : file ? "rgba(45, 212, 191, 0.5)" : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: "16px",
                  background: isDragActive ? "rgba(29, 158, 117, 0.12)" : file ? "rgba(29, 158, 117, 0.06)" : "rgba(255, 255, 255, 0.02)",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <FileText size={44} color="#2DD4BF" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>{(file.size / 1024).toFixed(0)} KB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: 12, fontSize: 12, color: "#F87171", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <X size={12} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={40} color="rgba(255, 255, 255, 0.3)" style={{ margin: "0 auto 14px" }} />
                    <p style={{ fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>{isDragActive ? "Drop the resume here" : "Drag & drop your resume file"}</p>
                    <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.45)" }}>PDF or DOCX · Up to 10 MB</p>
                    <div style={{ marginTop: 14, display: "inline-block", padding: "8px 20px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff", fontSize: 13, fontWeight: 600 }}>Browse File</div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description section */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
              <button
                onClick={() => setShowJD(!showJD)}
                style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ffffff", fontWeight: 600 }}
              >
                <span>Add Job Description <span style={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 400 }}>(optional — improves matching)</span></span>
                {showJD ? <ChevronUp size={16} color="rgba(255,255,255,0.6)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.6)" />}
              </button>
              
              {showJD && (
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* JD file upload */}
                  <div style={{ border: "1px dashed rgba(255, 255, 255, 0.12)", borderRadius: "12px", padding: 16, background: "rgba(255, 255, 255, 0.02)" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.6)", display: "block", marginBottom: 8 }}>UPLOAD JD DOCUMENT OR IMAGE (PNG/JPG/PDF)</span>
                    
                    {jdFile ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255, 255, 255, 0.04)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <FileCode size={20} color="#2DD4BF" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{jdFile.name}</p>
                          <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", margin: 0 }}>{(jdFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        {extractingJd ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#2DD4BF" }}>
                            <Loader2 size={12} className="animate-spin" /> Extracting...
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#2DD4BF" }}>
                            <CheckCircle size={14} /> Extracted
                          </div>
                        )}
                        <button onClick={handleRemoveJdFile} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", padding: 4 }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: "relative", cursor: "pointer" }}>
                        <input
                          type="file"
                          onChange={handleJdFileChange}
                          accept="application/pdf,image/png,image/jpeg,image/jpg"
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                        />
                        <div style={{ padding: "12px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.04)", borderRadius: 8, textAlign: "center", fontSize: 13, color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>
                          Choose PDF, Image or Screenshot of the JD
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>— OR PASTE TEXT DIRECTLY —</div>

                  {/* JD text area */}
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the Job Description text here..."
                    rows={5}
                    style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", color: "#ffffff", outline: "none", background: "rgba(255, 255, 255, 0.05)" }}
                  />
                </div>
              )}
            </div>

          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || uploading || extractingJd}
            style={{
              width: "100%", padding: "18px", borderRadius: "12px", border: "none",
              background: !file || uploading || extractingJd ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
              color: !file || uploading || extractingJd ? "rgba(255, 255, 255, 0.3)" : "#fff",
              fontSize: 16, fontWeight: 700, cursor: !file || uploading || extractingJd ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "Syne, sans-serif", transition: "all 0.2s",
              boxShadow: !file || uploading || extractingJd ? "none" : "0 0 24px rgba(29, 158, 117, 0.35)",
            }}
          >
            {uploading ? (
              <><Loader2 size={18} className="animate-spin" /> Parsing & Auditing CV...</>
            ) : (
              "Start Comprehensive Audit →"
            )}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255, 255, 255, 0.4)", marginTop: 14 }}>13-Point Check (Spelling, Grammar, Impact, Gaps, Risks, Credibility) in ~15s</p>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 48, color: "var(--gray-500)" }}>Loading upload portal...</div>}>
      <UploadFormContent />
    </Suspense>
  );
}
