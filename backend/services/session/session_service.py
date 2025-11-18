from shared.orm_models import Session as SessionModel
from sqlalchemy.orm import Session
from session_schema import (
    SessionCreate, SessionResponse,
)
from fastapi import HTTPException
from datetime import date
from typing import Optional

def create_session_service(session_data: SessionCreate, scout_id: str, db: Session):
    existing = db.query(SessionModel).filter(
        SessionModel.scout_id == scout_id,
        SessionModel.session_date == session_data.session_date,
        SessionModel.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Active session already exists for this date")
    
    new_session = SessionModel(
        scout_id=scout_id,
        session_date=session_data.session_date,
        is_active=True
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

def get_active_session_service(scout_id: str, db: Session) -> Optional[SessionResponse]:
    session = db.query(SessionModel).filter(
        SessionModel.scout_id == scout_id,
        SessionModel.is_active == True
    ).first()
    return session

def get_session_by_date_service(session_date: date, scout_id: str, db: Session):
    session = db.query(SessionModel).filter(
        SessionModel.scout_id == scout_id,
        SessionModel.session_date == session_date
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

def end_session_service(session_id: str, scout_id: str, db: Session):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.scout_id == scout_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.is_active = False
    db.commit()
    return session
