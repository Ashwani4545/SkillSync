"""
llm_client.py — Phase 4: fallback routing + cost awareness
"""
import anthropic
import time, os, re, json
from typing import Optional
from dotenv import load_dotenv

# Load env variables into os.environ
load_dotenv()

_claude_client: Optional[anthropic.Anthropic] = None
_openai_client = None


def _get_claude() -> anthropic.Anthropic:
    global _claude_client
    if _claude_client is None:
        _claude_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
    return _claude_client


def _generate_smart_mock_response(system: str, user: str) -> str:
    system_lower = system.lower()
    user_lower = user.lower()

    # Helper to extract parts of the user prompt
    def extract_regex(pattern, text, default=""):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else default

    # 1. ATS compatibility (ats_analyzer.py)
    if "ats" in system_lower or "compatibility" in system_lower:
        skills_str = extract_regex(r"RESUME SKILLS:\s*(.*)", user)
        skills = [s.strip().lower() for s in skills_str.split(",") if s.strip()] if skills_str else []
        jd = extract_regex(r"JOB DESCRIPTION:\s*([\s\S]*)", user)
        
        tech_keywords = [
            "python", "javascript", "react", "fastapi", "postgresql", "docker", "kubernetes", 
            "typescript", "aws", "git", "ci/cd", "html", "css", "nodejs", "express", "django", 
            "flask", "java", "c++", "ruby", "go", "rust", "scala", "mongodb", "mysql", "redis", 
            "terraform", "ansible", "graphql", "rest api", "sql", "scrum", "agile", "next.js"
        ]
        
        found = []
        missing = []
        if jd:
            jd_lower = jd.lower()
            exp_context = extract_regex(r"RESUME EXPERIENCE:\s*([\s\S]*?)(?=RESUME SECTIONS|JOB DESCRIPTION|$)", user).lower()
            
            for kw in tech_keywords:
                if re.search(rf"\b{re.escape(kw)}\b", jd_lower):
                    has_it = False
                    if kw in skills:
                        has_it = True
                    elif re.search(rf"\b{re.escape(kw)}\b", exp_context):
                        has_it = True
                    
                    if has_it:
                        found.append(kw)
                    else:
                        missing.append(kw)
        else:
            found = [s for s in skills if s in tech_keywords]
            if not found:
                found = skills[:4]
            missing = [k for k in ["docker", "kubernetes", "aws", "ci/cd"] if k not in skills]

        score = 80
        if jd:
            total_jd_kws = len(found) + len(missing)
            if total_jd_kws > 0:
                score = int(50 + 50 * (len(found) / total_jd_kws))
        else:
            score = min(100, max(50, 70 + len(skills) * 2))
        
        format_issues = []
        if len(skills) < 5:
            format_issues.append("Very brief skills list — expand on your core competencies.")
        if "github" not in user_lower:
            format_issues.append("Missing GitHub profile link in header.")
        if "linkedin" not in user_lower:
            format_issues.append("Missing LinkedIn profile link in header.")
            
        improvements = []
        for m in missing[:3]:
            improvements.append(f"Add '{m.capitalize()}' skills and experience to your profile if you have worked with them.")
        improvements.append("Quantify your achievements in recent roles with specific metrics (%, $, time saved).")
        
        return json.dumps({
            "score": score,
            "pass": score >= 70,
            "missing_keywords": [m.upper() for m in missing] if missing else ["None"],
            "found_keywords": [f.upper() for f in found] if found else ["None"],
            "format_issues": format_issues if format_issues else ["None detected"],
            "improvements": improvements,
            "keyword_density": round(len(found) / max(1, len(found) + len(missing)), 2)
        })

    # 2. Section Grader (section_grader.py)
    elif "grade" in system_lower or "section" in system_lower:
        summary = extract_regex(r"SUMMARY:\s*(.*?)(?=EXPERIENCE:|$)", user)
        experience = extract_regex(r"EXPERIENCE:\s*(.*?)(?=EDUCATION:|$)", user)
        education = extract_regex(r"EDUCATION:\s*(.*?)(?=SKILLS:|$)", user)
        skills_str = extract_regex(r"SKILLS:\s*(.*)", user)
        
        sum_score = 85 if len(summary) > 20 else 50
        exp_score = 85 if len(experience) > 30 else 50
        edu_score = 90 if len(education) > 10 else 50
        sk_score = 90 if len(skills_str) > 10 else 50
        
        overall_score = int((sum_score + exp_score + edu_score + sk_score) / 4)
        
        def get_grade(s):
            if s >= 90: return "A"
            if s >= 80: return "B"
            if s >= 70: return "C"
            return "F"
            
        return json.dumps({
            "summary": {
                "score": sum_score, "grade": get_grade(sum_score),
                "issues": [] if sum_score > 50 else ["Summary is missing or too short"],
                "tips": ["Good summary structure"] if sum_score > 50 else ["Add a 2-3 sentence summary highlighting your top skills."]
            },
            "experience": {
                "score": exp_score, "grade": get_grade(exp_score),
                "issues": [] if exp_score > 50 else ["Experience section has no bullet points"],
                "tips": ["Quantify experience results"] if exp_score > 50 else ["Detail your responsibilities and achievements using action verbs."]
            },
            "education": {
                "score": edu_score, "grade": get_grade(edu_score),
                "issues": [] if edu_score > 50 else ["Education section is incomplete"],
                "tips": ["Degree information is clear"] if edu_score > 50 else ["Include your degree name, university, and graduation year."]
            },
            "skills": {
                "score": sk_score, "grade": get_grade(sk_score),
                "issues": [] if sk_score > 50 else ["Too few skills listed"],
                "tips": ["Relevant skills categorised"] if sk_score > 50 else ["List technical skills relevant to your target role."]
            },
            "overall": {
                "score": overall_score, "grade": get_grade(overall_score),
                "top3_fixes": [
                    "Add detailed impact metrics to experience bullet points",
                    "Include links to portfolios or GitHub in the header",
                    "Align skills naturally with the job description keywords"
                ]
            }
        })

    # 3. Bullet Rewriter (bullet_rewriter.py)
    elif "rewrite" in system_lower or "bullet" in system_lower:
        bullets_block = extract_regex(r"BULLETS TO REWRITE:\s*([\s\S]*)", user)
        rewrites = []
        
        if bullets_block:
            bullet_lines = re.findall(r"\d+\.\s*\[(.*?)\]\s*(.*)", bullets_block)
            for role_info, b_text in bullet_lines:
                b_text = b_text.strip()
                b_lower = b_text.lower()
                if "develop" in b_lower or "build" in b_lower or "create" in b_lower:
                    rewritten = f"Architected and deployed enterprise-level features for {role_info.split(' at ')[0]}, boosting application performance by 35% and scaling user base."
                    imp_type = "added_metric"
                    score_before, score_after = 60, 90
                elif "manage" in b_lower or "lead" in b_lower or "run" in b_lower:
                    rewritten = f"Spearheaded a cross-functional engineering team, aligning development cycles to accelerate feature delivery by 40%."
                    imp_type = "stronger_verb"
                    score_before, score_after = 65, 92
                elif "maintain" in b_lower or "support" in b_lower or "fix" in b_lower:
                    rewritten = f"Optimized system configurations and database indexing, resolving critical latency bugs and securing 99.99% service availability."
                    imp_type = "clearer_impact"
                    score_before, score_after = 55, 88
                else:
                    rewritten = f"Spearheaded key initiatives for {role_info}, improving processing efficiency by 25% and reducing system overhead."
                    imp_type = "all"
                    score_before, score_after = 50, 85
                
                rewrites.append({
                    "original": b_text,
                    "rewritten": rewritten,
                    "improvement_type": imp_type,
                    "score_before": score_before,
                    "score_after": score_after
                })
        
        if not rewrites:
            rewrites.append({
                "original": "Responsible for developing new features.",
                "rewritten": "Designed and deployed 15+ microservices using FastAPI, reducing response latency by 30%.",
                "improvement_type": "all",
                "score_before": 50,
                "score_after": 95
            })
            
        return json.dumps({"rewrites": rewrites})

    # 4. Tone & Confidence Analyzer (tone_analyzer.py)
    elif "tone" in system_lower or "confidence" in system_lower:
        summary = extract_regex(r"SUMMARY:\s*([\s\S]*?)(?=EXPERIENCE|$)", user)
        experience = extract_regex(r"EXPERIENCE BULLETS[\s\S]*?(?=Pre-flagged|$)", user)
        full_text = (summary + " " + experience).lower()
        
        weak_phrases = [
            "responsible for", "helped with", "assisted in", "worked on",
            "involved in", "participated in", "contributed to", "tasked with",
            "was part of", "supported", "tried to", "attempted to"
        ]
        
        found_weak = []
        for wp in weak_phrases:
            if re.search(rf"\b{re.escape(wp)}\b", full_text):
                phrase_fix = {
                    "responsible for": "Spearheaded",
                    "helped with": "Facilitated",
                    "assisted in": "Collaborated on",
                    "worked on": "Designed",
                    "involved in": "Coordinated",
                    "participated in": "Led",
                    "contributed to": "Optimized",
                    "tasked with": "Executed",
                    "was part of": "Supported",
                    "supported": "Maximized",
                    "tried to": "Successfully delivered",
                    "attempted to": "Completed"
                }
                found_weak.append({
                    "phrase": wp,
                    "section": "experience" if wp in experience else "summary",
                    "fix": phrase_fix.get(wp, "Led")
                })
                
        score = max(50, 95 - len(found_weak) * 8)
        
        def get_grade(s):
            if s >= 90: return "A"
            if s >= 80: return "B"
            if s >= 70: return "C"
            return "D"
            
        return json.dumps({
            "confidence_score": score,
            "grade": get_grade(score),
            "passive_phrases": found_weak if found_weak else [{"phrase": "worked on", "section": "experience", "fix": "Architected"}],
            "filler_words": ["basically", "really", "mostly"] if len(found_weak) > 2 else [],
            "tone_by_section": {
                "summary": {"score": score + 2 if score < 95 else 95, "notes": "Clear description, minor weak phrases." if found_weak else "Excellent confident tone."},
                "experience": {"score": score, "notes": "Active voice is strong overall." if not found_weak else "Replace passive descriptions with action verbs."},
                "skills": {"score": 90, "notes": "Technical vocabulary is strong and precise."}
            },
            "top_improvements": [
                "Replace passive phrases like 'responsible for' with active verbs like 'Spearheaded'",
                "Remove weak qualifiers to increase summary impact",
                "Start experience bullets with action-oriented verbs"
            ]
        })

    # 5. Persona Review Simulator (persona_analyzer.py)
    elif "persona" in system_lower or "recruit" in system_lower:
        name = extract_regex(r"CANDIDATE:\s*(.*)", user) or "Candidate"
        skills_str = extract_regex(r"SKILLS:\s*(.*)", user)
        skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else []
        
        score = 82
        if len(skills) > 10:
            score = 88
            
        return json.dumps({
            "ats_bot": {
                "verdict": "pass" if score >= 70 else "fail",
                "score": score,
                "stop_reading_at": "none",
                "issues": [] if score >= 80 else ["Low keyword correlation vs Job Description"],
                "passed_checks": ["Clean contact layout", "Valid email domain", "Standard sections present"]
            },
            "hr_recruiter": {
                "verdict": "shortlist" if score >= 85 else "maybe",
                "score": score - 5,
                "stop_reading_at": "none" if score >= 80 else "experience_gap",
                "red_flags": [] if score >= 80 else ["Unexplained gap in recent role"],
                "green_flags": ["Solid job stability", "Core technical certifications mentioned"],
                "first_impression": f"Strong candidate {name} with well-organized technical experience."
            },
            "hiring_manager": {
                "verdict": "strong" if score >= 85 else "consider",
                "score": score + 3,
                "stop_reading_at": "none",
                "credibility_gaps": [] if score >= 80 else ["Listed advanced skills without detailed project context"],
                "strengths": ["Demonstrates ownership in core product features"],
                "probe_questions": [f"Can you explain how you designed the architecture for the skills mentioned like {skills[0]}?" if skills else "Can you describe your most challenging engineering role?"]
            }
        })

    # 6. Skill Authenticity Checker (skill_checker.py)
    elif "authenticity" in system_lower or "skill" in system_lower:
        skills_str = extract_regex(r"CLAIMED SKILLS:\s*(.*)", user)
        skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else []
        context = extract_regex(r"EXPERIENCE CONTEXT:\s*([\s\S]*)", user).lower()
        
        evidenced = []
        unsupported = []
        
        for sk in skills:
            sk_lower = sk.lower()
            if re.search(rf"\b{re.escape(sk_lower)}\b", context):
                sentences = re.split(r"[•.!?\n]", context)
                evidence_text = ""
                for s in sentences:
                    if re.search(rf"\b{re.escape(sk_lower)}\b", s.lower()):
                        evidence_text = s.strip()
                        break
                if not evidence_text:
                    evidence_text = "Mentioned in experience details."
                evidenced.append({
                    "skill": sk,
                    "evidence": f"Found in description: '... {evidence_text[:100]} ...'"
                })
            else:
                unsupported.append({
                    "skill": sk,
                    "risk": "This skill is listed in your technical stack but is not referenced or supported by any of your experience details or bullets."
                })
                
        auth_score = int(100 * (len(evidenced) / max(1, len(skills))))
        
        if not evidenced and skills:
            evidenced.append({"skill": skills[0], "evidence": "Mentioned in summary or projects."})
            if len(unsupported) > 0:
                unsupported.pop(0)
            auth_score = 75
            
        return json.dumps({
            "evidenced_skills": evidenced[:6],
            "unsupported_skills": unsupported[:4],
            "missing_skills": ["git", "testing", "agile"] if len(skills) < 15 else [],
            "authenticity_score": auth_score,
            "recommendation": "Try to incorporate all key technical skills directly into your experience bullet points to substantiate your claims to recruiters."
        })

    # 7. Interview Question Predictor (interview_predictor.py)
    elif "interview" in system_lower or "question" in system_lower:
        skills_str = extract_regex(r"SKILLS:\s*(.*)", user)
        skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else ["Software Development"]
        
        questions = []
        for i, sk in enumerate(skills[:4]):
            questions.append({
                "trigger": f"Claimed proficiency in {sk}",
                "question": f"Can you describe a challenging technical challenge you faced when using {sk} and how you solved it?",
                "why": f"To evaluate your depth of expertise and practical problem-solving with {sk}.",
                "good_answer_tip": f"Describe a specific bug or feature, detail the debugging tools used, and mention the quantifiable performance improvement you achieved."
            })
            
        questions.append({
            "trigger": "Quantifiable metrics in recent role",
            "question": "In your experience section, what was the direct impact of your contributions on system performance and scaling?",
            "why": "To verify if the candidate understands the business value and metrics of their engineering work.",
            "good_answer_tip": "Give specific figures (e.g. 30% speedup, 10k users) and explain how those metrics translate to savings or revenue."
        })
        
        return json.dumps({
            "questions": questions,
            "overall_concern_level": "low" if len(skills) > 8 else "medium",
            "top_concern": "Ensuring all technical tools listed in the skills section have direct backing in the candidate's work history."
        })

    # 8. Resume A/B Tester Comparator (ab_tester.py)
    elif "ab_system" in system_lower or "comparing two resume versions" in system_lower:
        score_a = int(extract_regex(r"Resume B:[\s\S]*?Pre-computed scores — ATS:\s*(\d+)", user, "80"))
        score_b = int(extract_regex(r"Resume B:[\s\S]*?Pre-computed scores — ATS:\s*(\d+)", user, "85"))
        if score_a == 80 and score_b == 85:
            # check alternate extraction if first fail
            score_a = int(extract_regex(r"RESUME A:[\s\S]*?ATS:\s*(\d+)", user, "80"))
            score_b = int(extract_regex(r"RESUME B:[\s\S]*?ATS:\s*(\d+)", user, "85"))

        winner = "B" if score_b > score_a else ("A" if score_a > score_b else "tie")
        
        return json.dumps({
            "winner": winner,
            "confidence": "high",
            "overall_scores": { "A": score_a, "B": score_b },
            "dimension_scores": {
                "ats_match":    { "A": score_a, "B": score_b, "winner": winner },
                "content":      { "A": min(100, score_a + 5), "B": min(100, score_b + 5), "winner": winner },
                "tone":         { "A": min(100, score_a - 2), "B": min(100, score_b + 2), "winner": winner },
                "relevance":    { "A": score_a, "B": score_b, "winner": winner },
                "readability":  { "A": 85, "B": 90, "winner": "B" }
            },
            "winner_strengths": ["Quantified results in experience section", "Stronger action-oriented verb usage"],
            "loser_issues": ["Contains several passive descriptions ('responsible for')", "Incomplete technical details in header"],
            "recommendation": f"Use Version {winner} as it presents much stronger outcomes and matches standard ATS filters better.",
            "best_of_both": ["Combine the cleaner contact header format of Version A with the experience details of Version B."]
        })

    # 9. Industry Benchmarking Comparator (benchmark_engine.py)
    elif "benchmarks resumes against" in system_lower or "benchmark_system" in system_lower:
        role = extract_regex(r"TARGET ROLE:\s*(.*)", user) or "Software Engineer"
        industry = extract_regex(r"INDUSTRY:\s*(.*)", user) or "Technology"
        quant_rate = int(extract_regex(r"Quantified bullets:\s*\d+/\d+\s*\((\d+)%\)", user, "40"))
        
        overall = min(99, max(45, 55 + quant_rate // 3))
        
        return json.dumps({
            "overall_percentile": overall,
            "dimensions": {
                "bullet_quality":    { "user_score": 75, "benchmark_score": 85, "gap": -10, "tips": ["Incorporate stronger action verbs into experience statements."] },
                "keyword_density":   { "user_score": 80, "benchmark_score": 88, "gap": -8, "tips": ["Align tech keywords closer to the target role requirements."] },
                "quantification":    { "user_score": quant_rate, "benchmark_score": 75, "gap": quant_rate - 75, "tips": ["Include specific figures/outcomes in at least 60% of experience descriptions."] },
                "experience_depth":  { "user_score": 82, "benchmark_score": 80, "gap": 2, "tips": ["Experience matches the industry baseline, focus on showing leadership."] },
                "skills_relevance":  { "user_score": 85, "benchmark_score": 90, "gap": -5, "tips": ["Group and catalog tech skills systematically."] },
                "structure":         { "user_score": 90, "benchmark_score": 85, "gap": 5, "tips": ["Structure is clean and parses effectively."] }
            },
            "top_gap": "Lack of quantified results and impact metrics in core role descriptions.",
            "strengths_vs_benchmark": ["Structure and clear visual layout of resume sections", "Broad baseline tech skills matching target industry"],
            "role_specific_advice": [f"For '{role}' in '{industry}', prioritize demonstrating ownership of microservices, cloud deployments, and system performance scaling."]
        })

    # 10. Career Path Trajectory Predictor (career_predictor.py)
    elif "senior career strategist" in system_lower or "trajectory" in system_lower:
        timeline = extract_regex(r"CAREER TIMELINE:\s*([\s\S]*?)(?=SAMPLE ACHIEVEMENTS|$)", user)
        skills_str = extract_regex(r"SKILLS.* listed\):\s*(.*)", user)
        skills = [s.strip().lower() for s in skills_str.split(",") if s.strip()] if skills_str else []
        
        # Simple seniority inference
        seniority = "mid"
        title = "Software Engineer"
        if timeline:
            first_role = re.split(r"[\n-]", timeline)[0].lower()
            if "senior" in first_role:
                seniority = "senior"
                title = "Senior Software Engineer"
            elif "lead" in first_role or "manager" in first_role:
                seniority = "lead"
                title = "Lead Engineer"
            elif "junior" in first_role or "intern" in first_role:
                seniority = "junior"
                title = "Junior Software Engineer"
        
        years = len(re.findall(r"-\s", timeline)) + 1
        
        # Dynamic Next Roles
        if seniority == "junior":
            roles = [
                {
                    "title": "Mid-level Software Engineer",
                    "timeline": "6-12 months",
                    "probability": 90,
                    "salary_range": "$95k-$115k",
                    "why_realistic": "Already possess core engineering skills; requires demonstrating independent task completion.",
                    "required_skills": ["System design basics", "API architecture design"],
                    "existing_strengths": skills[:4],
                    "action_plan": ["Lead design of small microservice components", "Complete advanced courses in system architecture", "Contribute actively to code reviews"]
                },
                {
                    "title": "Full-stack Software Developer",
                    "timeline": "12-18 months",
                    "probability": 80,
                    "salary_range": "$100k-$120k",
                    "why_realistic": "Strong baseline backend skills; only needs front-end frameworks extension.",
                    "required_skills": ["React/Next.js frameworks", "State management"],
                    "existing_strengths": skills[:3],
                    "action_plan": ["Develop 2 front-end demo portals", "Collaborate on user interface enhancements", "Optimize website performance metrics"]
                }
            ]
            stretch = {
                "title": "Senior Software Architect",
                "timeline": "3-5 years",
                "gap_summary": "Extensive experience managing enterprise scale architectures and leading developer teams.",
                "key_milestones": ["Own end-to-end delivery of a major product module", "Spearhead architectural migration of core systems"]
            }
        elif seniority == "mid":
            roles = [
                {
                    "title": "Senior Software Engineer",
                    "timeline": "12-18 months",
                    "probability": 85,
                    "salary_range": "$135k-$160k",
                    "why_realistic": "Solid technical foundation. Ready to step up by taking ownership of broader architectures.",
                    "required_skills": ["Cloud architecture (AWS/GCP)", "CI/CD pipeline optimization"],
                    "existing_strengths": skills[:5],
                    "action_plan": ["Lead technical architecture design on next project", "Mentor 2 junior developers", "Implement automated profiling and monitoring tools"]
                },
                {
                    "title": "Tech Lead / Scrum Master",
                    "timeline": "18-24 months",
                    "probability": 70,
                    "salary_range": "$145k-$175k",
                    "why_realistic": "Strong communication and organizational capacity visible in experience description.",
                    "required_skills": ["Agile project management", "Stakeholder communication"],
                    "existing_strengths": skills[:4],
                    "action_plan": ["Organize sprint planning and demo meetings", "Interface directly with product managers", "Complete Scrum Certification"]
                }
            ]
            stretch = {
                "title": "Principal Engineer / Software Director",
                "timeline": "3-5 years",
                "gap_summary": "Demonstrated business alignment, setting engineering strategy, and cross-team leadership.",
                "key_milestones": ["Deliver a product scaling to 1M+ active users", "Define engineering standards for the organization"]
            }
        else: # senior or lead
            roles = [
                {
                    "title": "Lead Software Architect",
                    "timeline": "12-18 months",
                    "probability": 80,
                    "salary_range": "$175k-$210k",
                    "why_realistic": "Strong experience directing teams. Needs to transition from code delivery to technical strategy.",
                    "required_skills": ["Distributed systems scaling", "Enterprise cloud governance"],
                    "existing_strengths": skills[:6],
                    "action_plan": ["Design migration path to multi-region cloud layout", "Represent engineering team in architecture review boards", "Reduce legacy code debt across microservices"]
                },
                {
                    "title": "Engineering Manager",
                    "timeline": "18-24 months",
                    "probability": 75,
                    "salary_range": "$180k-$220k",
                    "why_realistic": "Natural progression from team leadership. Focuses on people management and delivery operations.",
                    "required_skills": ["Budgeting and resource allocation", "Performance management"],
                    "existing_strengths": skills[:4],
                    "action_plan": ["Lead recruitment and hiring drives for the team", "Set up quarterly performance review metrics", "Coordinate delivery alignment with business teams"]
                }
            ]
            stretch = {
                "title": "Chief Technology Officer (CTO)",
                "timeline": "3-5 years",
                "gap_summary": "Organizational leadership, company-wide technology strategy, and board reporting experience.",
                "key_milestones": ["Align technology budget to business revenue goals", "Direct an engineering department of 50+ staff"]
            }
            
        return json.dumps({
            "current_level": {
                "title": f"Senior {title}" if seniority == "senior" else (f"Lead {title}" if seniority == "lead" else f"{title}"),
                "years_experience": years,
                "seniority": seniority,
                "confidence": "high"
            },
            "next_roles": roles,
            "stretch_role": stretch,
            "career_risks": [
                "Remaining strictly focused on individual code delivery rather than system design",
                "Technology lock-in by not adapting to modern cloud-native deployment patterns"
            ],
            "unique_advantage": "Combines deep technical coding skills with a structured understanding of software delivery cycles."
        })

    # 11. Salary Estimator (salary_estimator.py)
    elif "compensation specialist" in system_lower or "salary" in system_lower:
        role = extract_regex(r"TARGET ROLE:\s*(.*)", user) or "Software Engineer"
        location = extract_regex(r"TARGET LOCATION:\s*(.*)", user) or "Remote (US)"
        years = float(extract_regex(r"Approximate years experience:\s*(\d+)", user, "4"))
        
        # Base salary tier calculation
        role_lower = role.lower()
        base_low, base_mid, base_high = 90000, 115000, 145000
        
        if "junior" in role_lower or "intern" in role_lower:
            base_low, base_mid, base_high = 65000, 80000, 95000
        elif "senior" in role_lower:
            base_low, base_mid, base_high = 135000, 155000, 185000
        elif "lead" in role_lower or "manager" in role_lower or "architect" in role_lower:
            base_low, base_mid, base_high = 165000, 195000, 235000
        elif "director" in role_lower or "vp" in role_lower or "cto" in role_lower:
            base_low, base_mid, base_high = 210000, 260000, 320000
            
        # Adjust for years of experience
        experience_bonus = int(years * 3000)
        base_low += experience_bonus
        base_mid += experience_bonus
        base_high += experience_bonus
        
        # Location Multipliers
        multipliers = {
            "San Francisco": 1.4,
            "New York": 1.35,
            "Austin": 1.15,
            "Remote (US)": 1.0,
            "London": 0.85,
            "Bangalore": 0.45,
            "Tokyo": 0.8,
            "Paris": 0.75,
            "Sydney": 0.9
        }
        
        mult = multipliers.get(location, 1.0)
        final_low = int(base_low * mult)
        final_mid = int(base_mid * mult)
        final_high = int(base_high * mult)
        
        return json.dumps({
            "base_salary": {
                "low": final_low,
                "mid": final_mid,
                "high": final_high,
                "currency": "USD"
            },
            "total_compensation": {
                "low": int(final_low * 1.08),
                "mid": int(final_mid * 1.12),
                "high": int(final_high * 1.25)
            },
            "percentile_position": 75 if years > 4 else 55,
            "location_multipliers": multipliers,
            "factors_boosting_salary": [
                "Highly sought framework skills listed in tech stack",
                "Consistent career stability with no unexplained gaps"
            ],
            "factors_limiting_salary": [
                "Lack of certified cloud architecture credentials",
                "Limited experience directing enterprise scale cloud projects"
            ],
            "negotiation_tips": [
                "Highlight system performance improvements to secure the higher end of the salary band.",
                "Leverage competing local market offers since your skill combination matches local demand."
            ],
            "market_trend": "rising",
            "market_trend_reason": f"Strong local and remote hiring demand continues for '{role}' roles possessing cloud and API engineering expertise."
        })

    # 12. Cultural/Language CV Adapter (cultural_adapter.py)
    elif "international resume/cv consultant" in system_lower or "norms" in system_lower:
        country = extract_regex(r"TARGET COUNTRY:\s*(.*)", user) or "United States"
        name = extract_regex(r"Name:\s*(.*)", user) or "Candidate"
        summary = extract_regex(r"Summary:\s*(.*)", user) or "Candidate summary."
        skills_str = extract_regex(r"Skills:\s*(.*)", user)
        skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else []
        
        # Generate adapted details based on country
        must_add = []
        changes = []
        additional = {}
        tips = []
        
        if country == "Germany":
            must_add = ["Professional headshot photo", "Exact date and place of birth", "Marital status (optional but common)"]
            changes = ["Restructured layout to chronological Lebenslauf format", "Grouped skills and added personal details block"]
            additional = {
                "Personal Details": f"Name: {name}\nDate of Birth: [Please Add]\nPlace of Birth: [Please Add]\nNationality: [Please Add]",
                "Interests": "Reading, Technology, Travel"
            }
            tips = ["In Germany, a structured, chronological 'Lebenslauf' is expected. Signature and date at the bottom are optional but highly appreciated."]
            rec_len = "2 pages standard for Lebenslauf"
        elif country == "Japan":
            must_add = ["Passport-style photo on top right", "Age and date of birth", "Motivation for applying (Shiboudouki)"]
            changes = ["Mapped resume details onto standard standardized Rirekisho format", "Reordered education oldest-first"]
            additional = {
                "Motivation for Applying (志望動機)": "[Candidate must write 2-3 sentences explaining their interest in this specific company]",
                "Self-Promotion (自己PR)": summary
            }
            tips = ["Japanese resumes (Rirekisho) follow a strict standardized structure. Humble, dedicated phrasing is preferred over self-promotion."]
            rec_len = "Standard 2-page Rirekisho form"
        elif country == "United Kingdom":
            must_add = ["None"]
            changes = ["Renamed 'Summary' to 'Personal Statement'", "Adjusted experience descriptions to avoid overly aggressive self-promotion"]
            additional = {
                "References": "References available on request."
            }
            tips = ["UK CVs expect a brief 'Personal Statement' of 3-4 sentences at the top. Avoid buzzwords and focus on solid achievements."]
            rec_len = "2 pages maximum"
        elif country == "India":
            must_add = ["Date of birth", "Permanent address details"]
            changes = ["Added a dedicated technical projects section", "Placed Career Objective at the header"]
            additional = {
                "Career Objective": f"Seeking a challenging role in engineering to utilize my skills in {skills[0] if skills else 'software development'}."
            }
            tips = ["Indian resumes commonly list technical projects separately and include objective statements at the top."]
            rec_len = "2-3 pages"
        else: # US/Canada default
            must_add = ["None"]
            changes = ["Optimized summary for target role metrics", "Organized skills section by technical layers"]
            tips = ["US/Canada resumes prioritize results-oriented experience and must never include personal details (photo, age, marital status)."]
            rec_len = "1-2 pages"

        return json.dumps({
            "adapted_resume": {
                "contact": { "name": name, "email": "candidate@example.com" },
                "summary": summary,
                "experience": [],
                "education": [],
                "skills": skills,
                "certifications": [],
                "projects": [],
                "additional_sections": additional
            },
            "changes_made": changes,
            "must_add_manually": must_add,
            "length_recommendation": rec_len,
            "format_tips": tips
        })

    # 13. Gap Counselor & Reframing Advisor (gap_disguiser.py)
    elif "career counselor" in system_lower or "employment gaps" in system_lower:
        timeline = extract_regex(r"CAREER TIMELINE:\s*([\s\S]*)", user)
        gaps = []
        strategies = []
        
        # Always output at least one simulated moderate gap for testing if no obvious gap exists
        gaps.append({
            "start": "January 2024",
            "end": "June 2024",
            "duration_months": 5,
            "severity": "moderate",
            "context_before": "Software Engineer at Tech Corp",
            "context_after": "Senior Developer at Innovation Labs"
        })
        
        strategies.append({
            "gap_index": 0,
            "strategies": [
                {
                    "label": "Independent Consulting Reframe",
                    "narrative": "Independent Software Consultant | Jan 2024 – Jun 2024\n- Partnered with local startups to build and optimize backend API architectures using FastAPI.\n- Successfully resolved database scale challenges and set up robust integration tests.",
                    "risk_level": "low",
                    "use_when": "Use this if you engaged in freelance, open-source work, or private consulting during the period."
                },
                {
                    "label": "ProfessionalUpskilling & Training",
                    "narrative": "Advanced Professional Upskilling | Jan 2024 – Jun 2024\n- Dedicated period to complete certification courses in system design, cloud architecture, and automation tools.\n- Developed and published 3 open-source utility packages on GitHub.",
                    "risk_level": "low",
                    "use_when": "Use this if you completed formal certificates, online specializations, or spent time building personal portfolio apps."
                }
            ]
        })
        
        return json.dumps({
            "gaps_detected": gaps,
            "gap_strategies": strategies,
            "cover_letter_tip": "Address the gap briefly in your cover letter by framing it as a dedicated period for career alignment, certification, or startup consulting.",
            "interview_answer": "During that period, I intentionally stepped away from full-time roles to focus on upskilling in distributed systems and executing startup consulting projects. This enabled me to gain deeper expertise in FastAPI and cloud deployments, which I am ready to apply here."
        })

    # 14. Resume JD Adaptation Tailorer (jd_adapter.py)
    elif "tailoring resumes to specific job descriptions" in system_lower or "jd_adapter" in system_lower:
        summary = extract_regex(r"SUMMARY:\s*([\s\S]*?)(?=EXPERIENCE|$)", user)
        skills_str = extract_regex(r"SKILLS:\s*(.*)", user)
        skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else []
        jd = extract_regex(r"=== JOB DESCRIPTION ===\s*([\s\S]*)", user)
        
        # Scan for missing tech keywords in the JD
        tech_keywords = ["docker", "kubernetes", "aws", "typescript", "fastapi", "postgresql", "react"]
        added_keywords = []
        if jd:
            jd_lower = jd.lower()
            for kw in tech_keywords:
                if kw in jd_lower and kw not in [s.lower() for s in skills]:
                    added_keywords.append(kw.upper())
                    
        # Update summary
        role_target = extract_regex(r"(\w+\s+\w*engineer|\w+\s+\w*developer)", jd, "Software Engineer")
        rewritten_summary = f"Results-driven software engineer specialized in building scalable architectures. Highly experienced in leveraging technical skills to deliver robust web systems matching the priorities of a {role_target} role."
        
        # Update skills list to prioritize added and matched keywords
        tailored_skills = added_keywords + skills
        
        return json.dumps({
            "contact": { "name": "Candidate", "email": "candidate@example.com" },
            "summary": rewritten_summary,
            "experience": [],
            "education": [],
            "skills": tailored_skills,
            "certifications": [],
            "projects": [],
            "changes_made": [
                f"Weaved target keywords ({', '.join(added_keywords)}) into the skills stack to match the Job Description.",
                "Rewrote the professional summary to align with the core expectations of the role."
            ],
            "keywords_added": added_keywords,
            "match_score_before": 65,
            "match_score_after": 92
        })

        # Update skills list to prioritize added and matched keywords
        tailored_skills = added_keywords + skills
        
        return json.dumps({
            "contact": { "name": "Candidate", "email": "candidate@example.com" },
            "summary": rewritten_summary,
            "experience": [],
            "education": [],
            "skills": tailored_skills,
            "certifications": [],
            "projects": [],
            "changes_made": [
                f"Weaved target keywords ({', '.join(added_keywords)}) into the skills stack to match the Job Description.",
                "Rewrote the professional summary to align with the core expectations of the role."
            ],
            "keywords_added": added_keywords,
            "match_score_before": 65,
            "match_score_after": 92
        })

    # 15. Comprehensive CV Audit (audit_analyzer.py)
    elif "audit" in system_lower or "comprehensive" in system_lower or "13-point" in system_lower:
        role = extract_regex(r"TARGET JOB ROLE:\s*(.*)", user) or "Software Engineer"
        demanded_skills_str = extract_regex(r"DEMANDED SKILLS:\s*(.*)", user)
        demanded_skills = [s.strip().lower() for s in demanded_skills_str.split(",") if s.strip()] if demanded_skills_str else []
        
        skills_str = extract_regex(r"RESUME SKILLS:\s*(.*)", user)
        skills = [s.strip().lower() for s in skills_str.split(",") if s.strip()] if skills_str else []
        
        filename = extract_regex(r"RESUME FILENAME:\s*(.*)", user) or "Resume.pdf"
        exp_content = extract_regex(r"RESUME EXPERIENCE:\s*([\s\S]*?)(?=RESUME PROJECTS|RESUME EDUCATION|$)", user).lower()
        
        # 1. Parsing Check
        parsing_details = "Successfully parsed candidate header, skills, experience, and education sections."
        
        # 2. Spelling & Grammar check
        spelling_errors = []
        if "devloper" in user_lower:
            spelling_errors.append("Found spelling mistake: 'devloper'. Should be 'developer'.")
        if "manger" in user_lower:
            spelling_errors.append("Found spelling mistake: 'manger'. Should be 'manager'.")
        if "resposible" in user_lower:
            spelling_errors.append("Found spelling mistake: 'resposible'. Should be 'responsible'.")
            
        if not spelling_errors:
            # Add a generic minor styling or grammar suggestion to show correctness
            spelling_errors.append("Consider replacing passive phrasing 'Responsible for building' with active action verb 'Architected'.")
            
        spelling_status = "warning" if len(spelling_errors) > 0 else "pass"
        
        # 3. Quantify Impact check
        # Count occurrences of numbers/percentages in experience bullets
        metrics_count = len(re.findall(r"\b\d+%\b|\$\b\d+|\b\d+\s*(?:percent|million|billion|users|customers|hours|days|weeks|months|years|speedup)\b", exp_content))
        total_bullets = len(re.findall(r"•|▪", exp_content)) or 5
        quantified_pct = min(100, int((metrics_count / max(1, total_bullets)) * 100))
        
        quant_issues = []
        quant_tips = []
        if quantified_pct < 50:
            quant_status = "warning"
            quant_issues.append(f"Only {quantified_pct}% of your experience descriptions contain quantifiable achievements. Recruiters prioritize metrics over tasks.")
            quant_tips.append("Rephrase your bullet points to specify exact numbers (e.g., 'boosting efficiency by 25%' or 'managing a budget of $50k').")
        else:
            quant_status = "pass"
            quant_tips.append("Your resume shows strong impact metrics. Keep using specific percentages and figures.")
            
        # 4. Word Repetitions check
        repetitions_found = []
        bullet_start_reps = []
        
        common_words = ["developed", "managed", "worked", "helped", "assisted", "responsible"]
        for w in common_words:
            w_count = len(re.findall(rf"\b{re.escape(w)}\b", exp_content))
            if w_count > 2:
                repetitions_found.append({
                    "word": w,
                    "count": w_count,
                    "severity": "medium" if w_count > 4 else "low"
                })
                
        # Check start of bullet repetitions
        start_reps_count = len(re.findall(r"•\s*responsible\s+for", exp_content))
        if start_reps_count > 1:
            bullet_start_reps.append({
                "phrase": "Responsible for",
                "count": start_reps_count
            })
            
        rep_status = "warning" if (len(repetitions_found) > 1 or bullet_start_reps) else "pass"
        
        # 5. Bullets point and Consistency check
        # Check if all bullets end with periods or not
        ended_with_period = len(re.findall(r"•.*?\.\s*(?=\n|•|▪|$)", exp_content))
        total_exp_bullets = len(re.findall(r"•|▪", exp_content)) or 5
        bullets_consistent = (ended_with_period == 0 or ended_with_period == total_exp_bullets)
        
        bullets_issues = []
        if not bullets_consistent:
            bullets_issues.append("Punctuation mismatch: Some bullets end with periods and some do not. Standardize all to end with a period or exclude them completely.")
        
        # Check for bullet length
        very_long_bullets = len(re.findall(r"•\s*[^•\n]{150,}", exp_content))
        if very_long_bullets > 0:
            bullets_issues.append(f"Found {very_long_bullets} excessively long bullet point(s) (over 150 characters). Split them or make them concise.")
            
        bullet_status = "warning" if bullets_issues else "pass"
        
        # 6. Essential Sections check
        essential_list = ["education", "experience", "skills", "summary"]
        missing_sections = []
        for sect in essential_list:
            if sect not in user_lower:
                missing_sections.append(sect.capitalize())
                
        essential_status = "fail" if missing_sections else "pass"
        sections_issues = []
        if missing_sections:
            sections_issues.append(f"Missing essential section(s): {', '.join(missing_sections)}. Add these to conform to standard CV practices.")
            
        # 7. Contact Information check
        email_present = "email" in user_lower or "@" in user_lower
        phone_present = "phone" in user_lower or re.search(r"\d{3}-\d{3}", user_lower) is not None
        location_present = "location" in user_lower or "address" in user_lower or "san francisco" in user_lower or "new york" in user_lower or "austin" in user_lower or "bangalore" in user_lower or "london" in user_lower or "remote" in user_lower
        linkedin_present = "linkedin.com" in user_lower
        github_present = "github.com" in user_lower
        
        contact_issues = []
        if not email_present: contact_issues.append("Missing email address.")
        if not phone_present: contact_issues.append("Missing phone number.")
        if not linkedin_present: contact_issues.append("LinkedIn profile link not found in header.")
        if not github_present: contact_issues.append("GitHub profile link not found in header.")
        
        contact_status = "warning" if len(contact_issues) > 0 else "pass"
        
        # 8. Section Orders check
        order_list = ["contact", "summary", "experience", "education", "skills"]
        ordering_issues = []
        # Simulate check
        if "education" in user_lower and "experience" in user_lower:
            edu_idx = user_lower.find("education")
            exp_idx = user_lower.find("experience")
            if edu_idx < exp_idx and "student" not in user_lower and "graduate" not in user_lower:
                ordering_issues.append("Education section is listed before Work Experience. For professional CVs, place Work Experience above Education.")
                
        ordering_status = "warning" if ordering_issues else "pass"
        
        # 9. Design check
        word_count = len(user.split())
        page_est = max(1, word_count // 450)
        design_issues = []
        if word_count > 800:
            design_issues.append("Word count exceeds 800 words, which may lead to a cluttered 2-page or bloated 1-page layout.")
        elif word_count < 150:
            design_issues.append("CV is too sparse (under 150 words). Add more details to your projects and roles.")
            
        design_status = "warning" if design_issues else "pass"
        
        # 10. Email address, header links, and file name
        email_valid = email_present and "@" in user_lower and "." in user_lower
        filename_valid = "resume" in filename.lower() and not any(bad in filename.lower() for bad in ["draft", "copy", "v1", "v2", "final", "edit"])
        
        ehf_issues = []
        if not email_valid:
            ehf_issues.append("Email format seems incomplete or invalid.")
        if not filename_valid:
            ehf_issues.append(f"The file name '{filename}' contains unprofessional keywords (e.g. 'draft', 'v1', 'v2'). Rename it to 'Firstname_Lastname_Resume.pdf'.")
            
        ehf_status = "warning" if ehf_issues else "pass"
        
        # 11. Dates and Links formatting in headings
        date_format_consistent = True
        headings_have_links = ("github.com" in user_lower or "http" in user_lower)
        
        dlh_issues = []
        if not headings_have_links:
            dlh_issues.append("Your project or certification headings lack clickable source links. Add GitHub, Behance or live deployment links.")
            
        dlh_status = "warning" if dlh_issues else "pass"
        
        # 12. Credibility Check (skills vs experience)
        cred_issues = []
        matched_skills = []
        for sk in skills[:5]:
            if sk in exp_content:
                matched_skills.append({
                    "skill": sk.capitalize(),
                    "evidenced_in": "Experience bullet points"
                })
            else:
                cred_issues.append(f"Skill '{sk.capitalize()}' is listed in your skills block but not supported by any work experience detail.")
                
        cred_status = "warning" if cred_issues else "pass"
        
        # 13. Risk analysis, Gaps, Benchmarking, Career progression
        gaps = []
        # Check timeline gaps
        if "january 2024" in user_lower or "2024" in user_lower:
            gaps.append({
                "start": "January 2024",
                "end": "June 2024",
                "duration_months": 5,
                "severity": "moderate"
            })
            
        # Career progression check
        progression = "clear_trajectory"
        if "junior" in user_lower and "senior" in user_lower:
            progression = "clear_trajectory"
        elif "junior" in user_lower and "intern" in user_lower:
            progression = "clear_trajectory"
        else:
            progression = "unclear"
            
        # Leadership signals
        leaderships = []
        for lead_term in ["spearheaded", "led", "managed", "architected", "directed", "launched"]:
            if lead_term in user_lower:
                leaderships.append(lead_term.capitalize())
                
        # Ageism dates check (dates prior to 2010)
        ageism_risk = "low"
        old_dates = re.findall(r"\b(19\d{2}|200[0-9])\b", user_lower)
        if old_dates:
            ageism_risk = "medium"
            
        risk_issues = []
        if ageism_risk == "medium":
            risk_issues.append("Contains history going back older than 15 years. Consider removing or summarizing outdated experience to prevent age bias.")
        if gaps:
            risk_issues.append("Employment gap detected (Jan 2024 - Jun 2024). Use the Gap Advisor tab to reframe this period.")
            
        score = max(55, min(98, 85 - len(spelling_errors) * 4 - len(contact_issues) * 5 - len(missing_sections) * 8))
        
        return json.dumps({
            "score": score,
            "parsing": {
                "status": "pass",
                "details": parsing_details
            },
            "spelling_grammar": {
                "status": spelling_status,
                "error_count": len(spelling_errors) if spelling_status == "warning" else 0,
                "errors": spelling_errors
            },
            "quantify_impact": {
                "status": quant_status,
                "quantified_percentage": quantified_pct,
                "issues": quant_issues,
                "tips": quant_tips
            },
            "repetitions": {
                "status": rep_status,
                "repeated_words": repetitions_found,
                "bullet_start_repetitions": bullet_start_reps
            },
            "bullets_consistency": {
                "status": bullet_status,
                "punctuation_consistent": bullets_consistent,
                "length_consistent": very_long_bullets == 0,
                "issues": bullets_issues
            },
            "essential_sections": {
                "status": essential_status,
                "present": [s for s in essential_list if s in user_lower],
                "missing": [s.capitalize() for s in essential_list if s not in user_lower],
                "issues": sections_issues
            },
            "contact_info": {
                "status": contact_status,
                "email_present": email_present,
                "phone_present": phone_present,
                "location_present": location_present,
                "linkedin_present": linkedin_present,
                "github_present": github_present,
                "issues": contact_issues
            },
            "section_ordering": {
                "status": ordering_status,
                "order": ["contact", "summary", "experience", "education", "skills"] if not ordering_issues else ["contact", "education", "experience", "skills"],
                "issues": ordering_issues
            },
            "design_check": {
                "status": design_status,
                "word_count": word_count,
                "page_length_estimate": page_est,
                "issues": design_issues
            },
            "email_header_filename": {
                "status": ehf_status,
                "email_valid": email_valid,
                "header_links_clickable": linkedin_present or github_present,
                "filename_valid": filename_valid,
                "issues": ehf_issues
            },
            "dates_links_headings": {
                "status": dlh_status,
                "date_format_consistent": date_format_consistent,
                "headings_have_links": headings_have_links,
                "issues": dlh_issues
            },
            "credibility_verification": {
                "status": cred_status,
                "issues": cred_issues,
                "matched_skills": matched_skills
            },
            "risk_benchmarking_gaps": {
                "interview_risk": "low" if score >= 80 else ("medium" if score >= 65 else "high"),
                "peer_benchmarking_percentile": score - 5,
                "linkedin_match_status": "matched" if linkedin_present else "missing",
                "ageism_date_bias_risk": ageism_risk,
                "employment_gaps": gaps,
                "career_progression": progression,
                "skill_evidence_score": quantified_pct,
                "leadership_signals": leaderships,
                "issues": risk_issues
            }
        })

    else:
        return '{"score": 80, "status": "success", "message": "Development mock response"}'


def call_claude(
    system: str, user: str,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 1000, retries: int = 2,
    temperature: float = 0.3, allow_fallback: bool = True,
) -> str:
    # Local Development Mock Fallback
    if os.environ.get("ENVIRONMENT") == "development" or os.environ.get("ANTHROPIC_API_KEY", "").startswith("sk-ant-..."):
        return _generate_smart_mock_response(system, user)

    client = _get_claude()
    last_error = None
    for attempt in range(retries + 1):
        try:
            msg = client.messages.create(
                model=model, max_tokens=max_tokens, system=system,
                messages=[{"role": "user", "content": user}],
            )
            return msg.content[0].text
        except anthropic.RateLimitError as e:
            last_error = e
            if allow_fallback and attempt == retries:
                return _fallback_to_openai(system, user, max_tokens, temperature)
            time.sleep(2 ** attempt)
        except anthropic.APIStatusError as e:
            last_error = e
            if e.status_code >= 500:
                if allow_fallback and attempt == retries:
                    return _fallback_to_openai(system, user, max_tokens, temperature)
                time.sleep(2 ** attempt); continue
            raise
        except Exception as e:
            last_error = e
            if attempt < retries: time.sleep(1)
    raise RuntimeError(f"Claude API failed after {retries+1} attempts: {last_error}")


def _fallback_to_openai(system, user, max_tokens, temperature):
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if not openai_key:
        raise RuntimeError("Claude unavailable and no OPENAI_API_KEY for fallback.")
    print("[llm_client] ⚠️ Claude unavailable — falling back to GPT-4o")
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=openai_key)
    resp = _openai_client.chat.completions.create(
        model="gpt-4o", max_tokens=max_tokens, temperature=temperature,
        messages=[{"role":"system","content":system},{"role":"user","content":user}],
    )
    return resp.choices[0].message.content
