from shared.orm_models import Token
from sqlalchemy.orm import Session

def create_token_service(db: Session):
    new_token = Token()

    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token


