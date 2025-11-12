from pydantic import BaseModel, Field, model_validator
from typing import List
from datetime import datetime

class UserCreate(BaseModel):
    # User Information
    first_name: str
    last_name: str
    email: str
    password: str
    token: str

class UserResponse(BaseModel):
    # Primary key
    id: str

    # User Information
    first_name: str
    last_name: str
    email: str
    password: str
    token: str

    # Relationships
    players: List[dict]

    # Time
    created_at: datetime
    updated_at: datetime

    class Config: 
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str
    token: str