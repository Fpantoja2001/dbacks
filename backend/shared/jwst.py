import jwt
from datetime import datetime, timedelta, timezone
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_user_token(data: dict, expires_delta: timedelta = timedelta(days=30)):
    to_encode = data.copy()
    to_encode.update(
        {"exp": datetime.now(timezone.utc) + expires_delta}
    )
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token : str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired."}
    except jwt.InvalidTokenError:
        return {"error": "Token is invalid."}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}