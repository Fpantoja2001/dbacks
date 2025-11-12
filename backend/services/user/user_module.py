from user_controller import router as user_router
from shared.db import Base, engine
from fastapi import FastAPI


app = FastAPI()
app.include_router(user_router)

Base.metadata.create_all(bind=engine)