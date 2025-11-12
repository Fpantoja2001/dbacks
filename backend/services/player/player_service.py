from shared.orm_models import Player
from sqlalchemy.orm import Session
from player_schema import PlayerCreate, PlayerFastCreate, PlayerResponse

def calculate_class(date_of_birth: str):
    pass

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

def update_player_service():
    pass