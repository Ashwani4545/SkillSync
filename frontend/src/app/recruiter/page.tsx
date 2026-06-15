"use client";
import { useState, useEffect, useRef } from "react";
import { Users, Upload, Search, Loader2, FileText, CheckCircle, AlertCircle, Download, Filter } from "lucide-react";
import { apiClient } from "@/lib/api";

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
    candidates.forEach(c => rows.push([c.name||"","", c.score??"", c.analysis_id||"", c.uploaded_at]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "candidates.csv"; a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Tab nav + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Recruiter Dashboard</h1>
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>{candidates.length} candidates · Team plan</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx" style={{ display: "none" }} onChange={handleBulkUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              style={{ padding: "9px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {uploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
              {uploading ? "Uploading..." : "Bulk upload"}
            </button>
            <button onClick={exportCSV} style={{ padding: "9px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Upload result */}
        {uploadResult && (
          <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <CheckCircle size={16} color="var(--teal-700)" />
            <span style={{ fontSize: 14, color: "var(--teal-700)" }}>
              Uploaded {uploadResult.count} resumes.
              {uploadResult.errors?.length > 0 && ` ${uploadResult.errors.length} failed.`}
            </span>
            <button onClick={() => setUploadResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 0, background: "var(--gray-100)", borderRadius: "var(--radius-md)", padding: 3, marginBottom: 24, width: "fit-content" }}>
          {(["candidates","screen"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "7px 20px", borderRadius: "var(--radius-md)", border: "none", background: tab === t ? "#fff" : "transparent", color: tab === t ? "var(--gray-900)" : "var(--gray-500)", fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
              {t === "candidates" ? `All candidates (${candidates.length})` : "Bulk screen"}
            </button>
          ))}
        </div>

        {/* CANDIDATES TAB */}
        {tab === "candidates" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
              <button onClick={selectAll} style={{ fontSize: 12, color: "var(--teal-700)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Select all</button>
              <span style={{ color: "var(--gray-300)" }}>·</span>
              <button onClick={clearAll} style={{ fontSize: 12, color: "var(--gray-400)", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
              {selectedIds.size > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teal-700)", background: "var(--teal-50)", padding: "3px 10px", borderRadius: 20 }}>{selectedIds.size} selected</span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Filter size={14} color="var(--gray-400)" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                  style={{ fontSize: 13, border: "none", background: "none", color: "var(--gray-600)", cursor: "pointer", outline: "none" }}>
                  <option value="score">Sort by score</option>
                  <option value="date">Sort by date</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                Loading candidates...
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState onUpload={() => fileInputRef.current?.click()} />
            ) : (
              <div>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 80px 120px 100px 80px", gap: 12, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>
                  <div />
                  <div>Candidate</div>
                  <div style={{ textAlign: "center" }}>Score</div>
                  <div>Analysis</div>
                  <div>Uploaded</div>
                  <div style={{ textAlign: "right" }}>Action</div>
                </div>
                {sorted.map((c, i) => (
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
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>
                  SELECT CANDIDATES TO SCREEN ({selectedIds.size} selected)
                </label>
                <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {candidates.map(c => (
                    <button key={c.resume_id} onClick={() => toggleSelect(c.resume_id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--radius-md)", border: `1.5px solid ${selectedIds.has(c.resume_id) ? "var(--teal-500)" : "var(--gray-200)"}`, background: selectedIds.has(c.resume_id) ? "var(--teal-50)" : "#fff", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedIds.has(c.resume_id) ? "var(--teal-500)" : "var(--gray-300)"}`, background: selectedIds.has(c.resume_id) ? "var(--teal-500)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selectedIds.has(c.resume_id) && <CheckCircle size={10} color="#fff" />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-900)" }}>{c.name || c.filename}</div>
                        {c.score && <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Previous score: {c.score}</div>}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button onClick={selectAll} style={{ fontSize: 12, color: "var(--teal-700)", background: "var(--teal-50)", border: "none", padding: "4px 10px", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}>All</button>
                  <button onClick={clearAll} style={{ fontSize: 12, color: "var(--gray-500)", background: "var(--gray-100)", border: "none", padding: "4px 10px", borderRadius: "var(--radius-md)", cursor: "pointer" }}>None</button>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", display: "block", marginBottom: 12 }}>JOB DESCRIPTION TO SCREEN AGAINST</label>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  style={{ width: "100%", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", outline: "none" }} />
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 6 }}>{jdText.length} characters</div>
              </div>
            </div>

            <button onClick={handleBulkScreen} disabled={selectedIds.size === 0 || !jdText.trim() || screening}
              style={{ padding: "14px 32px", borderRadius: "var(--radius-md)", border: "none", background: (selectedIds.size === 0 || !jdText.trim() || screening) ? "var(--gray-200)" : "var(--teal-700)", color: (selectedIds.size === 0 || !jdText.trim() || screening) ? "var(--gray-400)" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {screening
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Screening {selectedIds.size} candidates...</>
                : <><Search size={18} /> Screen {selectedIds.size} candidate{selectedIds.size !== 1 ? "s" : ""}</>
              }
            </button>

            {screenResult && (
              <div style={{ background: "var(--teal-50)", borderRadius: "var(--radius-lg)", padding: 20, marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <CheckCircle size={18} color="var(--teal-700)" />
                  <span style={{ fontWeight: 700, color: "var(--teal-700)", fontSize: 15 }}>Bulk screening started</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--gray-700)", margin: "0 0 8px" }}>
                  {screenResult.screened} resumes are being analyzed. Results will appear in the Candidates tab as they complete.
                </p>
                <button onClick={() => setTab("candidates")} style={{ fontSize: 13, color: "var(--teal-700)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
  const scoreColor = score >= 80 ? "var(--teal-700)" : score >= 60 ? "var(--amber-700)" : score ? "var(--coral-700)" : "var(--gray-400)";
  const scoreBg    = score >= 80 ? "var(--teal-50)"  : score >= 60 ? "var(--amber-50)"  : score ? "var(--coral-50)"  : "var(--gray-100)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 80px 120px 100px 80px", gap: 12, padding: "12px 16px", background: selected ? "var(--teal-50)" : "#fff", borderRadius: "var(--radius-md)", border: `1px solid ${selected ? "var(--teal-200)" : "var(--gray-200)"}`, marginBottom: 6, alignItems: "center" }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--teal-700)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={15} color="var(--gray-500)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{c.name || "Unknown"}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{c.filename}</div>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        {score ? (
          <span style={{ fontSize: 14, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: scoreBg, color: scoreColor, fontFamily: "Syne" }}>{score}</span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--gray-300)" }}>—</span>
        )}
      </div>
      <div>
        {c.analysis_id ? (
          <a href={`/analyze/result/${c.analysis_id}`} style={{ fontSize: 12, color: "var(--teal-700)", fontWeight: 600, textDecoration: "none" }}>View analysis →</a>
        ) : (
          <span style={{ fontSize: 12, color: "var(--gray-300)" }}>Not analyzed</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{new Date(c.uploaded_at).toLocaleDateString()}</div>
      <div style={{ textAlign: "right" }}>
        <a href={`/analyze/upload?resume_id=${c.resume_id}`} style={{ fontSize: 12, color: "var(--blue-700)", fontWeight: 600, textDecoration: "none" }}>Analyze</a>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: 64, background: "#fff", borderRadius: "var(--radius-xl)", border: "2px dashed var(--gray-200)" }}>
      <Users size={48} color="var(--gray-200)" style={{ margin: "0 auto 16px" }} />
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>No candidates yet</h3>
      <p style={{ color: "var(--gray-400)", marginBottom: 24 }}>Upload multiple resumes at once to start screening</p>
      <button onClick={onUpload} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: "var(--radius-md)", background: "var(--teal-700)", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        <Upload size={16} /> Bulk upload resumes
      </button>
    </div>
  );
}

function Header() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "0 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/dashboard" style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--teal-700)", textDecoration: "none" }}>ResumeAI</a>
        <span style={{ color: "var(--gray-300)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--gray-500)" }}>Recruiter Dashboard</span>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--amber-50)", color: "var(--amber-700)" }}>TEAM</span>
      </div>
    </div>
  );
}
