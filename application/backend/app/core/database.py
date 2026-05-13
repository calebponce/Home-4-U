import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.settings import APP_ENV, DATABASE_URL, DEFAULT_DB_PATH, IS_SQLITE

logger = logging.getLogger(__name__)
if IS_SQLITE:
    DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

logger.info(
    "Database backend configured as %s (env=%s, sqlite_path=%s)",
    DATABASE_URL.split(":", 1)[0],
    APP_ENV,
    DEFAULT_DB_PATH if IS_SQLITE else "n/a",
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
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
    if not IS_SQLITE:
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

        analysis_run_columns = _existing_columns(conn, "project_analysis_runs")
        if "image_width" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_width INTEGER"))
        if "image_height" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_height INTEGER"))
        if "image_aspect_ratio" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_aspect_ratio FLOAT"))
        if "image_average_brightness" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_average_brightness FLOAT"))
        if "image_average_saturation" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_average_saturation FLOAT"))
        if "image_warmth_bias" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_warmth_bias FLOAT"))
        if "image_dominant_hex" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN image_dominant_hex VARCHAR(32)"))
        if "detected_tags_json" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN detected_tags_json TEXT"))
        if "scan_confidence_score" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN scan_confidence_score FLOAT"))
        if "scan_confidence_label" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN scan_confidence_label VARCHAR(20)"))
        if "scan_signal_count" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN scan_signal_count INTEGER"))
        if "scan_warnings_json" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN scan_warnings_json TEXT"))
        if "room_state_json" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN room_state_json TEXT"))
        if "analysis_duration_ms" not in analysis_run_columns:
            conn.execute(text("ALTER TABLE project_analysis_runs ADD COLUMN analysis_duration_ms INTEGER"))

        recommendation_columns = _existing_columns(conn, "recommendations")
        if "confidence_score" not in recommendation_columns:
            conn.execute(text("ALTER TABLE recommendations ADD COLUMN confidence_score FLOAT"))
        if "reason_summary" not in recommendation_columns:
            conn.execute(text("ALTER TABLE recommendations ADD COLUMN reason_summary TEXT"))

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
