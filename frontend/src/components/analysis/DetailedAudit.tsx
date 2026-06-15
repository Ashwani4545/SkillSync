"use client";
import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Search,
  Percent,
  Repeat,
  List,
  Layout,
  Mail,
  ArrowUpDown,
  Palette,
  Calendar,
  ShieldCheck,
  Activity,
  FileCheck,
} from "lucide-react";

interface AuditSection {
  status: "pass" | "warning" | "fail";
  [key: string]: any;
}

interface AuditData {
  score: number;
  parsing: AuditSection;
  spelling_grammar: AuditSection;
  quantify_impact: AuditSection;
  repetitions: AuditSection;
  bullets_consistency: AuditSection;
  essential_sections: AuditSection;
  contact_info: AuditSection;
  section_ordering: AuditSection;
  design_check: AuditSection;
  email_header_filename: AuditSection;
  dates_links_headings: AuditSection;
  credibility_verification: AuditSection;
  risk_benchmarking_gaps: {
    interview_risk: string;
    peer_benchmarking_percentile: number;
    linkedin_match_status: string;
    ageism_date_bias_risk: string;
    employment_gaps: any[];
    career_progression: string;
    skill_evidence_score: number;
    leadership_signals: string[];
    issues: string[];
    [key: string]: any;
  };
}

const CHECKPOINTS = [
  { id: "parsing",                 label: "1. CV Parsing",             icon: <Search size={16} />,             desc: "Section boundary & keyword extraction readability" },
  { id: "spelling_grammar",        label: "2. Spelling & Grammar",      icon: <FileCheck size={16} />,          desc: "Full document spellcheck and syntax rules" },
  { id: "quantify_impact",         label: "3. Quantify Impact",        icon: <Percent size={16} />,            desc: "Use of numeric outcomes, percentage gains, and metrics" },
  { id: "repetitions",             label: "4. Word Repetition",        icon: <Repeat size={16} />,             desc: "Analysis of redundant buzzwords or bullet starters" },
  { id: "bullets_consistency",     label: "5. Bullets & Layout",       icon: <List size={16} />,               desc: "Formatting, length and punctuation consistency" },
  { id: "essential_sections",      label: "6. Essential Sections",      icon: <Layout size={16} />,             desc: "Presence of summary, experience, education, skills" },
  { id: "contact_info",            label: "7. Contact Layout",         icon: <Mail size={16} />,               desc: "Formatting check for emails, phone, locations, handles" },
  { id: "section_ordering",        label: "8. Section Hierarchy",      icon: <ArrowUpDown size={16} />,        desc: "Logical order of blocks for recruiters" },
  { id: "design_check",            label: "9. Design & Density",       icon: <Palette size={16} />,            desc: "Estimated pages, word density, readability" },
  { id: "email_header_filename",   label: "10. Headers & Filename",    icon: <Mail size={16} />,               desc: "Email format validity, filename professionalism, header links" },
  { id: "dates_links_headings",    label: "11. Dates & Heading Links", icon: <Calendar size={16} />,           desc: "Consistency of dates, links in projects/certificates" },
  { id: "credibility_verification", label: "12. Skill Credibility",     icon: <ShieldCheck size={16} />,        desc: "Cross-referencing skills against experience details" },
  { id: "risk_benchmarking_gaps",  label: "13. Gaps & Risk Analysis",  icon: <Activity size={16} />,           desc: "Interview risk, employment gaps, career path, ageism risk" },
];

