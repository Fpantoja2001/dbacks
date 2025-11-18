from shared.orm_models import Session as SessionModel, Turn, Pitch, PitchResult, PitchType
from sqlalchemy.orm import Session
from pitch_schema import PitchCreate, PitchResponse, PitchCountResponse
from fastapi import HTTPException

def add_pitch_service(pitch_data: PitchCreate, scout_id: str, db: Session):
    turn = _get_turn_with_auth(pitch_data.turn_id, scout_id, db)
    
    if turn.is_complete:
        raise HTTPException(status_code=400, detail="Turn is already complete")
    
    existing_pitches = db.query(Pitch).filter(Pitch.turn_id == pitch_data.turn_id).count()
    pitch_number = existing_pitches + 1
    
    new_pitch = Pitch(
        turn_id=pitch_data.turn_id,
        pitch_number=pitch_number,
        pitch_type=PitchType(pitch_data.pitch_type.value) if pitch_data.pitch_type else None,
        pitch_result=PitchResult(pitch_data.pitch_result.value),
        release_speed=pitch_data.release_speed
    )
    db.add(new_pitch)
    
    _update_turn_count(turn, pitch_data.pitch_result.value, db)
    
    db.commit()
    db.refresh(new_pitch)
    db.refresh(turn)
    return new_pitch

def get_pitcher_pitch_count_service(session_id: str, pitcher_id: str, scout_id: str, db: Session):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.scout_id == scout_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    count = db.query(Pitch).join(Turn).filter(
        Turn.session_id == session_id,
        Turn.pitcher_id == pitcher_id
    ).count()
    
    return PitchCountResponse(pitcher_id=pitcher_id, total_pitches=count)

def _get_turn_with_auth(turn_id: str, scout_id: str, db: Session):
    turn = db.query(Turn).join(SessionModel).filter(
        Turn.id == turn_id,
        SessionModel.scout_id == scout_id
    ).first()
    if not turn:
        raise HTTPException(status_code=404, detail="Turn not found")
    return turn

def _update_turn_count(turn: Turn, pitch_result: str, db: Session):
    if pitch_result in ["foul", "swing_miss", "strike_call"]:
        if pitch_result == "foul":
            if turn.strikes < 2:
                turn.strikes += 1
        else:
            turn.strikes += 1
    elif pitch_result == "ball":
        turn.balls += 1
    
    if turn.balls >= 4:
        turn.is_complete = True
        turn.outcome = "walk"
    elif turn.strikes >= 3:
        turn.is_complete = True
        turn.outcome = "strikeout"
    elif pitch_result == "hit":
        turn.is_complete = True
        turn.outcome = "hit"
    elif pitch_result == "out":
        turn.is_complete = True
        turn.outcome = "out"
    elif pitch_result == "hbp":
        turn.is_complete = True
        turn.outcome = "hbp"