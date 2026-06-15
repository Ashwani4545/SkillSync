"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Briefcase, Code, FileCode, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  
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
    if (!targetRole.trim()) {
      setError("Target job role is required to analyze your CV contextually.");
      return;
    }
    if (!demandedSkills.trim()) {
      setError("Please specify the demanded skills for this role.");
      return;
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
        jd_text: jdText || null,
        target_role: targetRole,
        demanded_skills: demandedSkills,
      });

      router.push(`/analyze/result/${analysis.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Upload or analysis initiation failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 650, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "40px", border: "1px solid rgba(255,255,255,0.8)" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "var(--teal-700)", textTransform: "uppercase", background: "var(--teal-50)", padding: "6px 16px", borderRadius: 20 }}>Interactive CV Auditor</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--gray-900)", marginTop: 12, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Audit Your Resume</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15 }}>Find mistakes, grammar issues, quantify impact, and adapt your CV directly to a job role.</p>
        </div>

        {error && (
          <div style={{ padding: "14px 18px", background: "var(--coral-50)", borderLeft: "4px solid var(--coral-500)", borderRadius: "8px", color: "var(--coral-800)", fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
          
          {/* Target Role & Skills Input Group */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Briefcase size={14} color="var(--teal-600)" /> Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Web Developer"
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", background: "#fff", transition: "all 0.2s" }}
              />
            </div>
            
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Code size={14} color="var(--teal-600)" /> Demanded Skills
              </label>
              <input
                type="text"
                value={demandedSkills}
                onChange={(e) => setDemandedSkills(e.target.value)}
                placeholder="e.g. React, Node.js, AWS"
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none", background: "#fff", transition: "all 0.2s" }}
              />
            </div>
          </div>

          {/* Resume Dropzone */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Upload Resume (CV)
            </label>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? "var(--teal-500)" : file ? "var(--teal-500)" : "var(--gray-200)"}`,
                borderRadius: "16px",
                background: isDragActive ? "var(--teal-50)" : file ? "var(--teal-50)20" : "#fff",
                padding: "36px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <FileText size={44} color="var(--teal-700)" style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontWeight: 600, color: "var(--gray-900)", marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: "var(--gray-400)" }}>{(file.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={{ marginTop: 12, fontSize: 12, color: "var(--coral-500)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <X size={12} /> Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={40} color="var(--gray-300)" style={{ margin: "0 auto 14px" }} />
                  <p style={{ fontWeight: 600, color: "var(--gray-700)", marginBottom: 4 }}>{isDragActive ? "Drop the resume here" : "Drag & drop your resume file"}</p>
                  <p style={{ fontSize: 13, color: "var(--gray-400)" }}>PDF or DOCX · Up to 10 MB</p>
                  <div style={{ marginTop: 14, display: "inline-block", padding: "6px 18px", borderRadius: "8px", background: "var(--gray-100)", color: "var(--gray-600)", fontSize: 13, fontWeight: 500 }}>Browse File</div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description section */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
            <button
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
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "block", marginBottom: 8 }}>UPLOAD JD DOCUMENT OR IMAGE (PNG/JPG/PDF)</span>
                  
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
                      <button onClick={handleRemoveJdFile} style={{ background: "none", border: "none", color: "var(--coral-500)", cursor: "pointer", padding: 4 }}>
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
                      <div style={{ padding: "12px", border: "1px solid var(--gray-200)", background: "#fff", borderRadius: 8, textAlign: "center", fontSize: 13, color: "var(--gray-600)", fontWeight: 500 }}>
                        Choose PDF, Image or Screenshot of the JD
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--gray-400)", fontWeight: 600 }}>— OR PASTE TEXT DIRECTLY —</div>

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
          onClick={handleSubmit}
          disabled={!file || uploading || extractingJd}
          style={{
            width: "100%", padding: "18px", borderRadius: "12px", border: "none",
            background: !file || uploading || extractingJd ? "var(--gray-200)" : "var(--teal-700)",
            color: !file || uploading || extractingJd ? "var(--gray-400)" : "#fff",
            fontSize: 16, fontWeight: 700, cursor: !file || uploading || extractingJd ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Syne, sans-serif", transition: "all 0.2s",
            boxShadow: !file || uploading || extractingJd ? "none" : "0 8px 16px rgba(13, 148, 136, 0.2)",
          }}
        >
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Parsing & Auditing CV...</>
          ) : (
            "Start Comprehensive Audit →"
          )}
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--gray-400)", marginTop: 14 }}>13-Point Check (Spelling, Grammar, Impact, Gaps, Risks, Credibility) in ~15s</p>
      </div>
    </div>
  );
}
