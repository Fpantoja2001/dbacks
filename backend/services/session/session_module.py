from session_controller import router as session_router
from shared.db import Base, engine
from fastapi import FastAPI, Request
from shared.jwst import verify_token
from fastapi.responses import JSONResponse

app = FastAPI()
app.include_router(session_router)

@app.middleware("http")
async def check_login(request: Request, call_next):
    user_cookie = request.cookies.get("user_token")

    if not user_cookie:
        return JSONResponse(status_code=400, content={"detail": "User must be logged in."})

    try:
        user_token = verify_token(user_cookie)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": f"Error validating token; {e}"})

    request.state.scout_id = user_token["id"]

    return await call_next(request)

Base.metadata.create_all(bind=engine)