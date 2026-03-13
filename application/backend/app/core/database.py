import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database configuration.
# SQLite defaults to an absolute file path so systemd/uvicorn working-directory
# changes do not create a second database in an unexpected location.
BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BASE_DIR / "home4u.db"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DEFAULT_DB_PATH}"
)

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    from app.models.database import Base
    Base.metadata.create_all(bind=engine)
    _run_sqlite_compat_migrations()


def _run_sqlite_compat_migrations():
    """
    Lightweight compatibility migrations for local SQLite.
    Keeps older dev DB files usable when model columns are added.
    """
    if "sqlite" not in DATABASE_URL:
        return

    with engine.begin() as conn:
        cols = conn.execute(text("PRAGMA table_info(room_projects)")).fetchall()
        existing = {row[1] for row in cols}
        if "photo_url" not in existing:
            conn.execute(text("ALTER TABLE room_projects ADD COLUMN photo_url VARCHAR(500)"))

        # ensure style_tags table exists (seed expects it)
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS style_tags (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  style_id INTEGER NOT NULL,\n"
            "  tag_id INTEGER NOT NULL,\n"
            "  weight FLOAT DEFAULT 1.0,\n"
            "  FOREIGN KEY(style_id) REFERENCES styles(id),\n"
            "  FOREIGN KEY(tag_id) REFERENCES tags(id)\n"
            ")"
        ))
