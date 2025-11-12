FROM python:3.11-slim

WORKDIR /app

COPY ./shared/requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./services/player /app

COPY ./shared /app/shared

EXPOSE 3001

CMD ["uvicorn", "player_module:app", "--host", "0.0.0.0", "--port", "3001"]