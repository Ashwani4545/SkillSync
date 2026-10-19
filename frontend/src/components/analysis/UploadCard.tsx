"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, X, ArrowRight } from "lucide-react";

interface UploadCardProps {
  onUploadFile?: (file: File) => void;
  onPasteText?: (text: string) => void;
  onUseSample?: () => void;
  isLoading?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = [".doc", ".docx", ".pdf", ".html", ".rtf", ".txt"];

export function UploadCard({
  onUploadFile,
  onPasteText,
  onUseSample,
  isLoading = false,
  className = "",
}: UploadCardProps) {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Invalid file type (${ext}). Please upload DOC, DOCX, PDF, HTML, RTF, or TXT.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a smaller file.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "file") {
      if (!selectedFile) {
        setError("Please choose a resume file to upload.");
        return;
      }
      onUploadFile?.(selectedFile);
    } else {
      if (!pastedText.trim() || pastedText.trim().length < 50) {
        setError("Please paste a resume with at least 50 characters.");
        return;
      }
      onPasteText?.(pastedText);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl overflow-hidden ${className}`}
    >
      {/* Top Tabs */}
      <div
        role="tablist"
        aria-label="Resume input method"
        className="flex border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]"
      >
        <button
          type="button"
          role="tab"
          id="tab-upload-file"
          aria-selected={activeTab === "file"}
          aria-controls="panel-upload-file"
          onClick={() => {
            setActiveTab("file");
            setError(null);
          }}
          className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "file"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Upload size={14} /> Upload file
        </button>

        <button
          type="button"
          role="tab"
          id="tab-paste-text"
          aria-selected={activeTab === "text"}
          aria-controls="panel-paste-text"
          onClick={() => {
            setActiveTab("text");
            setError(null);
          }}
          className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "text"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FileText size={14} /> Paste text
        </button>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === "file" ? (
            /* Upload File Panel */
            <div id="panel-upload-file" role="tabpanel" aria-labelledby="tab-upload-file">
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.pdf,.html,.rtf,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-input"
              />

              {!selectedFile ? (
                /* Drag & Drop Zone */
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload resume by dragging and dropping or clicking to browse"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    dragActive
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 scale-[0.99]"
                      : "border-gray-300 dark:border-white/15 hover:border-teal-500/80 dark:hover:border-teal-400/80 bg-gray-50/30 dark:bg-white/[0.01]"
                  }`}
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 shadow-xs">
                    <Upload size={24} />
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Drop your resume here or{" "}
                    <span className="text-teal-600 dark:text-teal-400 underline decoration-teal-500/50 underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Supports DOC, DOCX, PDF, HTML, RTF, TXT (Max 5 MB)
                  </p>
                </div>
              ) : (
                /* Selected File Preview */
                <div className="border border-teal-200 dark:border-teal-800/60 rounded-xl p-5 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready to scan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    aria-label="Remove selected file"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Paste Text Panel */
            <div id="panel-paste-text" role="tabpanel" aria-labelledby="tab-paste-text">
              <label htmlFor="paste-resume-textarea" className="sr-only">
                Paste resume text
              </label>
              <textarea
                id="paste-resume-textarea"
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your resume content here (summary, experience, skills, education)..."
                className="w-full text-sm p-4 rounded-xl border border-gray-200 dark:border-white/15 bg-gray-50/50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                <span>Min 50 characters</span>
                <span>{pastedText.length} characters</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || (activeTab === "file" && !selectedFile)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing resume...
                </>
              ) : (
                <>
                  Scan resume now <ArrowRight size={15} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onUseSample}
              disabled={isLoading}
              className="w-full sm:w-auto py-3.5 px-5 rounded-full font-semibold text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-white/5 border border-teal-200 dark:border-white/10 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Sparkles size={14} /> Use the sample resume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
