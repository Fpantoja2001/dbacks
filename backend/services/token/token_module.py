from token_controller import router as token_router
from shared.db import Base, engine
from fastapi import FastAPI


app = FastAPI()
app.include_router(token_router)

Base.metadata.create_all(bind=engine)