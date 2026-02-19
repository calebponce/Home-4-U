from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="Home4U API", version="0.1.0")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Home4U API is running. Visit /docs for Swagger UI."}
