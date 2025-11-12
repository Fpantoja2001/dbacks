from pydantic import BaseModel
from datetime import datetime

class TokenResponse(BaseModel):
    # Primary Key
    id: str

    # User ID
    claimer: str

    # Time
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes: True