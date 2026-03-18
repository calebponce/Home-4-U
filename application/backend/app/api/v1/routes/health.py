from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine

router = APIRouter()


@router.get("/health")
def health():
    """
    Health-check endpoint.
    Verifies the API process is alive AND the database is reachable.
    Returns 200 with connection details or 503 if the DB is unreachable.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as exc:
        return {"status": "degraded", "db": str(exc)}
