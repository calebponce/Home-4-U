from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    room_projects = relationship("RoomProject", back_populates="user")

class RoomProject(Base):
    __tablename__ = "room_projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_type = Column(String(100), nullable=False)
    budget = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="room_projects")
    room_tags = relationship("RoomTag", back_populates="room_project")
    resemblance_scores = relationship("ResemblanceScore", back_populates="room_project")
    recommendations = relationship("Recommendation", back_populates="room_project")

class Style(Base):
    __tablename__ = "styles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    
    # Relationships
    style_tags = relationship("StyleTag", back_populates="style")
    product_items = relationship("ProductItem", back_populates="style")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    
    # Relationships
    style_tags = relationship("StyleTag", back_populates="tag")
    room_tags = relationship("RoomTag", back_populates="tag")

class StyleTag(Base):
    __tablename__ = "style_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    style_id = Column(Integer, ForeignKey("styles.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
    weight = Column(Float, default=1.0)  # How important is this tag for this style
    
    # Relationships
    style = relationship("Style", back_populates="style_tags")
    tag = relationship("Tag", back_populates="style_tags")

class RoomTag(Base):
    __tablename__ = "room_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    room_project_id = Column(Integer, ForeignKey("room_projects.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
    is_confirmed = Column(Boolean, default=False)
    
    # Relationships
    room_project = relationship("RoomProject", back_populates="room_tags")
    tag = relationship("Tag", back_populates="room_tags")

class ResemblanceScore(Base):
    __tablename__ = "resemblance_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    room_project_id = Column(Integer, ForeignKey("room_projects.id"), nullable=False)
    style_id = Column(Integer, ForeignKey("styles.id"), nullable=False)
    score_value = Column(Float, nullable=False)  # 0-100 scale
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    room_project = relationship("RoomProject", back_populates="resemblance_scores")
    style = relationship("Style")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    room_project_id = Column(Integer, ForeignKey("room_projects.id"), nullable=False)
    description = Column(Text, nullable=False)
    priority_score = Column(Float, default=0.0)  # Impact-to-cost ratio
    estimated_cost = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    room_project = relationship("RoomProject", back_populates="recommendations")

class ProductItem(Base):
    __tablename__ = "product_items"
    
    id = Column(Integer, primary_key=True, index=True)
    style_id = Column(Integer, ForeignKey("styles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    estimated_cost = Column(Float, nullable=False)
    url = Column(String(500))
    image_url = Column(String(500))
    
    # Relationships
    style = relationship("Style", back_populates="product_items")

