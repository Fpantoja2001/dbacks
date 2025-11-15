from fastapi import APIRouter, HTTPException, Cookie, Response, Depends, Request
from user_schema import UserCreate, UserLogin, UserResponse
from shared.db import get_db
from sqlalchemy.orm import Session
from user_service import create_user_service, login_user_service, get_personal_info_service
from typing import Optional
from shared.jwst import create_user_token


router = APIRouter(tags=["User"])

# Endpoint to check service health
@router.get("/health")
def health_check():
    return { "health" : "ok" }

@router.get("/", response_model=UserResponse)
def get_personal_info_controller(request: Request, db: Session = Depends(get_db)):
    user_id = getattr(request.state, "user_id", None)
    print(user_id)
    return get_personal_info_service(user_id, db)

# Endpoint to create user account
@router.post("/create", response_model=UserResponse)
def create_user_controller(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_user_service(user_data, db)

# Endpoint to login
@router.post("/login")
def login_user_controller(user_data: UserLogin, response: Response, user_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    # If user has token remove, this means they've logged in.
    if user_token:
        response.delete_cookie(
            key="user_token",
            path="/"
        )

    # If user details don't align there'll be an error.
    result: UserResponse = login_user_service(user_data, db)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid password for this user.")
    
    # If users login details are correct, set a cookie for them. 
    response.set_cookie(
        key="user_token",
        value = create_user_token({ "id": result.id }),
        httponly=True,
        secure=False,
        samesite="lax",
        max_age= 3600 * 30,
        path="/"
    )

    # Once cookie  is set they're logged in.
    return {"detail" : "User Logged in succesfully."}

@router.post("/logout")
def user_logout_controller(response: Response, user_token: Optional[str] = Cookie(None)):
    # If user does not have a user token, they're not logged in.
    if not user_token:
        raise HTTPException(status_code=400, detail="No logged in user.")
    
    # If they do have one, delete it. 
    response.delete_cookie(
        key="user_token",
        path="/"
    )

    # Once deleted they're logged out.
    return {"message": "User logged out successfully."}
