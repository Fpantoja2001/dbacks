from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class PitchTypeEnum(str, Enum):
    FB = "FB" # Fast Ball
    CB = "CB" # Curve Ball
    CH = "CH" # Change Up
    SL = "SL" # Slider

class PitchResultEnum(str, Enum):
    BALL = "ball"
    STRIKE_CALL = "strike_call"
    SWING_MISS = "swing_miss"
    FOUL = "foul"
    HIT = "hit"
    OUT = "out"
    WALK = "walk"
    HBP = "hbp"

class PitchCreate(BaseModel):
    turn_id: str
    pitch_type: Optional[PitchTypeEnum] = None
    pitch_result: PitchResultEnum
    release_speed: Optional[float] = Field(None, ge=0, le=120)

class PitchResponse(BaseModel):
    id: str
    turn_id: str
    pitch_number: int
    pitch_type: Optional[str]
    pitch_result: str
    release_speed: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PitchCountResponse(BaseModel):
    pitcher_id: str
    total_pitches: int