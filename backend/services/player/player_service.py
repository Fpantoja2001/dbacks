from shared.orm_models import Player
from sqlalchemy.orm import Session
from player_schema import PlayerCreate, PlayerFastCreate, PlayerResponse, PlayerUpdate
from fastapi import HTTPException
from datetime import date

def calculate_class(date_of_birth: date) -> str:
    cutoff_date = date(date_of_birth.year, 8, 31)

    if date_of_birth <= cutoff_date:
        return str(date_of_birth.year + 17)
    else:
        return str(date_of_birth.year + 18)

def create_player_service(player_data: PlayerCreate, scout_id: str, db: Session):
    new_player = Player(
        first_name = player_data.first_name,
        last_name = player_data.last_name,
        position = player_data.position,
        date_of_birth = player_data.date_of_birth,
        player_class = calculate_class(player_data.date_of_birth),
        height = player_data.height,
        weight = player_data.weight,
        throw = player_data.throw,
        bat = player_data.bat,
        birth_city = player_data.birth_city,

        agent = player_data.agent,
        related_ids = player_data.related_ids,
        notes = player_data.notes,

        scout_id = scout_id,
    )

    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return new_player

def fast_create_player_service(player_data: PlayerFastCreate, scout_id: str, db: Session):
    new_player = Player(
        first_name = player_data.first_name,
        last_name = player_data.last_name,
        position = player_data.position,
        date_of_birth = player_data.date_of_birth,
        player_class = calculate_class(player_data.date_of_birth),

        scout_id = scout_id,
    )

    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return new_player

def update_player_service(player_update_data: PlayerUpdate, player_id: str, scout_id: str, db: Session):
    player: PlayerResponse = db.query(Player).filter(Player.id == player_id).first()

    if not player:
        raise HTTPException(status_code=400, detail="Player under this ID does not exist.")

    if player.scout_id != scout_id:
        raise HTTPException(status_code=400, detail="User cannot update player")
    
    update_dict = player_update_data.model_dump(exclude_unset=True)

    # Apply updates to ORM model
    for field, value in update_dict.items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player