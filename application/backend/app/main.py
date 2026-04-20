import logging
import os
import time
import traceback
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.database import init_db

logger = logging.getLogger(__name__)


def _parse_cors_origins() -> list[str]:
    """Return explicitly allowed cross-origin callers for direct backend access."""
    configured = os.getenv("HOME4U_CORS_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    if os.getenv("HOME4U_ENV", "development") == "production":
        # Production traffic is expected to arrive through the same-origin nginx /api proxy.
        return []

    return [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ]


def _apply_standard_headers(response, elapsed: float) -> None:
    """Attach diagnostic and baseline security headers to API responses."""
    response.headers["X-Response-Time"] = f"{elapsed:.4f}s"
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    )

# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Home4U API",
    version="0.2.0",
    description="Room renovation recommendation API",
)

# Serve uploaded images
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ---------------------------------------------------------------------------
# Global Error Handler — catches ALL unhandled exceptions
# ---------------------------------------------------------------------------
@app.middleware("http")
async def global_error_handler(request: Request, call_next):
    """Catch any unhandled exception, log it, and return a clean JSON 500."""
    start = time.perf_counter()
    try:
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        _apply_standard_headers(response, elapsed)
        return response
    except Exception as exc:
        elapsed = time.perf_counter() - start
        logger.error(
            "Unhandled %s on %s %s (%.4fs): %s\n%s",
            type(exc).__name__,
            request.method,
            request.url.path,
            elapsed,
            exc,
            traceback.format_exc(),
        )
        response = JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error. Our team has been notified.",
                "type": type(exc).__name__,
            },
        )
        _apply_standard_headers(response, elapsed)
        return response


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (Vite proxy handles /api -> backend routing)
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------
@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    return {"message": "Home4U API is running. Visit /docs for Swagger UI."}
