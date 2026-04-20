from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.database import RoomProject, User
from app.schemas.schemas import (
    ProjectAnalysisRequest,
    ProjectAnalysisResponse,
    RoomProjectCreate,
    RoomProjectUpdate,
    RoomProjectResponse,
)
from app.services.project_analysis import analyze_project_design, resolve_style_for_analysis
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["RoomProjects"])

# Upload config
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5MB


@router.post("/", response_model=RoomProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project: RoomProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new room project."""
    db_project = RoomProject(
        user_id=current_user.id,
        room_type=project.room_type,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/", response_model=List[RoomProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all room projects for the current user."""
    return db.query(RoomProject).filter(RoomProject.user_id == current_user.id).all()


@router.get("/{project_id}", response_model=RoomProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific room project."""
    project = (
        db.query(RoomProject)
        .filter(RoomProject.id == project_id, RoomProject.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return project


@router.put("/{project_id}", response_model=RoomProjectResponse)
def update_project(
    project_id: int,
    project_update: RoomProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a room project."""
    project = (
        db.query(RoomProject)
        .filter(RoomProject.id == project_id, RoomProject.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project_update.room_type is not None:
        project.room_type = project_update.room_type
    if project_update.budget is not None:
        project.budget = project_update.budget

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a room project."""
    project = (
        db.query(RoomProject)
        .filter(RoomProject.id == project_id, RoomProject.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/photo", response_model=RoomProjectResponse)
async def upload_project_photo(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a photo for a project.
    Saves the file to ./uploads and stores the URL in project.photo_url.
    """
    project = (
        db.query(RoomProject)
        .filter(RoomProject.id == project_id, RoomProject.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WebP images are allowed",
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large (max 5MB)",
        )

    ext = (
        ".jpg"
        if file.content_type == "image/jpeg"
        else ".png"
        if file.content_type == "image/png"
        else ".webp"
    )
    filename = f"project_{project_id}_{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(data)

    project.photo_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/analysis", response_model=ProjectAnalysisResponse)
def analyze_project(
    project_id: int,
    analysis_request: ProjectAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze a project against a selected style and persist scores/recommendations."""
    project = (
        db.query(RoomProject)
        .filter(RoomProject.id == project_id, RoomProject.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    selected_style = resolve_style_for_analysis(
        db,
        style_id=analysis_request.style_id,
        style_slug=analysis_request.style_slug,
        style_name=analysis_request.style_name,
    )
    if selected_style is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected style not found")

    if analysis_request.room_type and analysis_request.room_type != project.room_type:
        project.room_type = analysis_request.room_type

    payload = analyze_project_design(
        db,
        project=project,
        selected_style=selected_style,
        room_type=analysis_request.room_type or project.room_type,
        intensity=analysis_request.intensity,
        lighting=analysis_request.lighting,
        budget_tier=analysis_request.budget_tier,
        image_profile=analysis_request.image_profile.model_dump() if analysis_request.image_profile else None,
        detected_tags=analysis_request.detected_tags,
    )

    db.commit()
    db.refresh(project)
    for recommendation in payload["recommendations"]:
        db.refresh(recommendation)

    return payload
