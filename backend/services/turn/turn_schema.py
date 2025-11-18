from pydantic import BaseModel
from typing import Optional, List
from datetime import time, datetime

class TurnCreate(BaseModel):
    session_id: str
    batter_id: str
    pitcher_id: str
    start_time: Optional[time] = None

class TurnMarkTime(BaseModel):
    mark_time: time

class TurnUpdate(BaseModel):
    batter_id: Optional[str] = None
    pitcher_id: Optional[str] = None

class TurnResponse(BaseModel):
    id: str
    session_id: str
    batter_id: str
    pitcher_id: str
    start_time: Optional[time]
    end_time: Optional[time]
    balls: int
    strikes: int
    outs: int
    runs: int
    is_complete: bool
    outcome: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True