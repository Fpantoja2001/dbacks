from user_controller import router as user_router
from shared.db import Base, engine
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from shared import verify_token

# Whitelisted Routes
whitelisted = [
    '/health',
    '/create',
    '/login'
]

app = FastAPI()
app.include_router(user_router)



@app.middleware("http")
async def check_login(request: Request, call_next):
    # Check if request is for a whitelisted route
    if request.url.path in whitelisted:
        response = await call_next(request)
        return response
    
    user_cookie = request.cookies.get("user_token")

    if not user_cookie:
        return JSONResponse(status_code=400, content={"detail": "User must be logged in."})

    try:
        user_token = verify_token(user_cookie)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": f"Error validating token; {e}"})

    request.state.user_id = user_token["id"]

    return await call_next(request)


Base.metadata.create_all(bind=engine)