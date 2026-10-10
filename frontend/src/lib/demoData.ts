export const DEMO_ANALYSIS = {
  id: "demo",
  status: "done" as const,
  created_at: new Date(Date.now() - 60000).toISOString(),
  completed_at: new Date().toISOString(),
  error_msg: null,
  results_json: {
    career_readiness: {
      overall_career_readiness: 81,
      resume_ats_readiness: 88,
      job_match: 76,
      skill_readiness: 82,
      experience_readiness: 78,
      explanation: "Strong technical foundation with robust evidence for core frontend and full-stack engineering skills. Layout parses cleanly across major ATS systems.",
    },
    warnings: [],
    candidate_profile: {
      target_role: "Senior Full Stack Engineer",
      seniority: "Senior",
      years_experience: "5+",
    },
    evidence_graph: {
      skills: [
        { skill: "React", status: "EVIDENCED", occurrences: 6, context: "Built core component library and SPA dashboard" },
        { skill: "Node.js", status: "EVIDENCED", occurrences: 4, context: "Implemented high-throughput REST APIs and microservices" },
        { skill: "TypeScript", status: "EVIDENCED", occurrences: 5, context: "Migrated frontend codebase to strict TypeScript" },
        { skill: "Docker", status: "PARTIALLY_EVIDENCED", occurrences: 2, context: "Containerized development environments" },
        { skill: "Kubernetes", status: "UNSUPPORTED", occurrences: 0, context: "Listed in skills section but no supporting bullets" },
      ],
    },
    universal_ats: {
      score: 88,
      summary: "Clear single-column structure with standard section headers and contact validation.",
      passed: ["Parseable single-column layout", "Standard contact info", "Strong bullet count", "Action-oriented verbs"],
      failed: ["Missing GitHub profile link", "1 unquantified claim"],
    },
    persona_analysis: {
      ats: {
        score: 88,
        concerns: ["Missing explicit Kubernetes keyword in experience descriptions"],
        strengths: ["Clear standard headings", "High keyword density for React, TypeScript, and Node.js"],
      },
      hr_recruiter: {
        score: 80,
        concerns: ["Could highlight promotions and tenure more prominently"],
        strengths: ["Clear career progression across 5 years", "Strong action verbs and clean typography"],
      },
      hiring_manager: {
        score: 75,
        concerns: ["Needs more quantifiable business impact on performance improvements"],
        strengths: ["Proven architectural decisions with modern stack", "Good system design context"],
      },
    },
    career_path: {
      current: "Senior Full Stack Engineer",
      next_roles: [
        { role: "Staff Software Engineer", probability: "75%", timeline: "12–18 months", gaps: ["System architecture at scale", "Cross-team technical leadership"] },
        { role: "Engineering Manager", probability: "60%", timeline: "18–24 months", gaps: ["People management", "Hiring and team roadmapping"] },
      ],
    },
    career_roadmap: [
      { period: "Month 1–3", focus: "Quantify Impact", tasks: ["Rewrite experience bullets with percentage and latency metrics", "Remove unsupported keywords"] },
      { period: "Month 4–6", focus: "Staff Scope", tasks: ["Lead cross-functional architecture doc", "Publish open source contributions"] },
      { period: "Month 7–12", focus: "Target Applications", tasks: ["Leverage network for Staff Engineer referrals", "Run targeted JD adaptations"] },
    ],
    bullet_rewrites: [
      {
        original: "Worked on improving website speed and API performance.",
        rewrite: "Architected Redis caching layer, reducing p99 API latency by 42% for 2M daily active users.",
        impact: "+42% latency reduction",
      },
      {
        original: "Responsible for managing team tasks and sprint planning.",
        rewrite: "Spearheaded Agile sprint rituals for 8 engineers, boosting sprint velocity by 28%.",
        impact: "+28% sprint velocity",
      },
    ],
    interview_prediction: [
      {
        question: "How did you measure the 42% latency reduction in your caching layer?",
        context: "Probing technical depth regarding your caching bullet",
        suggestion: "Explain APM metrics (Datadog/New Relic) and Redis hit-ratio.",
      },
      {
        question: "You list Kubernetes but don't mention deployments. How have you used K8s in production?",
        context: "Probing unsupported keyword flagged in skills section",
        suggestion: "Clarify your role in deploying Helm charts vs platform team ownership.",
      },
    ],
    priority_actions: [
      { priority: "HIGH", title: "Add metric to API latency bullet", impact: "+8 ATS & HM Points" },
      { priority: "MEDIUM", title: "Clarify Kubernetes production experience", impact: "+5 Credibility Points" },
      { priority: "LOW", title: "Include active GitHub profile URL", impact: "+3 Recruiter Points" },
    ],
  },
};
