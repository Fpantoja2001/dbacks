from fastapi import APIRouter, Depends, Cookie, Request
from sqlalchemy.orm import Session
from player_schema import PlayerCreate, PlayerFastCreate, PlayerResponse, PlayerUpdate
from shared.db import get_db
from player_service import create_player_service, fast_create_player_service, update_player_service

router = APIRouter(tags=["Players"])

# Health endpoint
@router.get("/health")
def health_check():
    return {"health" : "ok"}

# Create Player
@router.post("/create", response_model=PlayerResponse)
def create_player_controller(player_data: PlayerCreate, request: Request, db: Session = Depends(get_db)):
    # Get User Scout ID
    scout_id = getattr(request.state, "scout_id", None)
    return create_player_service(player_data, scout_id, db)

# Create Player
@router.post("/fast-create", response_model=PlayerResponse)
def create_player_controller(player_data: PlayerFastCreate, request: Request, db: Session = Depends(get_db)):
    # Get User Scout ID
    scout_id = getattr(request.state, "scout", None)["id"]
    return fast_create_player_service(player_data, scout_id, db)

# Update Player
@router.patch("/update/{player_id}", response_model=PlayerResponse)
def update_player_controller(player_update_data: PlayerUpdate, player_id: str, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return update_player_service(player_update_data, player_id, scout_id, db)