from shared.orm_models import User, Token
from sqlalchemy.orm import Session
from user_schema import UserCreate, UserResponse, UserLogin
from fastapi import HTTPException
from shared.jwst import create_user_token, verify_token

def create_user_service(user_data: UserCreate, db: Session) -> UserResponse:
    # Initialize new user
    new_user = User(
        first_name = user_data.first_name,
        last_name = user_data.last_name,
        email = user_data.email,
        password = user_data.password,
    )

    # Add new user to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user_service(user_data: UserLogin ,db: Session) -> UserResponse:
    user: User = db.query(User).filter(User.email == user_data.email).first()
    token:  Token = db.query(Token).filter(Token.id == user_data.token).first()
    
    # Check user exists for this email
    if not user: 
        raise HTTPException(status_code=400, detail="No user found with that email.")
    
    # Check if users passed in password matches
    if not(user.password == user_data.password):
            raise HTTPException(status_code=400, detail="Invalid password for this user.")
    
    # Check that the users entered token exists.
    if not token:
        raise HTTPException(status_code=400, detail="Token key does not exist.")
    
    # Check if token does not have a claimer, set the user as its claimer.
    if not token.claimer:
        token.claimer = user.id
        user.token = token.id
        db.commit()
        db.refresh(token)
        db.refresh(user)
    
    # Checks if token is registered to user
    if not(token.claimer == user.id):
        raise HTTPException(status_code=400, detail="Token not registered to this user.")
    # If errors don't arisse return the new user
    return user

def get_personal_info_service(user_id: str, db: Session):
    return db.query(User).filter(User.id == user_id).first()
