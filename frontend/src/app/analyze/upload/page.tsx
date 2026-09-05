"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Briefcase, Code, FileCode, CheckCircle, ShieldCheck, RefreshCw, FolderOpen } from "lucide-react";
import { apiClient } from "@/lib/api";

function UploadFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUniversalModeParam = searchParams.get("mode") === "universal";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Universal mode state
  const [isUniversalMode, setIsUniversalMode] = useState(isUniversalModeParam);

  // Target Job Info states
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

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setError("");
      setFile(selected);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) e.target.value = "";
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setError("");
      setFile(droppedFile);
    }
  };

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
      if (e.target) e.target.value = "";
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
      const errorText = typeof detailMsg === "string" ? detailMsg : detailMsg ? JSON.stringify(detailMsg) : (e?.message || "Upload or analysis initiation failed. Please check backend connection.");
      setError(errorText);
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 680, background: "#ffffff", borderRadius: "24px", boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.12)", padding: "40px", border: "1px solid #E2E8F0" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: "var(--teal-700)", textTransform: "uppercase", background: "var(--teal-50)", border: "1px solid var(--teal-100)", padding: "6px 16px", borderRadius: 20 }}>
            Enterprise AI Resume Auditor
          </span>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--gray-900)", marginTop: 12, marginBottom: 8, fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}>
            Audit & Benchmark Resume
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>
            Identify ATS keywords, recruiter friction, metric improvements, and career calibration.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: "var(--gray-100)", borderRadius: 14 }}>
          <button
            type="button"
            onClick={() => setIsUniversalMode(false)}
            style={{
              flex: 1, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: !isUniversalMode ? "#ffffff" : "transparent", color: !isUniversalMode ? "var(--teal-800)" : "var(--gray-500)",
              boxShadow: !isUniversalMode ? "0 2px 8px rgba(15, 23, 42, 0.06)" : "none", transition: "all 0.2s"
            }}
          >
            Targeted Job Role & Skills
          </button>
          <button
            type="button"
            onClick={() => setIsUniversalMode(true)}
            style={{
              flex: 1, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: isUniversalMode ? "var(--teal-700)" : "transparent", color: isUniversalMode ? "#ffffff" : "var(--gray-500)",
              boxShadow: isUniversalMode ? "0 2px 8px rgba(15, 110, 86, 0.2)" : "none", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}
          >
            <ShieldCheck size={16} /> Universal ATS Check (No Role/Skills)
          </button>
        </div>

        {error && (
          <div style={{ padding: "14px 18px", background: "var(--coral-50)", borderLeft: "4px solid var(--coral-500)", borderRadius: "10px", color: "var(--coral-700)", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 32 }}>
          
          {/* Target Role & Skills Input Group */}
          {!isUniversalMode ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Briefcase size={14} color="var(--teal-600)" /> Target Role *
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Engineer"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", background: "#fff", transition: "all 0.2s" }}
                />
              </div>
              
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Code size={14} color="var(--teal-600)" /> Demanded Skills *
                </label>
                <input
                  type="text"
                  value={demandedSkills}
                  onChange={(e) => setDemandedSkills(e.target.value)}
                  placeholder="e.g. React, Python, Docker"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", background: "#fff", transition: "all 0.2s" }}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: "12px 16px", background: "var(--teal-50)", border: "1px solid var(--teal-100)", borderRadius: "12px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--teal-800)" }}>
              <ShieldCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />
              <span><strong>Universal Mode Active:</strong> Audits CV parseability, keyword density, section structure, and formatting quality without assuming a specific job role.</span>
            </div>
          )}

          {/* Resume Upload Box */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Upload Resume (CV)
              </label>
              <span style={{ fontSize: 11, color: "var(--gray-400)" }}>PDF, DOCX up to 15MB</span>
            </div>

            {/* Hidden native input */}
            <input
              type="file"
              id="resume-file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              style={{ display: "none" }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragOver ? "var(--teal-500)" : file ? "var(--teal-600)" : "var(--gray-300)"}`,
                borderRadius: "16px",
                background: isDragOver ? "var(--teal-50)" : file ? "#F0FDF4" : "#F8FAFC",
                padding: "32px 20px",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              {file ? (
                <div>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--teal-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <FileText size={28} color="var(--teal-700)" />
                  </div>
                  <p style={{ fontWeight: 700, color: "var(--gray-900)", marginBottom: 4, fontSize: 15 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 14 }}>{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                  
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "var(--teal-800)",
                        background: "#ffffff", border: "1px solid var(--teal-200, #B8E6D5)", borderRadius: 8,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                      }}
                    >
                      <RefreshCw size={14} /> Change file
                    </button>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      style={{
                        padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "var(--coral-700)",
                        background: "var(--coral-50)", border: "1px solid var(--coral-100)", borderRadius: 8,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
                      }}
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Upload size={28} color="var(--teal-700)" />
                  </div>
                  <p style={{ fontWeight: 700, color: "var(--gray-800)", marginBottom: 4, fontSize: 15 }}>
                    {isDragOver ? "Drop your resume file here" : "Drag & drop your resume file"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>
                    Supports PDF and DOCX formats with instant OCR extraction
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 24px",
                      borderRadius: "10px",
                      background: "var(--gray-900)",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      boxShadow: "0 4px 10px rgba(15, 23, 42, 0.15)",
                    }}
                  >
                    <FolderOpen size={16} /> Browse File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Job Description section */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setShowJD(!showJD)}
              style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--gray-700)", fontWeight: 600 }}
            >
              <span>Add Job Description <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional — improves matching)</span></span>
              {showJD ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showJD && (
              <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* JD file upload */}
                <div style={{ border: "1px dashed var(--gray-200)", borderRadius: "12px", padding: 16, background: "var(--gray-50)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                    Upload JD Document or Screenshot (PNG/JPG/PDF)
                  </span>
                  
                  {jdFile ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                      <FileCode size={20} color="var(--teal-700)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{jdFile.name}</p>
                        <p style={{ fontSize: 11, color: "var(--gray-400)", margin: 0 }}>{(jdFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {extractingJd ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--teal-700)" }}>
                          <Loader2 size={12} className="animate-spin" /> Extracting...
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--teal-700)" }}>
                          <CheckCircle size={14} /> Extracted
                        </div>
                      )}
                      <button type="button" onClick={handleRemoveJdFile} style={{ background: "none", border: "none", color: "var(--coral-500)", cursor: "pointer", padding: 4 }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: "block", cursor: "pointer" }}>
                      <input
                        type="file"
                        onChange={handleJdFileChange}
                        accept="application/pdf,image/png,image/jpeg,image/jpg"
                        style={{ display: "none" }}
                      />
                      <div style={{ padding: "12px", border: "1px solid var(--gray-200)", background: "#fff", borderRadius: 8, textAlign: "center", fontSize: 13, color: "var(--gray-600)", fontWeight: 500 }}>
                        Choose PDF, Image or Screenshot of the JD
                      </div>
                    </label>
                  )}
                </div>

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--gray-400)", fontWeight: 700 }}>— OR PASTE TEXT DIRECTLY —</div>

                {/* JD text area */}
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the Job Description text here..."
                  rows={5}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--gray-200)", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", color: "var(--gray-700)", outline: "none", background: "#fff" }}
                />
              </div>
            )}
          </div>

        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || uploading || extractingJd}
          style={{
            width: "100%", padding: "18px", borderRadius: "14px", border: "none",
            background: !file || uploading || extractingJd ? "var(--gray-200)" : "linear-gradient(135deg, var(--teal-700) 0%, var(--teal-600) 100%)",
            color: !file || uploading || extractingJd ? "var(--gray-400)" : "#ffffff",
            fontSize: 16, fontWeight: 700, cursor: !file || uploading || extractingJd ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Syne, sans-serif", transition: "all 0.2s ease",
            boxShadow: !file || uploading || extractingJd ? "none" : "0 8px 20px rgba(15, 110, 86, 0.25)",
          }}
        >
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Parsing & Auditing CV with AI...</>
          ) : (
            "Start Comprehensive Audit →"
          )}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)", marginTop: 14 }}>
          13-Point Check (Spelling, Grammar, Impact, Gaps, Risks, Credibility) in ~15s
        </p>
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
