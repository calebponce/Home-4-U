import os
import logging
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database path resolution
# ---------------------------------------------------------------------------
# In PRODUCTION the DB lives *outside* the git repo so `git pull` can never
# delete it.  Set HOME4U_ENV=production in the systemd unit (or export it)
# to activate this behaviour.
#
# In DEVELOPMENT the DB stays inside the repo for convenience.
# ---------------------------------------------------------------------------
_ENV = os.getenv("HOME4U_ENV", "development")

if _ENV == "production":
    _PROD_DATA_DIR = Path(os.getenv("HOME4U_DATA_DIR", "/home/ec2-user/data"))
    _PROD_DATA_DIR.mkdir(parents=True, exist_ok=True)
    _DEFAULT_DB_PATH = _PROD_DATA_DIR / "home4u.db"
else:
    # Keep the dev default inside the repo (application/backend/home4u.db)
    _DEFAULT_DB_PATH = Path(__file__).resolve().parents[2] / "home4u.db"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{_DEFAULT_DB_PATH}",
)

logger.info("Database path: %s (env=%s)", _DEFAULT_DB_PATH, _ENV)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
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
    """Initialize database tables (creates them if they don't exist)."""
    from app.models.database import Base

    logger.info("Running init_db — ensuring all tables exist …")
    Base.metadata.create_all(bind=engine)
    _run_sqlite_compat_migrations()
    logger.info("init_db complete.")


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
