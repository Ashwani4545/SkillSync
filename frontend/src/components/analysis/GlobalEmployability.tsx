"use client";
import { useState } from "react";
import { Globe, MapPin, CheckCircle, ShieldAlert, FileText } from "lucide-react";

export function GlobalEmployability({ data }: { data: any }) {
  const [selectedCountry, setSelectedCountry] = useState("United States");

  const regions = [
    { country: "United States", code: "US", score: 92, photo: "Never include photo", length: "1-2 pages max", format: "Achievement & metrics focused" },
    { country: "Germany", code: "DE", score: 85, photo: "Headshot expected", length: "2 pages Lebenslauf", format: "Chronological + Personal Details" },
    { country: "United Kingdom", code: "UK", score: 88, photo: "Do not include photo", length: "2 pages max", format: "Personal Statement at top" },
    { country: "India", code: "IN", score: 90, photo: "Passport photo optional", length: "2-3 pages", format: "Projects section & career objective" },
    { country: "Canada", score: 89, code: "CA", photo: "Do not include photo", length: "1-2 pages", format: "Results-oriented summary" },
    { country: "Japan", score: 80, code: "JP", photo: "Passport photo required", length: "Standard Rirekisho", format: "Formal humble phrasing + motivation" },
  ];

  const currentRegion = regions.find(r => r.country === selectedCountry) || regions[0];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>Global Employability & Country-Specific Adaptation</h2>
        <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>
          Regional suitability ratings, visa/format requirements, and hiring conventions across major global markets.
        </p>
      </div>

      {/* Region Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 24 }}>
        {regions.map((r) => (
          <button
            key={r.country}
            onClick={() => setSelectedCountry(r.country)}
            style={{
              padding: 12, borderRadius: 12, border: `2px solid ${selectedCountry === r.country ? "var(--teal-600)" : "var(--gray-200)"}`,
              background: selectedCountry === r.country ? "var(--teal-50)" : "#fff", cursor: "pointer", textAlign: "center",
              transition: "all 0.15s"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--teal-800)", marginBottom: 4 }}>{r.code}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.country}</div>
          </button>
        ))}
      </div>

      {/* Region Detail Card */}
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-700)" }}>
              <Globe size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>{currentRegion.country} Market Suitability</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>Hiring standards and formatting rules</p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal-700)", fontFamily: "Syne" }}>
              {currentRegion.score}<span style={{ fontSize: 14, color: "var(--gray-400)" }}>/100</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-600)", textTransform: "uppercase" }}>Suitability Rating</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 4 }}>PHOTO REQUIREMENT</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>{currentRegion.photo}</div>
          </div>

          <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 4 }}>RECOMMENDED LENGTH</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>{currentRegion.length}</div>
          </div>

          <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 4 }}>FORMAT STYLE</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>{currentRegion.format}</div>
          </div>
        </div>

        <div style={{ background: "var(--blue-50)", borderRadius: 10, padding: 16, borderLeft: "4px solid var(--blue-500)", fontSize: 14, color: "var(--gray-800)", lineHeight: 1.5 }}>
          <strong>Regional Adaptation Advice:</strong> When submitting your resume for {currentRegion.country}, ensure your summary and bullet impact statements align with local recruitment conventions. {currentRegion.photo.includes("Never") ? "Avoid personal details (photo, age, marital status) to pass anti-bias checks." : "Ensure formal section layout."}
        </div>
      </div>
    </div>
  );
}
