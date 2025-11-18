from shared.orm_models import Session as SessionModel, Turn, Pitch
from sqlalchemy.orm import Session
from turn_schema import TurnCreate, TurnMarkTime, TurnUpdate, TurnResponse
from fastapi import HTTPException
from datetime import datetime

def create_turn_service(turn_data: TurnCreate, scout_id: str, db: Session):
    session = db.query(SessionModel).filter(
        SessionModel.id == turn_data.session_id,
        SessionModel.scout_id == scout_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_turn = Turn(
        session_id=turn_data.session_id,
        batter_id=turn_data.batter_id,
        pitcher_id=turn_data.pitcher_id,
        start_time=turn_data.start_time or datetime.now().time()
    )
    db.add(new_turn)
    db.commit()
    db.refresh(new_turn)
    return new_turn

def mark_turn_time_service(turn_id: str, mark_data: TurnMarkTime, scout_id: str, db: Session):
    turn = _get_turn_with_auth(turn_id, scout_id, db)
    
    if not turn.start_time:
        turn.start_time = mark_data.mark_time
    else:
        turn.end_time = mark_data.mark_time
    
    db.commit()
    db.refresh(turn)
    return turn

def update_turn_players_service(turn_id: str, update_data: TurnUpdate, scout_id: str, db: Session):
    turn = _get_turn_with_auth(turn_id, scout_id, db)
    
    if update_data.batter_id:
        turn.batter_id = update_data.batter_id
    if update_data.pitcher_id:
        turn.pitcher_id = update_data.pitcher_id
    
    db.commit()
    db.refresh(turn)
    return turn

def erase_turn_service(turn_id: str, scout_id: str, db: Session):
    turn = _get_turn_with_auth(turn_id, scout_id, db)
    
    db.query(Pitch).filter(Pitch.turn_id == turn_id).delete()
    
    turn.balls = 0
    turn.strikes = 0
    turn.is_complete = False
    turn.outcome = None
    
    db.commit()
    db.refresh(turn)
    return turn

def get_turn_service(turn_id: str, scout_id: str, db: Session):
    return _get_turn_with_auth(turn_id, scout_id, db)

def _get_turn_with_auth(turn_id: str, scout_id: str, db: Session):
    turn = db.query(Turn).join(SessionModel).filter(
        Turn.id == turn_id,
        SessionModel.scout_id == scout_id
    ).first()
    if not turn:
        raise HTTPException(status_code=404, detail="Turn not found")
    return turn