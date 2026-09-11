#!/usr/bin/env python3
"""
ingest_benchmark_resumes.py

Populates the `benchmark_resumes` table from a local folder of resume files
(PDF/DOCX) — this is what turns the benchmark engine from LLM simulation
into real vector-similarity comparison.

Usage:
    cd backend
    python scripts/ingest_benchmark_resumes.py \
        --folder /path/to/data/software-engineer-resumes \
        --target-role "Software Engineer" \
        --industry technology

Privacy: this script deliberately extracts ONLY structural statistics and
an embedding vector from each resume. Raw text, name, email, and phone
number are read into memory to compute those numbers and are then
discarded — never written to the database or logged. `--source-label`
lets you tag entries with a batch identifier (e.g. "batch1/042") for your
own bookkeeping; never pass a real name here.

Run with USE_MOCK_EMBEDDINGS=true set in your environment to smoke-test
the script against a few files without downloading the real embedding
model (same pattern as USE_MOCK_LLM for the analysis pipeline).
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))  # repo root

from app.db.session import SessionLocal, Base, engine
from app.db.models import BenchmarkResume
from app.services.parser_service import parse_pdf, parse_docx
from ai_engine.embeddings import embed_resume_text, resume_json_to_embeddable_text

SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


def compute_structural_stats(resume_json: dict) -> dict:
    bullets = [b for e in resume_json.get("experience", []) for b in e.get("bullets", [])]
    quantified = sum(1 for b in bullets if any(c.isdigit() for c in b))
    quantification_rate = int(100 * quantified / max(len(bullets), 1)) if bullets else 0

    return {
        "quantification_rate": quantification_rate,
        "bullet_count": len(bullets),
        "skills_count": len(resume_json.get("skills", [])),
        "experience_entries": len(resume_json.get("experience", [])),
    }


def parse_resume_file(path: Path) -> dict | None:
    try:
        with open(path, "rb") as f:
            if path.suffix.lower() == ".pdf":
                return parse_pdf(f)
            elif path.suffix.lower() == ".docx":
                return parse_docx(f)
    except Exception as e:
        print(f"  [skip] {path.name}: failed to parse ({e})")
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--folder", required=True, help="Local folder containing resume files (PDF/DOCX)")
    parser.add_argument("--target-role", required=True, help='e.g. "Software Engineer"')
    parser.add_argument("--industry", default="technology")
    parser.add_argument("--source-label-prefix", default=None,
                         help='Batch tag for your own bookkeeping, e.g. "batch1" — NEVER a real name.')
    parser.add_argument("--dry-run", action="store_true", help="Parse and embed but don't write to the DB")
    args = parser.parse_args()

    folder = Path(args.folder)
    if not folder.is_dir():
        print(f"Not a folder: {folder}")
        sys.exit(1)

    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in SUPPORTED_EXTENSIONS)
    if not files:
        print(f"No .pdf/.docx files found in {folder}")
        sys.exit(1)

    print(f"Found {len(files)} resume files. Target role: '{args.target_role}' / industry: '{args.industry}'")
    if os.environ.get("USE_MOCK_EMBEDDINGS", "").lower() == "true":
        print("USE_MOCK_EMBEDDINGS=true — using deterministic pseudo-embeddings, not the real model.")

    Base.metadata.create_all(bind=engine)  # no-op if the table already exists (e.g. via alembic)
    db = SessionLocal()

    ingested, skipped = 0, 0
    try:
        for i, path in enumerate(files, 1):
            print(f"[{i}/{len(files)}] {path.name}")
            resume_json = parse_resume_file(path)
            if not resume_json:
                skipped += 1
                continue

            stats = compute_structural_stats(resume_json)
            embeddable_text = resume_json_to_embeddable_text(resume_json)  # contact info excluded by design
            if not embeddable_text.strip():
                print(f"  [skip] {path.name}: nothing to embed after parsing")
                skipped += 1
                continue

            embedding = embed_resume_text(embeddable_text)

            label = f"{args.source_label_prefix}/{i:04d}" if args.source_label_prefix else f"resume_{i:04d}"

            if not args.dry_run:
                db.add(BenchmarkResume(
                    target_role=args.target_role,
                    industry=args.industry,
                    embedding_json=embedding,
                    source_label=label,
                    **stats,
                ))
            ingested += 1

        if not args.dry_run:
            db.commit()
    finally:
        db.close()

    print(f"\nDone. Ingested: {ingested}  Skipped: {skipped}"
          + ("  (dry run — nothing written)" if args.dry_run else ""))


if __name__ == "__main__":
    main()
