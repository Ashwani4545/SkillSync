"use client";
import { useState, useEffect, useRef } from "react";
import { Users, Upload, Search, Loader2, FileText, CheckCircle, Download, Filter } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";

export default function RecruiterPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"candidates"|"screen">("candidates");
  const [jdText, setJdText]         = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [screening, setScreening]   = useState(false);
  const [screenResult, setScreenResult] = useState<any | null>(null);
  const [sortBy, setSortBy]         = useState<"score"|"date">("score");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const fetchCandidates = () => {
    setLoading(true);
    apiClient.get("/recruiter/candidates")
      .then(({ data }) => { setCandidates(data.candidates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCandidates(); }, []);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach(f => form.append("files", f));
    try {
      const { data } = await apiClient.post("/recruiter/bulk-upload", form);
      setUploadResult(data);
      fetchCandidates();
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleBulkScreen = async () => {
    if (!jdText.trim() || selectedIds.size === 0) return;
    setScreening(true);
    try {
      const { data } = await apiClient.post("/recruiter/screen", {
        resume_ids: Array.from(selectedIds),
        jd_text: jdText,
      });
      setScreenResult(data);
    } catch (e: any) {
      alert(e.message || "Screening failed");
    } finally {
      setScreening(false);
    }
  };

  const sorted = [...candidates].sort((a, b) =>
    sortBy === "score"
      ? (b.score ?? 0) - (a.score ?? 0)
      : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll  = () => setSelectedIds(new Set(candidates.map(c => c.resume_id)));
  const clearAll   = () => setSelectedIds(new Set());

  const exportCSV = () => {
    const rows = [["Name","File","Score","Analysis ID","Uploaded"]];
    candidates.forEach(c => rows.push([c.name||"", c.filename||"", c.score??"", c.analysis_id||"", c.uploaded_at]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "candidates.csv"; a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 60%), #0A0F1E", color: "#ffffff" }}>
      <PageHeader title="Recruiter Dashboard" badge="TEAM" badgeColor="#FBBF24" />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Tab nav + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4, fontFamily: "Syne, sans-serif", color: "#ffffff" }}>Recruiter Dashboard</h1>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>{candidates.length} candidates · Team plan</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx" style={{ display: "none" }} onChange={handleBulkUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease" }}>
              {uploading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={15} />}
              {uploading ? "Uploading..." : "Bulk upload"}
            </button>
            <button onClick={exportCSV} style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease" }}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Upload result */}
        {uploadResult && (
          <div style={{ background: "rgba(45, 212, 191, 0.1)", border: "1px solid rgba(45, 212, 191, 0.3)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <CheckCircle size={18} color="#2DD4BF" />
            <span style={{ fontSize: 14, color: "#2DD4BF" }}>
              Uploaded {uploadResult.count} resumes.
              {uploadResult.errors?.length > 0 && ` ${uploadResult.errors.length} failed.`}
            </span>
            <button onClick={() => setUploadResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
          {(["candidates","screen"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: tab === t ? "rgba(255, 255, 255, 0.1)" : "transparent", color: tab === t ? "#FFFFFF" : "#94A3B8", fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
              {t === "candidates" ? `All candidates (${candidates.length})` : "Bulk screen"}
            </button>
          ))}
        </div>

        {/* CANDIDATES TAB */}
        {tab === "candidates" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
              <button onClick={selectAll} style={{ fontSize: 12, color: "#2DD4BF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Select all</button>
              <span style={{ color: "#64748B" }}>·</span>
              <button onClick={clearAll} style={{ fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
              {selectedIds.size > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#2DD4BF", background: "rgba(45, 212, 191, 0.15)", padding: "3px 12px", borderRadius: 20, border: "1px solid rgba(45, 212, 191, 0.3)" }}>{selectedIds.size} selected</span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <Filter size={14} color="#94A3B8" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                  style={{ fontSize: 13, border: "none", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", cursor: "pointer", outline: "none", padding: "4px 8px", borderRadius: 8 }}>
                  <option value="score" style={{ background: "#0F172A" }}>Sort by score</option>
                  <option value="date" style={{ background: "#0F172A" }}>Sort by date</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 64, color: "#94A3B8" }}>
                <Loader2 size={28} color="#2DD4BF" style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                Loading candidates...
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState onUpload={() => fileInputRef.current?.click()} />
            ) : (
              <div>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 90px 140px 110px 90px", gap: 12, padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <div />
                  <div>Candidate</div>
                  <div style={{ textAlign: "center" }}>Score</div>
                  <div>Analysis</div>
                  <div>Uploaded</div>
                  <div style={{ textAlign: "right" }}>Action</div>
                </div>
                {sorted.map((c) => (
                  <CandidateRow key={c.resume_id} c={c} selected={selectedIds.has(c.resume_id)} onToggle={() => toggleSelect(c.resume_id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* BULK SCREEN TAB */}
        {tab === "screen" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>
                  SELECT CANDIDATES TO SCREEN ({selectedIds.size} selected)
                </label>
                <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {candidates.map(c => (
                    <button key={c.resume_id} onClick={() => toggleSelect(c.resume_id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${selectedIds.has(c.resume_id) ? "#1D9E75" : "rgba(255, 255, 255, 0.08)"}`, background: selectedIds.has(c.resume_id) ? "rgba(29, 158, 117, 0.15)" : "rgba(255, 255, 255, 0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selectedIds.has(c.resume_id) ? "#2DD4BF" : "rgba(255, 255, 255, 0.2)"}`, background: selectedIds.has(c.resume_id) ? "#2DD4BF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selectedIds.has(c.resume_id) && <CheckCircle size={12} color="#000" />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{c.name || c.filename}</div>
                        {c.score && <div style={{ fontSize: 11, color: "#94A3B8" }}>Previous score: {c.score}</div>}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button onClick={selectAll} style={{ fontSize: 12, color: "#2DD4BF", background: "rgba(45, 212, 191, 0.15)", border: "1px solid rgba(45, 212, 191, 0.3)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>All</button>
                  <button onClick={clearAll} style={{ fontSize: 12, color: "#94A3B8", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "6px 14px", borderRadius: 8, cursor: "pointer" }}>None</button>
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>JOB DESCRIPTION TO SCREEN AGAINST</label>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(0, 0, 0, 0.25)", color: "#FFFFFF", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", outline: "none" }} />
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>{jdText.length} characters</div>
              </div>
            </div>

            <button onClick={handleBulkScreen} disabled={selectedIds.size === 0 || !jdText.trim() || screening}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: (selectedIds.size === 0 || !jdText.trim() || screening) ? "rgba(255, 255, 255, 0.08)" : "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: (selectedIds.size === 0 || !jdText.trim() || screening) ? "#64748B" : "#fff", fontSize: 15, fontWeight: 700, cursor: (selectedIds.size === 0 || !jdText.trim() || screening) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: (selectedIds.size > 0 && jdText.trim() && !screening) ? "0 0 20px rgba(29, 158, 117, 0.3)" : "none", transition: "all 0.2s ease" }}>
              {screening
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Screening {selectedIds.size} candidates...</>
                : <><Search size={18} /> Screen {selectedIds.size} candidate{selectedIds.size !== 1 ? "s" : ""}</>
              }
            </button>

            {screenResult && (
              <div style={{ background: "rgba(45, 212, 191, 0.1)", border: "1px solid rgba(45, 212, 191, 0.3)", borderRadius: 18, padding: 22, marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <CheckCircle size={18} color="#2DD4BF" />
                  <span style={{ fontWeight: 700, color: "#2DD4BF", fontSize: 15 }}>Bulk screening started</span>
                </div>
                <p style={{ fontSize: 14, color: "#CBD5E1", margin: "0 0 10px" }}>
                  {screenResult.screened} resumes are being analyzed. Results will appear in the Candidates tab as they complete.
                </p>
                <button onClick={() => setTab("candidates")} style={{ fontSize: 13, color: "#2DD4BF", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  → View candidates
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateRow({ c, selected, onToggle }: { c: any; selected: boolean; onToggle: () => void }) {
  const score = c.score;
  const scoreColor = score >= 80 ? "#2DD4BF" : score >= 60 ? "#FBBF24" : score ? "#F87171" : "#64748B";
  const scoreBg    = score >= 80 ? "rgba(45, 212, 191, 0.15)"  : score >= 60 ? "rgba(251, 191, 36, 0.15)"  : score ? "rgba(248, 113, 113, 0.15)"  : "rgba(255, 255, 255, 0.05)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 90px 140px 110px 90px", gap: 12, padding: "14px 18px", background: selected ? "rgba(29, 158, 117, 0.12)" : "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", borderRadius: 14, border: `1px solid ${selected ? "rgba(45, 212, 191, 0.4)" : "rgba(255, 255, 255, 0.08)"}`, marginBottom: 8, alignItems: "center" }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#1D9E75" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={16} color="#94A3B8" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#FFFFFF" }}>{c.name || "Unknown"}</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>{c.filename}</div>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        {score ? (
          <span style={{ fontSize: 14, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: scoreBg, color: scoreColor, fontFamily: "Syne, sans-serif", border: `1px solid ${scoreColor}40` }}>{score}</span>
        ) : (
          <span style={{ fontSize: 12, color: "#64748B" }}>—</span>
        )}
      </div>
      <div>
        {c.analysis_id ? (
          <a href={`/analyze/result/${c.analysis_id}`} style={{ fontSize: 12.5, color: "#2DD4BF", fontWeight: 600, textDecoration: "none" }}>View analysis →</a>
        ) : (
          <span style={{ fontSize: 12, color: "#64748B" }}>Not analyzed</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8" }}>{new Date(c.uploaded_at).toLocaleDateString()}</div>
      <div style={{ textAlign: "right" }}>
        <a href={`/analyze/upload?resume_id=${c.resume_id}`} style={{ fontSize: 12.5, color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>Analyze</a>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: 64, background: "rgba(255, 255, 255, 0.02)", borderRadius: 20, border: "2px dashed rgba(255, 255, 255, 0.12)" }}>
      <Users size={48} color="#64748B" style={{ margin: "0 auto 16px" }} />
      <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Syne, sans-serif", color: "#FFFFFF", marginBottom: 8 }}>No candidates yet</h3>
      <p style={{ color: "#94A3B8", marginBottom: 24 }}>Upload multiple resumes at once to start screening</p>
      <button onClick={onUpload} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 0 20px rgba(29, 158, 117, 0.35)" }}>
        <Upload size={16} /> Bulk upload resumes
      </button>
    </div>
  );
}
