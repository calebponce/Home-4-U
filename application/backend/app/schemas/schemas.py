from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# RoomProject Schemas
class RoomProjectCreate(BaseModel):
    room_type: str

class RoomProjectUpdate(BaseModel):
    room_type: Optional[str] = None
    budget: Optional[float] = None

class RoomProjectResponse(BaseModel):
    id: int
    user_id: int
    room_type: str
    budget: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Style Schemas
class StyleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    
    class Config:
        from_attributes = True

class StyleWithTagsResponse(StyleResponse):
    tags: List[dict] = []
    
    class Config:
        from_attributes = True

# Tag Schemas
class TagResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

# StyleTag Schemas
class StyleTagResponse(BaseModel):
    id: int
    style_id: int
    tag_id: int
    weight: float
    
    class Config:
        from_attributes = True

# RoomTag Schemas
class RoomTagCreate(BaseModel):
    tag_id: int
    is_confirmed: bool = False

class RoomTagResponse(BaseModel):
    id: int
    room_project_id: int
    tag_id: int
    is_confirmed: bool
    
    class Config:
        from_attributes = True

# ResemblanceScore Schemas
class ScoreResponse(BaseModel):
    id: int
    room_project_id: int
    style_id: int
    score_value: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScoreCalculationRequest(BaseModel):
    room_project_id: int
    style_ids: List[int]

# Recommendation Schemas
class RecommendationCreate(BaseModel):
    description: str
    priority_score: float
    estimated_cost: float

class RecommendationResponse(BaseModel):
    id: int
    room_project_id: int
    description: str
    priority_score: float
    estimated_cost: float
    is_completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ProductItem Schemas
class ProductItemResponse(BaseModel):
    id: int
    style_id: int
    name: str
    estimated_cost: float
    url: Optional[str]
    image_url: Optional[str]
    
    class Config:
        from_attributes = True

# AI Tag Suggestion Schema
class AISuggestTagsRequest(BaseModel):
    room_project_id: int

class AISuggestTagsResponse(BaseModel):
    suggested_tags: List[dict]  # [{"tag_id": 1, "tag_name": "modern", "confidence": 0.95}]

