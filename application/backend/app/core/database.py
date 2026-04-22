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
        room_project_columns = _existing_columns(conn, "room_projects")
        if "photo_url" not in room_project_columns:
            conn.execute(text("ALTER TABLE room_projects ADD COLUMN photo_url VARCHAR(500)"))

        # Keep the existing dev DB forward-compatible with newer product metadata.
        product_item_columns = _existing_columns(conn, "product_items")
        if "vendor_id" not in product_item_columns:
            conn.execute(text("ALTER TABLE product_items ADD COLUMN vendor_id INTEGER"))
        if "category" not in product_item_columns:
            conn.execute(text("ALTER TABLE product_items ADD COLUMN category VARCHAR(100)"))

        # Seeding and tag matching depend on these join tables existing.
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
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS room_dimensions (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  room_project_id INTEGER NOT NULL,\n"
            "  width FLOAT,\n"
            "  length FLOAT,\n"
            "  height FLOAT,\n"
            "  unit VARCHAR(20) DEFAULT 'ft',\n"
            "  created_at DATETIME,\n"
            "  FOREIGN KEY(room_project_id) REFERENCES room_projects(id)\n"
            ")"
        ))
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS room_furniture (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  room_project_id INTEGER NOT NULL,\n"
            "  name VARCHAR(255) NOT NULL,\n"
            "  category VARCHAR(100),\n"
            "  quantity INTEGER DEFAULT 1,\n"
            "  created_at DATETIME,\n"
            "  FOREIGN KEY(room_project_id) REFERENCES room_projects(id)\n"
            ")"
        ))
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS room_objects (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  room_project_id INTEGER NOT NULL,\n"
            "  name VARCHAR(255) NOT NULL,\n"
            "  category VARCHAR(100),\n"
            "  quantity INTEGER DEFAULT 1,\n"
            "  created_at DATETIME,\n"
            "  FOREIGN KEY(room_project_id) REFERENCES room_projects(id)\n"
            ")"
        ))
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS vendors (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  name VARCHAR(255) NOT NULL UNIQUE,\n"
            "  website_url VARCHAR(500),\n"
            "  created_at DATETIME\n"
            ")"
        ))
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS budget_plans (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  project_id INTEGER NOT NULL,\n"
            "  total_budget FLOAT NOT NULL DEFAULT 0.0,\n"
            "  currency VARCHAR(10) NOT NULL DEFAULT 'USD',\n"
            "  plan_name VARCHAR(255),\n"
            "  created_at DATETIME,\n"
            "  FOREIGN KEY(project_id) REFERENCES room_projects(id)\n"
            ")"
        ))
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS budget_allocations (\n"
            "  id INTEGER PRIMARY KEY,\n"
            "  budget_id INTEGER NOT NULL,\n"
            "  product_id INTEGER,\n"
            "  category VARCHAR(100) NOT NULL,\n"
            "  allocated_amount FLOAT NOT NULL DEFAULT 0.0,\n"
            "  quantity INTEGER NOT NULL DEFAULT 1,\n"
            "  priority_rank INTEGER,\n"
            "  created_at DATETIME,\n"
            "  FOREIGN KEY(budget_id) REFERENCES budget_plans(id),\n"
            "  FOREIGN KEY(product_id) REFERENCES product_items(id)\n"
            ")"
        ))

        # SQLite can add uniqueness safely with indexes, which is good enough for dev.
        conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_style_tags_style_tag "
            "ON style_tags (style_id, tag_id)"
        ))
        conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_room_tags_project_tag "
            "ON room_tags (room_project_id, tag_id)"
        ))
        conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_resemblance_project_style "
            "ON resemblance_scores (room_project_id, style_id)"
        ))


def _existing_columns(conn, table_name: str) -> set[str]:
    rows = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    return {row[1] for row in rows}
