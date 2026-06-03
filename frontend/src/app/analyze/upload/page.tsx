"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    setError("");
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (r) => setError(r[0]?.errors[0]?.message || "Invalid file"),
  });

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const { data: resume } = await apiClient.post("/resume/upload", form);

      const { data: analysis } = await apiClient.post("/analysis/start", {
        resume_id: resume.id,
        jd_text: jdText || null,
      });

      router.push(`/analyze/result/${analysis.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 600 }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Analyze your resume</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 16 }}>Upload your PDF or DOCX. Get results in under 30 seconds.</p>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "var(--teal-500)" : file ? "var(--teal-500)" : "var(--gray-200)"}`,
            borderRadius: "var(--radius-xl)",
            background: isDragActive ? "var(--teal-50)" : file ? "var(--teal-50)" : "#fff",
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: 16,
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <FileText size={40} color="var(--teal-700)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 600, color: "var(--gray-900)", marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontSize: 13, color: "var(--gray-400)" }}>{(file.size / 1024).toFixed(0)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                style={{ marginTop: 12, fontSize: 12, color: "var(--coral-500)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <div>
              <Upload size={40} color="var(--gray-300)" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontWeight: 600, color: "var(--gray-700)", marginBottom: 6 }}>{isDragActive ? "Drop it here" : "Drag & drop your resume"}</p>
              <p style={{ fontSize: 14, color: "var(--gray-400)" }}>PDF or DOCX · Max 10 MB</p>
              <div style={{ marginTop: 16, display: "inline-block", padding: "8px 20px", borderRadius: "var(--radius-md)", background: "var(--gray-100)", color: "var(--gray-600)", fontSize: 13, fontWeight: 500 }}>Browse files</div>
            </div>
          )}
        </div>

        {/* Optional JD */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", marginBottom: 16, overflow: "hidden" }}>
          <button
            onClick={() => setShowJD(!showJD)}
            style={{ width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--gray-700)", fontWeight: 500 }}
          >
            <span>Add job description <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional — improves keyword matching)</span></span>
            {showJD ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showJD && (
            <div style={{ padding: "0 20px 16px" }}>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", color: "var(--gray-700)", outline: "none" }}
              />
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--coral-50)", borderRadius: "var(--radius-md)", color: "var(--coral-700)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          style={{
            width: "100%", padding: "16px", borderRadius: "var(--radius-md)", border: "none",
            background: !file || uploading ? "var(--gray-200)" : "var(--teal-700)",
            color: !file || uploading ? "var(--gray-400)" : "#fff",
            fontSize: 16, fontWeight: 700, cursor: !file || uploading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Syne, sans-serif", transition: "background 0.2s",
          }}
        >
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing your resume...</>
          ) : (
            "Analyze my resume →"
          )}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)", marginTop: 12 }}>Results in ~20 seconds · Your data is encrypted</p>
      </div>
    </div>
  );
}
