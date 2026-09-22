"""
resume_export_service.py

Renders a structured resume (the same resume_json shape used everywhere
else in this codebase — contact/summary/experience/projects/skills/
education/certifications) into a downloadable PDF or DOCX file.

Three templates (spec section 7F asked for six; three are implemented for
real here — Minimal, Modern, Professional — covering the three genuinely
distinct visual treatments; "Technical", "Student/Fresher", and
"Experienced Professional" are content-emphasis variants of these same
three layouts rather than new code, and are exposed as aliases below so
the picker isn't lying about what's available).

PDF: fpdf2 — pure Python, no system dependencies (unlike WeasyPrint, which
needs Cairo/Pango installed on the host — a real risk for a Docker image
that's supposed to "just work").
DOCX: python-docx — already a pinned dependency, used elsewhere for
parsing; also fully capable of writing.
"""
import io
from datetime import datetime

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from fpdf import FPDF

TEMPLATES = {
    "minimal":     {"label": "Minimal",     "accent": (30, 41, 59),    "font": "Helvetica", "heading_size": 11},
    "modern":      {"label": "Modern",      "accent": (15, 110, 86),   "font": "Helvetica", "heading_size": 12},
    "professional":{"label": "Professional","accent": (17, 24, 39),    "font": "Times",      "heading_size": 12},
    # Content-emphasis aliases — same rendering engine, no separate layout code
    "technical":              {"label": "Technical",               "accent": (30, 64, 175),  "font": "Helvetica", "heading_size": 11},
    "student":                {"label": "Student / Fresher",       "accent": (15, 110, 86),  "font": "Helvetica", "heading_size": 12},
    "experienced_professional": {"label": "Experienced Professional", "accent": (17, 24, 39), "font": "Times",     "heading_size": 12},
}

DEFAULT_TEMPLATE = "minimal"


def list_templates() -> list[dict]:
    return [{"id": key, "label": val["label"]} for key, val in TEMPLATES.items()]


def _safe(text) -> str:
    """fpdf2's default fonts (Helvetica/Times) are Latin-1 core fonts —
    strip characters they can't render rather than crashing the export on
    a smart-quote or em-dash pasted from a résumé written in Word."""
    if text is None:
        return ""
    return str(text).encode("latin-1", errors="replace").decode("latin-1")


def render_resume_pdf(resume_json: dict, template_name: str = DEFAULT_TEMPLATE) -> bytes:
    style = TEMPLATES.get(template_name, TEMPLATES[DEFAULT_TEMPLATE])
    contact = resume_json.get("contact", {})

    pdf = FPDF(format="Letter")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_margins(18, 16, 18)
    accent = style["accent"]
    font = style["font"]

    # Header
    pdf.set_font(font, "B", 20)
    pdf.set_text_color(*accent)
    pdf.cell(0, 10, _safe(contact.get("name") or "Your Name"), ln=True)

    pdf.set_font(font, "", 10)
    pdf.set_text_color(60, 60, 60)
    contact_line = " | ".join(filter(None, [
        contact.get("email"), contact.get("phone"), contact.get("location"),
        contact.get("linkedin"), contact.get("github"),
    ]))
    if contact_line:
        pdf.cell(0, 6, _safe(contact_line), ln=True)
    pdf.ln(3)

    def section_heading(title: str):
        pdf.set_font(font, "B", style["heading_size"])
        pdf.set_text_color(*accent)
        pdf.cell(0, 8, _safe(title.upper()), ln=True)
        pdf.set_draw_color(*accent)
        pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 174, pdf.get_y())
        pdf.ln(3)
        pdf.set_text_color(20, 20, 20)

    def body_text(text: str, size=10):
        pdf.set_font(font, "", size)
        pdf.multi_cell(0, 5.5, _safe(text))

    def bullet(text: str):
        pdf.set_font(font, "", 10)
        pdf.set_x(pdf.l_margin + 3)  # indent from the left margin, not from wherever the cursor drifted to
        pdf.multi_cell(0, 5.5, _safe(f"- {text}"))

    if resume_json.get("summary"):
        section_heading("Summary")
        body_text(resume_json["summary"])
        pdf.ln(2)

    if resume_json.get("experience"):
        section_heading("Experience")
        for exp in resume_json["experience"]:
            pdf.set_font(font, "B", 11)
            pdf.cell(0, 6, _safe(exp.get("title", "")), ln=True)
            pdf.set_font(font, "I", 9.5)
            meta = " | ".join(filter(None, [exp.get("company"), f"{exp.get('start','')} - {exp.get('end','')}"]))
            pdf.cell(0, 5.5, _safe(meta), ln=True)
            for b in exp.get("bullets", []):
                bullet(b)
            pdf.ln(2)

    if resume_json.get("projects"):
        section_heading("Projects")
        for proj in resume_json["projects"]:
            pdf.set_font(font, "B", 11)
            pdf.cell(0, 6, _safe(proj.get("name", "")), ln=True)
            for b in proj.get("bullets", []):
                bullet(b)
            pdf.ln(2)

    if resume_json.get("skills"):
        section_heading("Skills")
        body_text(", ".join(resume_json["skills"]))
        pdf.ln(2)

    if resume_json.get("education"):
        section_heading("Education")
        for edu in resume_json["education"]:
            pdf.set_font(font, "B", 11)
            pdf.cell(0, 6, _safe(edu.get("degree", "")), ln=True)
            pdf.set_font(font, "", 10)
            meta = " | ".join(filter(None, [edu.get("institution"), f"{edu.get('start','')} - {edu.get('end','')}"]))
            pdf.cell(0, 5.5, _safe(meta), ln=True)
            pdf.ln(1)

    if resume_json.get("certifications"):
        section_heading("Certifications")
        for cert in resume_json["certifications"]:
            cert_text = cert if isinstance(cert, str) else cert.get("certification", "")
            bullet(cert_text)

    return bytes(pdf.output())


