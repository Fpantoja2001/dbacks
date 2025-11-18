from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pitch_schema import PitchCreate, PitchResponse, PitchCountResponse
from shared.db import get_db
from pitch_service import add_pitch_service, get_pitcher_pitch_count_service

router = APIRouter(tags=["Pitches"])

@router.get("/health")
def health_check():
    return {"health": "ok"}

@router.post("/add", response_model=PitchResponse)
def add_pitch(pitch_data: PitchCreate, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return add_pitch_service(pitch_data, scout_id, db)

@router.get("/session/{session_id}/pitcher/{pitcher_id}/count", response_model=PitchCountResponse)
def get_pitcher_count(session_id: str, pitcher_id: str, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return get_pitcher_pitch_count_service(session_id, pitcher_id, scout_id, db)