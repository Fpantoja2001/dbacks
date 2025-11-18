from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from turn_schema import TurnCreate, TurnResponse, TurnMarkTime, TurnUpdate
from shared.db import get_db
from turn_service import (
    create_turn_service, mark_turn_time_service,
    update_turn_players_service, erase_turn_service, get_turn_service
)

router = APIRouter(tags=["Turns"])

@router.get("/health")
def health_check():
    return {"health": "ok"}

@router.post("/create", response_model=TurnResponse)
def create_turn(turn_data: TurnCreate, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return create_turn_service(turn_data, scout_id, db)

@router.post("/{turn_id}/mark", response_model=TurnResponse)
def mark_turn_time(turn_id: str, mark_data: TurnMarkTime, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return mark_turn_time_service(turn_id, mark_data, scout_id, db)

@router.patch("/{turn_id}/update", response_model=TurnResponse)
def update_turn_players(turn_id: str, update_data: TurnUpdate, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return update_turn_players_service(turn_id, update_data, scout_id, db)

@router.post("/{turn_id}/erase", response_model=TurnResponse)
def erase_turn(turn_id: str, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return erase_turn_service(turn_id, scout_id, db)

@router.get("/{turn_id}", response_model=TurnResponse)
def get_turn(turn_id: str, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return get_turn_service(turn_id, scout_id, db)