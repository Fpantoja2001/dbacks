from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime,time


class SessionCreate(BaseModel):
    session_date: date

class SessionResponse(BaseModel):
    id: str
    scout_id: str
    session_date: date
    is_active: bool
    turns: List["TurnResponse"] = []
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

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