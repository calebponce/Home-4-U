from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.database import RoomProject
from app.schemas.schemas import (
    RoomProjectCreate, 
    RoomProjectUpdate, 
    RoomProjectResponse
)
from app.utils.dependencies import get_current_user
from app.models.database import User

router = APIRouter(prefix="/projects", tags=["RoomProjects"])

@router.post("/", response_model=RoomProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project: RoomProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new room project."""
    db_project = RoomProject(
        user_id=current_user.id,
        room_type=project.room_type
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[RoomProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all room projects for the current user."""
    projects = db.query(RoomProject).filter(
        RoomProject.user_id == current_user.id
    ).all()
    return projects

@router.get("/{project_id}", response_model=RoomProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific room project."""
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/{project_id}", response_model=RoomProjectResponse)
def update_project(
    project_id: int,
    project_update: RoomProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a room project."""
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
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
    current_user: User = Depends(get_current_user)
):
    """Delete a room project."""
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    return None

