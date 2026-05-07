import os
from pathlib import Path

APP_VERSION = "0.2.0"
APP_ENV = os.getenv("HOME4U_ENV", "development").strip().lower() or "development"
POSTGRESQL_URL_EXAMPLE = "postgresql+psycopg://home4u:password@localhost:5432/home4u"

UPLOAD_URL_PREFIX = "/uploads"
ALLOWED_UPLOAD_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})


def _read_int_env(name: str, default: int, minimum: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default

    try:
        return max(minimum, int(raw))
    except ValueError:
        return default


def _resolve_upload_dir() -> Path:
    override = os.getenv("HOME4U_UPLOAD_DIR", "").strip()
    if override:
        return Path(override).expanduser()

    if APP_ENV == "production":
        data_dir = Path(os.getenv("HOME4U_DATA_DIR", "/home/ec2-user/data")).expanduser()
        return data_dir / "uploads"

    return Path(__file__).resolve().parents[2] / "uploads"


def _resolve_default_db_path() -> Path:
    if APP_ENV == "production":
        data_dir = Path(os.getenv("HOME4U_DATA_DIR", "/home/ec2-user/data")).expanduser()
        return data_dir / "home4u.db"

    return Path(__file__).resolve().parents[2] / "home4u.db"


def _normalize_public_asset_base() -> str:
    raw = os.getenv("HOME4U_PUBLIC_ASSET_BASE_URL", "").strip()
    return raw.rstrip("/") if raw else ""


def _format_upload_limit(max_bytes: int) -> str:
    megabytes = max_bytes / (1024 * 1024)
    if megabytes.is_integer():
        return f"{int(megabytes)}MB"
    return f"{megabytes:.1f}MB"


UPLOAD_DIR = _resolve_upload_dir()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

PUBLIC_ASSET_BASE_URL = _normalize_public_asset_base()
MAX_UPLOAD_BYTES = _read_int_env("HOME4U_MAX_UPLOAD_BYTES", 10 * 1024 * 1024, 1024)
MAX_UPLOAD_BYTES_LABEL = _format_upload_limit(MAX_UPLOAD_BYTES)
DEFAULT_DB_PATH = _resolve_default_db_path()
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
DATABASE_BACKEND = DATABASE_URL.split(":", 1)[0].lower()
IS_SQLITE = DATABASE_BACKEND == "sqlite"


def build_public_asset_url(path: str) -> str:
    normalized = path if path.startswith("/") else f"/{path}"
    if PUBLIC_ASSET_BASE_URL:
        return f"{PUBLIC_ASSET_BASE_URL}{normalized}"
    return normalized
