import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


def _is_pg_reachable(url: str) -> bool:
    try:
        # Check socket connectivity to localhost:5432
        sock = socket.create_connection(("127.0.0.1", 5432), timeout=1.0)
        sock.close()
        return True
    except Exception:
        return False


def _create_engine_with_fallback():
    db_url = getattr(settings, "DATABASE_URL", None)
    if db_url and not db_url.startswith("sqlite"):
        if _is_pg_reachable(db_url):
            try:
                pg_engine = create_engine(
                    db_url,
                    pool_pre_ping=True,
                    pool_size=10,
                    max_overflow=20,
                    connect_args={"connect_timeout": 2},
                )
                with pg_engine.connect() as conn:
                    pass
                print("[DB] Connected successfully to PostgreSQL database.")
                return pg_engine
            except Exception as e:
                print(f"[DB Warning] PostgreSQL connection error ({e}). Falling back to local SQLite.")

    sqlite_path = os.path.abspath("resumeai.db")
    sqlite_url = f"sqlite:///{sqlite_path}"
    print(f"[DB] Using local SQLite database at {sqlite_url}")
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
    )


engine = _create_engine_with_fallback()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db():
    from app.db import models  # noqa
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency — yields a DB session and closes it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