export function DetailedAudit({ data }: { data: AuditData }) {
  const [active, setActive] = useState("parsing");
  if (!data) return <EmptyState />;

  const sectionData = active === "risk_benchmarking_gaps" ? data.risk_benchmarking_gaps : (data[active as keyof AuditData] as AuditSection);
  const checkpoint = CHECKPOINTS.find((c) => c.id === active)!;

  // Determine section status for risk dimension specially
  const getSectionStatus = (id: string) => {
    if (id === "risk_benchmarking_gaps") {
      const risks = data.risk_benchmarking_gaps;
      if (!risks) return "pass";
      if (risks.interview_risk === "high" || (risks.issues && risks.issues.length > 2)) return "fail";
      if (risks.interview_risk === "medium" || (risks.issues && risks.issues.length > 0)) return "warning";
      return "pass";
    }
    const sec = data[id as keyof AuditData] as AuditSection;
    return sec?.status ?? "pass";
  };

  const statusIcon = (status: "pass" | "warning" | "fail") => {
    if (status === "pass") return <CheckCircle size={16} color="var(--teal-600)" />;
    if (status === "warning") return <AlertTriangle size={16} color="var(--amber-600)" />;
    return <XCircle size={16} color="var(--coral-600)" />;
  };

  const statusBadge = (status: "pass" | "warning" | "fail") => {
    const bg = status === "pass" ? "var(--teal-50)" : status === "warning" ? "var(--amber-50)" : "var(--coral-50)";
    const color = status === "pass" ? "var(--teal-700)" : status === "warning" ? "var(--amber-700)" : "var(--coral-700)";
    return (
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", background: bg, color, padding: "4px 12px", borderRadius: 12 }}>
        {status === "pass" ? "Passed" : status === "warning" ? "Needs Attention" : "Failed / Missing"}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, margin: 0 }}>Comprehensive 13-Point Audit</h2>
        <span style={{ fontSize: 13, background: "var(--teal-700)", color: "#fff", padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
          Score: {data.score ?? 0} / 100
        </span>
      </div>
      <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 28 }}>
        A complete checklist analysis matching your CV formatting, contents, spelling, credibility, and recruiter screening benchmarks.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Checkpoint Selector List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", padding: 12, borderRadius: "16px", border: "1px solid var(--gray-200)" }}>
          {CHECKPOINTS.map((cp) => {
            const status = getSectionStatus(cp.id);
            const isSelected = active === cp.id;
            return (
              <button
                key={cp.id}
                onClick={() => setActive(cp.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "8px",
                  border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  background: isSelected ? "var(--teal-50)" : "none",
                  color: isSelected ? "var(--teal-800)" : "var(--gray-700)",
                  fontWeight: isSelected ? 600 : 500, fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "var(--teal-700)" : "var(--gray-400)" }}>
                  {cp.icon}
                </div>
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cp.label}</span>
                {statusIcon(status)}
              </button>
            );
          })}
        </div>

        {/* Right Details Panel */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--gray-200)", padding: 28, minHeight: 450, display: "flex", flexDirection: "column" }}>
          
          {/* Section Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--gray-100)", paddingBottom: 20, marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, margin: "0 0 4px" }}>{checkpoint.label}</h3>
              <p style={{ fontSize: 13, color: "var(--gray-400)", margin: 0 }}>{checkpoint.desc}</p>
            </div>
            {statusBadge(getSectionStatus(active))}
          </div>

          {/* Details Content by Checkpoint */}
          <div style={{ flex: 1 }}>
            {active === "parsing" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Our parser reads sections to simulate applicant tracking systems (ATS). Clear text rendering ensures matching algorithms successfully identify your skills.
                </p>
                <div style={{ background: "var(--gray-50)", padding: 16, borderRadius: 8, marginTop: 16, borderLeft: "4px solid var(--teal-500)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 4 }}>PARSED STRUCTURE DETAILS</div>
                  <div style={{ fontSize: 14, color: "var(--gray-800)", fontWeight: 500 }}>{sectionData.details}</div>
                </div>
              </div>
            )}

            {active === "spelling_grammar" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  A single spelling or grammatical typo can lead to instant CV rejection by HR screeners. 
                </p>
                {sectionData.errors?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    {sectionData.errors.map((err: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, background: "var(--coral-50)", color: "var(--coral-800)", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid var(--coral-100)" }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10, background: "var(--teal-50)", color: "var(--teal-800)", padding: 16, borderRadius: 8, fontSize: 14, marginTop: 16 }}>
                    <CheckCircle size={18} />
                    <span>Fantastic! No spelling or grammatical mistakes detected in the analyzed portions.</span>
                  </div>
                )}
              </div>
            )}

            {active === "quantify_impact" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Show results, not responsibilities. We count metrics (%, $, scale metrics) inside experience descriptions.
                </p>
                <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
                  <div style={{ flex: 1, background: "var(--gray-50)", padding: "16px 20px", borderRadius: 12, textAlign: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Quantified Bullets</span>
                    <h4 style={{ fontSize: 28, margin: "4px 0 0", color: "var(--teal-700)" }}>{sectionData.quantified_percentage}%</h4>
                  </div>
                  <div style={{ flex: 2, display: "flex", alignItems: "center", fontSize: 13, color: "var(--gray-500)" }}>
                    {sectionData.quantified_percentage >= 50 
                      ? "Excellent metric usage. The majority of your experience bullet points have numbers." 
                      : "We recommend aiming for at least 50% quantification across all job listings."}
                  </div>
                </div>
                {sectionData.issues?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 8 }}>ISSUES DETECTED</div>
                    {sectionData.issues.map((issue: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 6, fontSize: 13, color: "var(--coral-700)", marginBottom: 6 }}>
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
                {sectionData.tips?.length > 0 && (
                  <div style={{ background: "var(--teal-50)", padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-800)", marginBottom: 6 }}>HOW TO IMPROVE</div>
                    {sectionData.tips.map((tip: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--teal-800)", lineHeight: 1.4 }}>{tip}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "repetitions" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Avoiding wordiness and repetitive jargon is key to maintaining recruiter interest.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  
                  {/* Repeated words */}
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 16 }}>
                    <h4 style={{ fontSize: 13, margin: "0 0 10px", color: "var(--gray-500)", textTransform: "uppercase" }}>Overused Jargon</h4>
                    {sectionData.repeated_words?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {sectionData.repeated_words.map((rw: any, i: number) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 4, borderBottom: "1px solid var(--gray-100)" }}>
                            <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>"{rw.word}"</span>
                            <span style={{ color: rw.severity === "high" ? "var(--coral-600)" : "var(--gray-500)" }}>Used {rw.count}x</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>No highly repeated words detected.</p>
                    )}
                  </div>

                  {/* Bullet start repetition */}
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 16 }}>
                    <h4 style={{ fontSize: 13, margin: "0 0 10px", color: "var(--gray-500)", textTransform: "uppercase" }}>Repetitive Bullet Starters</h4>
                    {sectionData.bullet_start_repetitions?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {sectionData.bullet_start_repetitions.map((bs: any, i: number) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 4, borderBottom: "1px solid var(--gray-100)" }}>
                            <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>"{bs.phrase}..."</span>
                            <span style={{ color: "var(--gray-500)" }}>Used {bs.count}x</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>Excellent start-of-bullet variety.</p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {active === "bullets_consistency" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Checks whether bullet points follow layout rules. Punctuation (e.g. always ending with periods) and lengths should remain consistent.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" }}>
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Punctuation Consistent</div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: sectionData.punctuation_consistent ? "var(--teal-700)" : "var(--coral-700)" }}>
                      {sectionData.punctuation_consistent ? "Yes" : "No"}
                    </span>
                  </div>
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Length Consistent</div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: sectionData.length_consistent ? "var(--teal-700)" : "var(--coral-700)" }}>
                      {sectionData.length_consistent ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {sectionData.issues?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 8 }}>ISSUES</div>
                    {sectionData.issues.map((iss: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, background: "var(--gray-50)", padding: 10, borderRadius: 8, fontSize: 13, color: "var(--gray-700)", marginBottom: 6 }}>
                        <AlertTriangle size={14} color="var(--amber-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "essential_sections" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Standard professional CVs must include specific parts (Summary, Experience, Education, and Skills) to allow quick skimming.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div style={{ background: "var(--teal-50)20", border: "1px solid var(--teal-100)", borderRadius: 12, padding: 16 }}>
                    <h4 style={{ fontSize: 13, margin: "0 0 10px", color: "var(--teal-700)", fontWeight: 700 }}>Present Sections</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {sectionData.present?.map((s: string, i: number) => (
                        <span key={i} style={{ fontSize: 12, background: "var(--teal-50)", color: "var(--teal-700)", padding: "3px 8px", borderRadius: 4 }}>{s.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "var(--coral-50)20", border: "1px solid var(--coral-100)", borderRadius: 12, padding: 16 }}>
                    <h4 style={{ fontSize: 13, margin: "0 0 10px", color: "var(--coral-700)", fontWeight: 700 }}>Missing Sections</h4>
                    {sectionData.missing?.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {sectionData.missing.map((s: string, i: number) => (
                          <span key={i} style={{ fontSize: 12, background: "var(--coral-50)", color: "var(--coral-700)", padding: "3px 8px", borderRadius: 4 }}>{s.toUpperCase()}</span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--teal-700)", margin: 0 }}>All essential blocks are present!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {active === "contact_info" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 16 }}>
                  Recruiters must be able to reach you instantly. Links like LinkedIn or GitHub must be properly formatted.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Email", present: sectionData.email_present },
                    { label: "Phone", present: sectionData.phone_present },
                    { label: "Location", present: sectionData.location_present },
                    { label: "LinkedIn", present: sectionData.linkedin_present },
                    { label: "GitHub", present: sectionData.github_present },
                  ].map((item, i) => (
                    <div key={i} style={{ border: "1px solid var(--gray-200)", padding: 12, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{item.label}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.present ? "var(--teal-600)" : "var(--coral-600)" }}>
                        {item.present ? "Verified" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
                {sectionData.issues?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 6 }}>CONTACT ISSUES</div>
                    {sectionData.issues.map((iss: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--coral-700)", marginBottom: 4 }}>• {iss}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "section_ordering" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  A bad layout hierarchy (e.g. place education above experience if you are a senior professional) makes scanning difficult.
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}>
                  {sectionData.order?.map((o: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, background: "var(--gray-100)", color: "var(--gray-700)", padding: "4px 10px", borderRadius: 4, fontWeight: 600 }}>{o}</span>
                      {i < sectionData.order.length - 1 && <span style={{ color: "var(--gray-300)" }}>→</span>}
                    </div>
                  ))}
                </div>
                {sectionData.issues?.length > 0 && (
                  <div style={{ background: "var(--amber-50)", padding: 12, borderRadius: 8, borderLeft: "4px solid var(--amber-500)", color: "var(--amber-800)", fontSize: 13 }}>
                    {sectionData.issues[0]}
                  </div>
                )}
              </div>
            )}

            {active === "design_check" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Audit on CV word count density and estimated page length.
                </p>
                <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
                  <div style={{ flex: 1, border: "1px solid var(--gray-200)", padding: 14, borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Word Count</div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--teal-700)" }}>{sectionData.word_count}</span>
                  </div>
                  <div style={{ flex: 1, border: "1px solid var(--gray-200)", padding: 14, borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Est. Pages</div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--teal-700)" }}>{sectionData.page_length_estimate}</span>
                  </div>
                </div>
                {sectionData.issues?.length > 0 && (
                  <div style={{ background: "var(--coral-50)", padding: 12, borderRadius: 8, color: "var(--coral-800)", fontSize: 13 }}>
                    {sectionData.issues[0]}
                  </div>
                )}
              </div>
            )}

            {active === "email_header_filename" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Unprofessional file names (like final_draft_2.pdf) or informal email links degrade credibility.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                  {[
                    { label: "Valid Email Format", pass: sectionData.email_valid },
                    { label: "Header Link Clickability", pass: sectionData.header_links_clickable },
                    { label: "Professional Filename", pass: sectionData.filename_valid },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--gray-50)", borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: row.pass ? "var(--teal-700)" : "var(--coral-700)" }}>
                        {row.pass ? "✓ Valid" : "⚠ Review"}
                      </span>
                    </div>
                  ))}
                </div>
                {sectionData.issues?.length > 0 && (
                  <div style={{ background: "var(--coral-50)", padding: 12, borderRadius: 8, color: "var(--coral-800)", fontSize: 13, marginTop: 16 }}>
                    {sectionData.issues[0]}
                  </div>
                )}
              </div>
            )}

            {active === "dates_links_headings" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Verifies date formats and presence of GitHub/live links in project or education headings.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", padding: 14, border: "1px solid var(--gray-200)", borderRadius: 12, margin: "16px 0" }}>
                  <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Date Consistency Status:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal-600)" }}>CONSISTENT</span>
                </div>
                {sectionData.issues?.length > 0 && (
                  <div style={{ background: "var(--amber-50)", padding: 12, borderRadius: 8, borderLeft: "4px solid var(--amber-500)", color: "var(--amber-800)", fontSize: 13 }}>
                    {sectionData.issues[0]}
                  </div>
                )}
              </div>
            )}

            {active === "credibility_verification" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Skills claimed in technical list must be cross-referenced with your work bullets to prove credibility.
                </p>
                {sectionData.matched_skills?.length > 0 && (
                  <div style={{ marginBottom: 16, marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-700)", marginBottom: 8 }}>EVIDENCED SKILLS MATCHES</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {sectionData.matched_skills.map((ms: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 12px", background: "var(--teal-50)20", border: "1px solid var(--teal-100)", borderRadius: 6 }}>
                          <span style={{ fontWeight: 600, color: "var(--teal-800)" }}>{ms.skill}</span>
                          <span style={{ color: "var(--gray-500)" }}>evidenced in: {ms.evidenced_in}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sectionData.issues?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--coral-700)", marginBottom: 8 }}>CREDIBILITY WARNINGS</div>
                    {sectionData.issues.map((iss: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, background: "var(--coral-50)", color: "var(--coral-800)", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 6 }}>
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "risk_benchmarking_gaps" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 16 }}>
                  Deeper risk review, highlighting ageism flags, employment timeline gaps, and peer benchmarking.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ border: "1px solid var(--gray-200)", padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Peer Benchmarking</div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "var(--teal-700)" }}>Top {100 - sectionData.peer_benchmarking_percentile}%</span>
                    <span style={{ fontSize: 11, color: "var(--gray-400)", display: "block" }}>vs market candidates</span>
                  </div>

                  <div style={{ border: "1px solid var(--gray-200)", padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Interview Risk Level</div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: sectionData.interview_risk === "high" ? "var(--coral-700)" : sectionData.interview_risk === "medium" ? "var(--amber-700)" : "var(--teal-700)", textTransform: "uppercase" }}>
                      {sectionData.interview_risk}
                    </span>
                  </div>
                </div>

                {/* Gaps detected */}
                {sectionData.employment_gaps?.length > 0 && (
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, margin: "0 0 10px", color: "var(--coral-700)", textTransform: "uppercase" }}>Timeline Gaps Detected</h4>
                    {sectionData.employment_gaps.map((gap: any, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--gray-700)" }}>
                        ⚠ Gap of <strong>{gap.duration_months} months</strong> ({gap.start} - {gap.end}).
                      </div>
                    ))}
                  </div>
                )}

                {/* Gaps, ageism or other issues list */}
                {sectionData.issues?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 8 }}>RISK DETAILS</div>
                    {sectionData.issues.map((iss: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, background: "var(--gray-50)", padding: 10, borderRadius: 8, fontSize: 13, color: "var(--gray-700)", marginBottom: 6 }}>
                        <AlertTriangle size={14} color="var(--amber-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--gray-400)", background: "#fff", border: "1px dashed var(--gray-200)", borderRadius: 12 }}>
      No audit data available. Start a new CV analysis.
    </div>
  );
}
