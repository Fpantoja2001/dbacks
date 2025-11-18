from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from session_schema import (
    SessionCreate, SessionResponse
)
from shared.db import get_db
from session_service import (
    create_session_service, get_active_session_service, get_session_by_date_service, end_session_service
)
from datetime import date
from typing import Optional

router = APIRouter(tags=["Sessions"])

@router.get("/health")
def health_check():
    return {"health": "ok"}

@router.post("/create", response_model=SessionResponse)
def create_session(session_data: SessionCreate, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return create_session_service(session_data, scout_id, db)

@router.get("/active", response_model=Optional[SessionResponse])
def get_active_session(request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return get_active_session_service(scout_id, db)

@router.get("/date/{session_date}", response_model=SessionResponse)
def get_session_by_date(session_date: date, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return get_session_by_date_service(session_date, scout_id, db)

@router.post("/{session_id}/end", response_model=SessionResponse)
def end_session(session_id: str, request: Request, db: Session = Depends(get_db)):
    scout_id = getattr(request.state, "scout_id", None)
    return end_session_service(session_id, scout_id, db)