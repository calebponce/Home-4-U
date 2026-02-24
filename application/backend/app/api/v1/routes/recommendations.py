from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.database import Recommendation, RoomProject, ResemblanceScore
from app.schemas.schemas import (
    RecommendationCreate, 
    RecommendationResponse
)
from app.utils.dependencies import get_current_user
from app.models.database import User

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    recommendation: RecommendationCreate,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new recommendation for a room project."""
    # Verify project belongs to user
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db_recommendation = Recommendation(
        room_project_id=project_id,
        description=recommendation.description,
        priority_score=recommendation.priority_score,
        estimated_cost=recommendation.estimated_cost
    )
    
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return db_recommendation

@router.get("/project/{project_id}", response_model=List[RecommendationResponse])
def get_project_recommendations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all recommendations for a room project."""
    # Verify project belongs to user
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    recommendations = db.query(Recommendation).filter(
        Recommendation.room_project_id == project_id
    ).order_by(Recommendation.priority_score.desc()).all()
    
    return recommendations

@router.put("/{recommendation_id}/complete", response_model=RecommendationResponse)
def mark_recommendation_complete(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a recommendation as completed."""
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    # Verify project belongs to user
    project = db.query(RoomProject).filter(
        RoomProject.id == recommendation.room_project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    recommendation.is_completed = True
    db.commit()
    db.refresh(recommendation)
    return recommendation


# AI-powered recommendation generation (simplified)
@router.post("/generate/{project_id}", response_model=List[RecommendationResponse])
def generate_recommendations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered recommendations based on project data."""
    # Verify project belongs to user
    project = db.query(RoomProject).filter(
        RoomProject.id == project_id,
        RoomProject.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get resemblance scores for this project
    scores = db.query(ResemblanceScore).filter(
        ResemblanceScore.room_project_id == project_id
    ).all()
    
    if not scores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please calculate style scores first"
        )
    
    # Generate recommendations based on top styles and budget
    # This is a simplified version - in production, use OpenAI API
    top_styles = sorted(scores, key=lambda x: x.score_value, reverse=True)[:3]
    
    recommendations = []
    for style_score in top_styles:
        if style_score.score_value > 70:
            rec = Recommendation(
                room_project_id=project_id,
                description=f"Consider adding {style_score.style.name} elements to enhance your room's style match.",
                priority_score=style_score.score_value / 100 * 10,
                estimated_cost=project.budget * 0.2 if project.budget > 0 else 200
            )
            db.add(rec)
            recommendations.append(rec)
    
    db.commit()
    for rec in recommendations:
        db.refresh(rec)
    
    return recommendations

