from pydantic import BaseModel, Field, model_validator
from typing import Literal, Optional, Dict
from datetime import datetime

class PlayerCreate(BaseModel):
    # Player Information
    first_name: str
    last_name: str
    position: str
    date_of_birth: str
    height: str
    weight: str
    throw: Literal["left", "right", "switch"]
    bat: Literal["left", "right", "switch"]
    birth_city: str

    # Miscellaneous
    agent: Optional[str]
    related_ids: Optional[Dict[str,str]]
    notes: Optional[str]

class PlayerFastCreate(BaseModel):
    first_name: str
    last_name: str
    position: str
    date_of_birth: str

class PlayerResponse(BaseModel):
    # Primary Key
    id: str

    # Player Information
    first_name: str
    last_name: str
    position: str
    date_of_birth: str
    player_class: str 
    height: str
    weight: str
    throw: Literal["left", "right", "switch"]
    bat: Literal["left", "right", "switch"]
    birth_city: str

    # Miscellaneous
    agent: Optional[str]
    related_ids: Optional[Dict[str,str]]
    notes: Optional[str]

    # Relationship
    scout: str
    scout_id: str

    # Time
    created_at: datetime
    updated_at: datetime

    class Config: 
        from_attributes = True