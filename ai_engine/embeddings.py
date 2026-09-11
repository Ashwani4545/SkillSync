"""
embeddings.py
Turns resume text into a vector for similarity comparison — the real data
layer behind ai_engine/comparators/benchmark_engine.py.

Uses sentence-transformers (all-MiniLM-L6-v2: 384-dim, ~90MB, CPU-friendly,
no API key) rather than a paid embeddings API — it's already a pinned but
previously-unused dependency in backend/requirements.txt, and running
locally means benchmark ingestion has no per-resume API cost even for a
large dataset.

Mirrors the USE_MOCK_LLM pattern from llm_client.py: set USE_MOCK_EMBEDDINGS=true
to skip loading the real model (deterministic hash-based pseudo-embeddings
instead) — used in tests/CI so they don't need to download a 90MB model or
wait on CPU inference.
"""
import hashlib
import os
import re

EMBEDDING_DIM = 384  # matches all-MiniLM-L6-v2's output dimension

_model = None  # lazy-loaded singleton — only imported/downloaded if actually used


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _mock_embedding(text: str) -> list[float]:
    """
    Deterministic pseudo-embedding for tests: same input always produces the
    same output, and different inputs produce different (if not semantically
    meaningful) vectors — enough to test ranking/storage logic without
    downloading a real model.
    """
    words = re.findall(r"\w+", text.lower())
    vector = [0.0] * EMBEDDING_DIM
    for word in words:
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        vector[h % EMBEDDING_DIM] += 1.0
    norm = sum(v * v for v in vector) ** 0.5
    return [v / norm for v in vector] if norm > 0 else vector


def embed_resume_text(text: str) -> list[float]:
    """
    Returns a normalized embedding vector for `text`. `text` should be a
    resume's meaningful content (summary + bullets + skills) — NOT contact
    info; callers are responsible for stripping PII before calling this
    (see backend/scripts/ingest_benchmark_resumes.py, which is the only
    place raw resume text should ever reach this function from disk).
    """
    if os.environ.get("USE_MOCK_EMBEDDINGS", "").lower() == "true":
        return _mock_embedding(text)

    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Both inputs are expected pre-normalized (embed_resume_text already
    normalizes), so this reduces to a dot product — but computed properly
    here in case a caller passes in an un-normalized vector."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def resume_json_to_embeddable_text(resume_json: dict) -> str:
    """
    Builds the text that actually gets embedded — content only, no PII.
    Deliberately excludes `contact` (name/email/phone/links) entirely.
    """
    parts = [resume_json.get("summary", "")]

    for exp in resume_json.get("experience", []):
        parts.append(exp.get("title", ""))
        parts.extend(exp.get("bullets", []))

    for proj in resume_json.get("projects", []):
        parts.append(proj.get("name", ""))
        parts.extend(proj.get("bullets", []))

    parts.append(", ".join(resume_json.get("skills", [])))

    return "\n".join(p for p in parts if p)
