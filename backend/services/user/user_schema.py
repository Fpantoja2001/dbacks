from pydantic import BaseModel, Field, model_validator
from typing import List
from datetime import datetime
from shared import Player

class UserCreate(BaseModel):
    # User Information
    first_name: str
    last_name: str
    email: str
    password: str

class UserResponse(BaseModel):
    # Primary key
    id: str

    # User Information
    first_name: str
    last_name: str
    email: str
    password: str
    token: str | None = None

    # Relationships
    players: List["UserPlayerPreview"] = []

    # Time
    created_at: datetime
    updated_at: datetime

    class Config: 
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str
    token: str

class UserPlayerPreview(BaseModel):
    # Primary Key
    id: str
    # Player Information
    first_name: str
    last_name: str
    position: str
    player_class: str 

    class Config:
        from_attributes = True