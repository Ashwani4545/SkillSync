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

    if "ats" in system_lower or "compatibility" in system_lower:
        # Extract skills
        skills_str = extract_regex(r"RESUME SKILLS:\s*(.*)", user)
        skills = [s.strip().lower() for s in skills_str.split(",") if s.strip()] if skills_str else []
        
        # Extract JD
        jd = extract_regex(r"JOB DESCRIPTION:\s*([\s\S]*)", user)
        
        # Common tech keywords list to scan
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
                # Match with word boundaries
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
            # If no JD, default to found = candidate skills, missing = a few standard things
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
        
        # Format issues
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

    elif "grade" in system_lower or "section" in system_lower:
        # Extract sections
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

    elif "rewrite" in system_lower or "bullet" in system_lower:
        # Extract bullets to rewrite
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
