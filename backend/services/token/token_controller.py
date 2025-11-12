from fastapi import APIRouter
from sqlalchemy.orm import Session
from shared.db import get_db
from token_service import create_token_service
from token_schema import TokenResponse


router = APIRouter(tags=["Players"])

router.post("/create", response_model=TokenResponse)
def create_token_controller(db: Session = get_db):
    return create_token_service(db)