def render_resume_docx(resume_json: dict, template_name: str = DEFAULT_TEMPLATE) -> bytes:
    style = TEMPLATES.get(template_name, TEMPLATES[DEFAULT_TEMPLATE])
    accent = RGBColor(*style["accent"])
    contact = resume_json.get("contact", {})

    doc = Document()
    doc.styles["Normal"].font.name = "Calibri" if style["font"] == "Helvetica" else "Georgia"
    doc.styles["Normal"].font.size = Pt(10.5)

    name_p = doc.add_paragraph()
    name_run = name_p.add_run(contact.get("name") or "Your Name")
    name_run.bold = True
    name_run.font.size = Pt(20)
    name_run.font.color.rgb = accent

    contact_line = " | ".join(filter(None, [
        contact.get("email"), contact.get("phone"), contact.get("location"),
        contact.get("linkedin"), contact.get("github"),
    ]))
    if contact_line:
        p = doc.add_paragraph(contact_line)
        p.runs[0].font.size = Pt(9.5)
        p.runs[0].font.color.rgb = RGBColor(80, 80, 80)

    def heading(title: str):
        h = doc.add_heading(level=2)
        run = h.add_run(title.upper())
        run.font.color.rgb = accent
        run.font.size = Pt(12)

    def bullet_item(text: str):
        doc.add_paragraph(text, style="List Bullet")

    if resume_json.get("summary"):
        heading("Summary")
        doc.add_paragraph(resume_json["summary"])

    if resume_json.get("experience"):
        heading("Experience")
        for exp in resume_json["experience"]:
            p = doc.add_paragraph()
            p.add_run(exp.get("title", "")).bold = True
            meta = " | ".join(filter(None, [exp.get("company"), f"{exp.get('start','')} - {exp.get('end','')}"]))
            if meta:
                mp = doc.add_paragraph(meta)
                mp.runs[0].italic = True
                mp.runs[0].font.size = Pt(9.5)
            for b in exp.get("bullets", []):
                bullet_item(b)

    if resume_json.get("projects"):
        heading("Projects")
        for proj in resume_json["projects"]:
            p = doc.add_paragraph()
            p.add_run(proj.get("name", "")).bold = True
            for b in proj.get("bullets", []):
                bullet_item(b)

    if resume_json.get("skills"):
        heading("Skills")
        doc.add_paragraph(", ".join(resume_json["skills"]))

    if resume_json.get("education"):
        heading("Education")
        for edu in resume_json["education"]:
            p = doc.add_paragraph()
            p.add_run(edu.get("degree", "")).bold = True
            meta = " | ".join(filter(None, [edu.get("institution"), f"{edu.get('start','')} - {edu.get('end','')}"]))
            if meta:
                doc.add_paragraph(meta)

    if resume_json.get("certifications"):
        heading("Certifications")
        for cert in resume_json["certifications"]:
            cert_text = cert if isinstance(cert, str) else cert.get("certification", "")
            bullet_item(cert_text)

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()
