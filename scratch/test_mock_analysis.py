import re
import json

def extract_regex(pattern, text, default=""):
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else default

def test_mock_analysis(user: str, filename: str = "Candidate_Resume_Draft_v2.pdf"):
    role = extract_regex(r"TARGET JOB ROLE:\s*(.*)", user) or "Software Engineer"
    demanded_skills_str = extract_regex(r"DEMANDED SKILLS:\s*(.*)", user)
    demanded_skills = [s.strip().lower() for s in demanded_skills_str.split(",") if s.strip()] if demanded_skills_str else []
    
    skills_str = extract_regex(r"RESUME SKILLS:\s*(.*)", user)
    skills = [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else []
    skills_lower = [s.lower() for s in skills]
    
    # Extract Contact
    contact = {}
    contact["name"] = extract_regex(r"-\s*Name:\s*(.*)", user)
    contact["email"] = extract_regex(r"-\s*Email:\s*(.*)", user)
    contact["phone"] = extract_regex(r"-\s*Phone:\s*(.*)", user)
    contact["location"] = extract_regex(r"-\s*Location:\s*(.*)", user)
    contact["linkedin"] = extract_regex(r"-\s*LinkedIn:\s*(.*)", user)
    contact["github"] = extract_regex(r"-\s*GitHub:\s*(.*)", user)
    
    # Reconstruct Experience
    exp_block = extract_regex(r"RESUME EXPERIENCE:\s*([\s\S]*?)(?=RESUME PROJECTS:|$)", user)
    exp_entries = []
    if exp_block:
        parts = re.split(r"\n-\s*Title:\s*", "\n" + exp_block)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            lines = part.splitlines()
            header = lines[0]
            
            title = extract_regex(r"^(.*?)\s*\|\s*Company:", header) or header.split("|")[0].strip()
            company = extract_regex(r"Company:\s*(.*?)\s*\|\s*Dates:", header)
            dates = extract_regex(r"Dates:\s*(.*)", header)
            
            bullets = []
            for line in lines[1:]:
                line_stripped = line.strip()
                if line_stripped.startswith("•") or line_stripped.startswith("▪") or line_stripped.startswith("-"):
                    bullet_text = re.sub(r"^[•▪\-\*]\s*", "", line_stripped).strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                        
            start_date = ""
            end_date = ""
            if dates:
                date_parts = [d.strip() for d in dates.split("-")]
                if len(date_parts) >= 1: start_date = date_parts[0]
                if len(date_parts) >= 2: end_date = date_parts[1]
                
            exp_entries.append({
                "title": title,
                "company": company,
                "start": start_date,
                "end": end_date,
                "bullets": bullets
            })
            
    # Reconstruct Projects
    proj_block = extract_regex(r"RESUME PROJECTS:\s*([\s\S]*?)(?=RESUME EDUCATION:|$)", user)
    proj_entries = []
    if proj_block:
        parts = re.split(r"\n-\s*Project:\s*", "\n" + proj_block)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            lines = part.splitlines()
            header = lines[0]
            name = header.split("|")[0].strip()
            
            bullets = []
            for line in lines[1:]:
                line_stripped = line.strip()
                if line_stripped.startswith("•") or line_stripped.startswith("▪") or line_stripped.startswith("-"):
                    bullet_text = re.sub(r"^[•▪\-\*]\s*", "", line_stripped).strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                        
            proj_entries.append({
                "name": name,
                "bullets": bullets
            })

    # Reconstruct Education
    edu_block = extract_regex(r"RESUME EDUCATION:\s*([\s\S]*?)(?=RESUME SECTIONS PRESENT:|$)", user)
    edu_entries = []
    if edu_block:
        for line in edu_block.splitlines():
            line_stripped = line.strip()
            if line_stripped.startswith("-") or line_stripped.startswith("•"):
                edu_text = re.sub(r"^[\-•]\s*", "", line_stripped).strip()
                if edu_text:
                    edu_entries.append(edu_text)

    # 1. Parsing Check
    parsing_details = f"Successfully parsed candidate contact header ({'email' if contact.get('email') else 'no email'}), {len(skills)} skills, {len(exp_entries)} experience roles, and {len(edu_entries)} education entries."
    
    # 2. Spelling & Grammar check
    spelling_errors = []
    typos = {
        r"\bdevloper\b": ("devloper", "developer"),
        r"\bmanger\b": ("manger", "manager"),
        r"\bresposible\b": ("resposible", "responsible"),
        r"\benviroment\b": ("enviroment", "environment"),
        r"\bseperate\b": ("seperate", "separate"),
        r"\brecieve\b": ("recieve", "receive"),
        r"\bteh\b": ("teh", "the"),
        r"\bsucessfully\b": ("sucessfully", "successfully"),
    }
    for pattern, (wrong, right) in typos.items():
        if re.search(pattern, user, re.IGNORECASE):
            spelling_errors.append(f"Spelling typo found: '{wrong}'. Should be '{right}'.")
            
    tech_case_checks = {
        r"\breact\b": ("react", "React"),
        r"\bjavascript\b": ("javascript", "JavaScript"),
        r"\btypescript\b": ("typescript", "TypeScript"),
        r"\bnodejs\b": ("nodejs", "Node.js"),
        r"\bgithub\b": ("github", "GitHub"),
        r"\bdocker\b": ("docker", "Docker"),
        r"\bkubernetes\b": ("kubernetes", "Kubernetes"),
        r"\bpostgresql\b": ("postgresql", "PostgreSQL"),
        r"\bmongodb\b": ("mongodb", "MongoDB"),
        r"\baws\b": ("aws", "AWS"),
        r"\bhtml\b": ("html", "HTML"),
        r"\bcss\b": ("css", "CSS"),
        r"\bfastapi\b": ("fastapi", "FastAPI"),
        r"\bgcp\b": ("gcp", "GCP"),
        r"\bapi\b": ("api", "API"),
        r"\bapis\b": ("apis", "APIs"),
        r"\bgit\b": ("git", "Git"),
    }
    for pattern, (wrong, right) in tech_case_checks.items():
        if re.search(pattern, user):
            spelling_errors.append(f"Capitalization issue: '{wrong}' should be capitalized as '{right}'.")
            
    spelling_errors = list(set(spelling_errors))
    if not spelling_errors:
        spelling_errors.append("Consider replacing passive phrasing 'Responsible for building' with active action verb 'Architected'.")
    spelling_status = "warning" if any("typo" in err or "Capitalization" in err for err in spelling_errors) else "pass"
    
    # 3. Quantify Impact
    def is_quantified(bullet):
        if "%" in bullet or "$" in bullet or "£" in bullet or "€" in bullet:
            return True
        numbers = re.findall(r"\b\d+(?:\.\d+)?\b", bullet)
        for num in numbers:
            val = float(num)
            if 1990 <= val <= 2030:
                continue
            return True
        metric_words = ["percent", "million", "billion", "thousands", "speedup", "latency", "savings", "users", "hours", "days", "weeks"]
        bullet_lower = bullet.lower()
        if any(w in bullet_lower for w in metric_words):
            if re.search(r"\b\d+\b", bullet):
                return True
        return False
        
    total_bullets_list = []
    for exp in exp_entries:
        total_bullets_list.extend(exp["bullets"])
    for proj in proj_entries:
        total_bullets_list.extend(proj["bullets"])
        
    total_bullets_count = len(total_bullets_list)
    quantified_bullets_count = sum(1 for b in total_bullets_list if is_quantified(b))
    quantified_pct = int((quantified_bullets_count / max(1, total_bullets_count)) * 100) if total_bullets_count > 0 else 0
    
    quant_issues = []
    quant_tips = []
    unquantified_bullets = [b for b in total_bullets_list if not is_quantified(b)]
    for b in unquantified_bullets[:3]:
        snippet = b[:60] + "..." if len(b) > 60 else b
        quant_issues.append(f"Bullet lacks quantifiable impact: '{snippet}'")
        b_lower = b.lower()
        suggested_rewrite = ""
        if "api" in b_lower or "backend" in b_lower or "fastapi" in b_lower or "django" in b_lower or "node" in b_lower:
            suggested_rewrite = "e.g., 'Designed and optimized APIs, reducing response latency by 35% and handling 15,000+ daily requests.'"
        elif "frontend" in b_lower or "ui" in b_lower or "react" in b_lower or "interface" in b_lower:
            suggested_rewrite = "e.g., 'Rebuilt the frontend dashboard, improving page load speed by 40% and user engagement by 18%.'"
        elif "database" in b_lower or "sql" in b_lower or "postgres" in b_lower or "mongodb" in b_lower:
            suggested_rewrite = "e.g., 'Optimized database queries and indexing, reducing average search latency by 50%.'"
        elif "test" in b_lower or "ci/cd" in b_lower or "docker" in b_lower:
            suggested_rewrite = "e.g., 'Automated deployment pipelines, cutting build-to-deploy times by 25 minutes.'"
        else:
            suggested_rewrite = "e.g., 'adding specific outcomes like: boosting process efficiency by 25% or saving 8 hours of work weekly.'"
        quant_tips.append(f"For '{snippet}', add a metric, {suggested_rewrite}")
        
    if quantified_pct < 50:
        quant_status = "warning"
        if not quant_issues:
            quant_issues.append("Only a small portion of your bullet points contain impact metrics. Add percentages, dollar savings, or scale.")
    else:
        quant_status = "pass"
    if not quant_tips:
        quant_tips.append("Your resume shows strong impact metrics. Keep using specific percentages and figures.")

    # 4. Word Repetitions
    stopwords = {"the", "and", "to", "in", "for", "of", "a", "with", "on", "that", "is", "by", "as", "an", "at", "from", "was", "were", "or", "it", "their", "our", "this", "be", "an", "has", "have", "had", "using", "with", "through", "using", "about", "into", "all", "project", "system", "application", "role", "team"}
    all_words = []
    for b in total_bullets_list:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", b.lower())
        all_words.extend(words)
    word_counts = {}
    for w in all_words:
        if w not in stopwords:
            word_counts[w] = word_counts.get(w, 0) + 1
    overused = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    repetitions_found = []
    for w, c in overused:
        if c > 2:
            if w in ["react", "python", "docker", "aws", "kubernetes", "postgresql", "typescript", "javascript", "django", "fastapi"]:
                continue
            repetitions_found.append({"word": w, "count": c, "severity": "high" if c > 4 else "medium"})
    repetitions_found = repetitions_found[:4]
    
    bullet_starts = {}
    for b in total_bullets_list:
        words = b.strip().split()
        if words:
            first_word = words[0].strip(",.!?").capitalize()
            if len(first_word) > 2:
                bullet_starts[first_word] = bullet_starts.get(first_word, 0) + 1
    bullet_start_reps = [{"phrase": k, "count": v} for k, v in bullet_starts.items() if v > 1]
    bullet_start_reps = sorted(bullet_start_reps, key=lambda x: x["count"], reverse=True)[:3]
    rep_status = "warning" if (repetitions_found or bullet_start_reps) else "pass"

    # 5. Bullets Consistency
    bullets_with_periods = sum(1 for b in total_bullets_list if b.endswith("."))
    bullets_without_periods = total_bullets_count - bullets_with_periods
    bullets_consistent = (bullets_with_periods == 0 or bullets_without_periods == 0)
    bullets_issues = []
    if not bullets_consistent:
        bullets_issues.append(
            f"Punctuation mismatch: {bullets_with_periods} bullet points end with periods and {bullets_without_periods} do not. Standardize all to end with a period or exclude them."
        )
        periods_bullets = [b for b in total_bullets_list if b.endswith(".")][:1]
        noperiods_bullets = [b for b in total_bullets_list if not b.endswith(".")][:1]
        if periods_bullets and noperiods_bullets:
            bullets_issues.append(f"Example with period: '{periods_bullets[0][:40]}...' vs Example without: '{noperiods_bullets[0][:40]}...'")
    
    very_long_bullets = [b for b in total_bullets_list if len(b) > 180]
    if very_long_bullets:
        bullets_issues.append(f"Found {len(very_long_bullets)} excessively long bullet point(s) (over 180 characters). Split them or make them concise.")
        for b in very_long_bullets[:2]:
            bullets_issues.append(f"Long bullet: '{b[:50]}...' ({len(b)} chars)")
    bullet_status = "warning" if bullets_issues else "pass"

    # 6. Essential Sections
    essential_list = ["summary", "experience", "education", "skills"]
    present_sections = []
    missing_sections = []
    user_lower = user.lower()
    section_synonyms = {
        "summary": ["summary", "profile", "about", "professional statement"],
        "experience": ["experience", "employment", "work history", "career history"],
        "education": ["education", "academic", "university", "college"],
        "skills": ["skills", "technical skills", "competencies", "expertise"]
    }
    for section, synonyms in section_synonyms.items():
        found = False
        for syn in synonyms:
            if syn in user_lower:
                found = True
                break
        if found:
            present_sections.append(section.capitalize())
        else:
            missing_sections.append(section.capitalize())
    essential_status = "fail" if missing_sections else "pass"
    sections_issues = []
    if missing_sections:
        sections_issues.append(f"Missing essential section(s): {', '.join(missing_sections)}. Add these sections to conform to standard CV structures.")

    # 7. Contact Info Layout
    email_present = bool(contact.get("email") and "@" in contact.get("email") and "." in contact.get("email"))
    phone_present = bool(contact.get("phone") and re.search(r"\d", contact.get("phone")))
    location_present = bool(contact.get("location") and len(contact.get("location").strip()) > 3)
    linkedin_present = bool(contact.get("linkedin") and "linkedin.com" in contact.get("linkedin").lower())
    github_present = bool(contact.get("github") and "github.com" in contact.get("github").lower())
    
    contact_issues = []
    if not email_present: contact_issues.append("Missing or invalid email address.")
    if not phone_present: contact_issues.append("Missing phone number.")
    if not location_present: contact_issues.append("Missing location (City, State/Country).")
    if not linkedin_present: contact_issues.append("LinkedIn profile link not found in CV header.")
    if not github_present: contact_issues.append("GitHub profile link not found in CV header.")
    contact_status = "warning" if contact_issues else "pass"

    # 8. Section Hierarchy
    ordering_issues = []
    edu_pos = user_lower.find("education")
    exp_pos = user_lower.find("experience")
    if edu_pos != -1 and exp_pos != -1:
        is_entry_level = any(w in user_lower for w in ["student", "graduate", "intern", "junior"])
        if edu_pos < exp_pos and not is_entry_level:
            ordering_issues.append("Education section is listed before Work Experience. Place experience higher for professional CVs.")
    ordering_status = "warning" if ordering_issues else "pass"

    # 9. Design Check
    word_count = len(user.split())
    estimated_resume_words = int(word_count * 0.6)
    if estimated_resume_words < 100: estimated_resume_words = 150
    page_est = max(1, estimated_resume_words // 450)
    design_issues = []
    if estimated_resume_words > 800:
        design_issues.append(f"Word count is high ({estimated_resume_words} words). A cluttered CV can look unprofessional.")
    elif estimated_resume_words < 200:
        design_issues.append(f"CV is too short ({estimated_resume_words} words). Add more details to recent roles.")
    design_status = "warning" if design_issues else "pass"

    # 10. Email, Header, Filename
    email_valid = email_present and "@" in contact.get("email", "")
    filename_valid = "resume" in filename.lower() and not any(bad in filename.lower() for bad in ["draft", "copy", "v1", "v2", "final", "edit"])
    ehf_issues = []
    if not email_valid: ehf_issues.append("Email address is missing or invalid.")
    if not filename_valid: ehf_issues.append(f"Unprofessional filename '{filename}'. Use 'Firstname_Lastname_Resume.pdf'.")
    ehf_status = "warning" if ehf_issues else "pass"

    # 11. Dates & Heading Links
    date_formats = []
    for exp in exp_entries:
        start = exp.get("start", "").strip()
        end = exp.get("end", "").strip()
        for d in [start, end]:
            if not d: continue
            if re.match(r"^\d{1,2}/\d{4}$", d): date_formats.append("numeric")
            elif re.match(r"^[a-zA-Z]+\s+\d{4}$", d) or re.match(r"^[a-zA-Z]+,\s+\d{4}$", d): date_formats.append("textual")
            elif re.match(r"^\d{4}$", d): date_formats.append("year_only")
    unique_formats = set(date_formats)
    date_format_consistent = len(unique_formats) <= 1
    dlh_issues = []
    if not date_format_consistent:
        dlh_issues.append("Inconsistent date formats. Standardize all dates to a single style (e.g. 'Jan 2021').")
    headings_have_links = "http" in user_lower or "www." in user_lower or "github.com" in user_lower
    if not headings_have_links and len(proj_entries) > 0:
        dlh_issues.append("Projects lack links to GitHub, demo deployments, or live sites.")
    dlh_status = "warning" if dlh_issues else "pass"

    # 12. Credibility Check
    cred_issues = []
    matched_skills = []
    exp_proj_text = ""
    for exp in exp_entries:
        exp_proj_text += " " + exp["title"] + " " + exp["company"] + " ".join(exp["bullets"])
    for proj in proj_entries:
        exp_proj_text += " " + proj["name"] + " ".join(proj["bullets"])
    exp_proj_text_lower = exp_proj_text.lower()
    for sk in skills:
        sk_lower = sk.lower()
        if re.search(rf"\b{re.escape(sk_lower)}\b", exp_proj_text_lower):
            evidenced_in = "Work Experience"
            for exp in exp_entries:
                exp_full = exp["title"] + " " + exp["company"] + " ".join(exp["bullets"])
                if re.search(rf"\b{re.escape(sk_lower)}\b", exp_full.lower()):
                    evidenced_in = exp["company"] or exp["title"]
                    break
            for proj in proj_entries:
                proj_full = proj["name"] + " ".join(proj["bullets"])
                if re.search(rf"\b{re.escape(sk_lower)}\b", proj_full.lower()):
                    evidenced_in = f"Project: {proj['name']}"
                    break
            matched_skills.append({"skill": sk, "evidenced_in": evidenced_in})
        else:
            cred_issues.append(f"Skill '{sk}' is listed in skills block but not supported by any experience or project bullet.")
    matched_skills = matched_skills[:6]
    cred_issues = cred_issues[:4]
    cred_status = "warning" if cred_issues else "pass"

    # 13. Risk, Benchmarking & Gaps
    ageism_risk = "low"
    all_years = re.findall(r"\b(19\d{2}|200\d)\b", user)
    if all_years: ageism_risk = "medium"
    
    def parse_date_to_val(d_str):
        d_str = d_str.strip().lower()
        if not d_str: return None
        if "present" in d_str or "current" in d_str: return 2026.5
        yr_match = re.search(r"\b(\d{4})\b", d_str)
        if not yr_match: return None
        year = int(yr_match.group(1))
        months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        month_idx = 0
        for idx, m in enumerate(months):
            if m in d_str:
                month_idx = idx
                break
        return year + (month_idx / 12.0)

    job_periods = []
    for exp in exp_entries:
        start_val = parse_date_to_val(exp.get("start", ""))
        end_val = parse_date_to_val(exp.get("end", ""))
        if start_val and end_val:
            job_periods.append({
                "start_str": exp.get("start", ""),
                "end_str": exp.get("end", ""),
                "start_val": start_val,
                "end_val": end_val,
                "company": exp.get("company", "")
            })
    job_periods.sort(key=lambda x: x["end_val"], reverse=True)
    gaps = []
    for i in range(len(job_periods) - 1):
        current_job = job_periods[i]
        next_job = job_periods[i+1]
        gap_duration_years = current_job["start_val"] - next_job["end_val"]
        gap_months = int(gap_duration_years * 12)
        if gap_months > 3:
            severity = "low"
            if gap_months > 12: severity = "severe"
            elif gap_months > 6: severity = "moderate"
            gaps.append({
                "start": next_job["end_str"],
                "end": current_job["start_str"],
                "duration_months": gap_months,
                "severity": severity
            })
            
    progression = "clear_trajectory"
    titles_lower = [exp.get("title", "").lower() for exp in exp_entries]
    has_senior = any("senior" in t or "lead" in t or "manager" in t or "architect" in t for t in titles_lower)
    has_junior = any("junior" in t or "intern" in t or "associate" in t for t in titles_lower)
    if has_senior and has_junior: progression = "clear_trajectory"
    elif len(exp_entries) >= 3: progression = "clear_trajectory"
    else: progression = "unclear"

    leaderships = []
    lead_terms = ["spearheaded", "led", "managed", "architected", "directed", "launched", "championed", "supervised", "mentored"]
    for term in lead_terms:
        if re.search(r"\b" + re.escape(term) + r"\b", exp_block.lower() if exp_block else ""):
            leaderships.append(term.capitalize())
            
    risk_issues = []
    if ageism_risk == "medium":
        risk_issues.append("Contains history going back older than 15 years. Consider removing or summarizing outdated experience to prevent age bias.")
    for gap in gaps:
        risk_issues.append(f"Employment gap detected ({gap['duration_months']} months) between {gap['start']} and {gap['end']}. Reframe this gap in the Gap Advisor tab.")
    if not leaderships and len(exp_entries) > 2:
        risk_issues.append("Limited leadership verbs. Try incorporating verbs like 'Spearheaded', 'Mentored', or 'Architected' to show ownership.")

    print("\nBullets consistency:")
    print("consistent:", bullets_consistent)
    print("issues:", bullets_issues)
    print("status:", bullet_status)
    print("\nEssential sections:")
    print("present:", present_sections)
    print("missing:", missing_sections)
    print("issues:", sections_issues)
    print("status:", essential_status)
    print("\nContact layout:")
    print("issues:", contact_issues)
    print("status:", contact_status)
    print("\nSection Hierarchy:")
    print("issues:", ordering_issues)
    print("status:", ordering_status)
    print("\nDesign Check:")
    print("words:", estimated_resume_words)
    print("pages:", page_est)
    print("issues:", design_issues)
    print("status:", design_status)
    print("\nEmail/Header/Filename:")
    print("issues:", ehf_issues)
    print("status:", ehf_status)
    print("\nDates/Links/Headings:")
    print("issues:", dlh_issues)
    print("status:", dlh_status)
    print("\nCredibility:")
    print("issues:", cred_issues)
    print("matched:", matched_skills)
    print("status:", cred_status)
    print("\nRisk Gaps Benchmarking:")
    print("gaps:", gaps)
    print("progression:", progression)
    print("leaderships:", leaderships)
    print("issues:", risk_issues)

# Generate a sample user prompt
user_prompt = """Perform a complete, detailed 13-point audit of this CV.

TARGET JOB ROLE: Senior Software Engineer
DEMANDED SKILLS: Python, React, FastAPI

CANDIDATE CONTACT DETAILS:
- Name: Ashwani Kumar
- Email: ashwani@example.com
- Phone: 123-456-7890
- Location: Noida, India
- LinkedIn: linkedin.com/in/ashwani
- GitHub: github.com/ashwani

RESUME FILENAME: Ashwani_Resume_Draft_v2.pdf

RESUME SKILLS: python, react, fastapi, postgresql, docker, git

RESUME CERTIFICATIONS: AWS Cloud Practitioner

RESUME EXPERIENCE:
- Title: Senior Developer | Company: Tech Solutions | Dates: Jan 2021 - Present
  • developed web applications using react and nodejs.
  • developed and optimized APIs with fastapi and postgresql.
  • managed a team of developers.
- Title: devloper | Company: Old Co | Dates: Jun 2019 - Dec 2020
  • Worked on legacy python backend databases.

RESUME PROJECTS:
- Project: API Gateway | Custom gateway.
  • Built using python.

RESUME EDUCATION:
- B.Tech in CSE at NIT (Dates: 2015-2019)

RESUME SECTIONS PRESENT: ['contact', 'skills', 'experience', 'projects', 'education']
"""

test_mock_analysis(user_prompt)
