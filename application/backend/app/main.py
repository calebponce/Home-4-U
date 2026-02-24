from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.database import init_db

app = FastAPI(
    title="Home4U API", 
    version="0.1.0",
    description="Room renovation recommendation API"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()

@app.get("/")
def root():
    return {"message": "Home4U API is running. Visit /docs for Swagger UI."}

