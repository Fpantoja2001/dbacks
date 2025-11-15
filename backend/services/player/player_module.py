from player_controller import router as player_router
from shared.db import Base, engine
from fastapi import FastAPI, middleware, Request, HTTPException
from shared.jwst import verify_token
from fastapi.responses import JSONResponse

app = FastAPI()
app.include_router(player_router)

# @app.middleware("http")
# async def check_login(request: Request, call_next):
#     try:
#         # Take in users cookies
#         user_cookie = request.cookies.get("user_token")

#         # Check if user has cookies
#         if not user_cookie: 
#             # raise HTTPException(status_code=400, detail="User must be logged in.")
#             return JSONResponse(
#                 status_code=400,
#                 content={"detail" :"User must be logged in."}
#             )
        
#         # Verify users token is valid
#         try:
#             user_token = verify_token(user_cookie)
#         except Exception as e:
#             return JSONResponse(
#                 status_code=400,
#                 content={"detail" : f"Error validating token; {e}"}
#             )
        
#         # Set user state to pass into controller
#         request.state.scout = {"id": user_token["id"]}

#         # Forward the request
#         response = await call_next(request)
#         return response

#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"detail" : f"Internal server error; {e}"}
#         )


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