from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, JSON, String
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.db import Base

def gen_id():
    return str(uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    password: Mapped[str] = mapped_column(String(128), nullable=False)
    token: Mapped[str] = mapped_column(String(128), nullable=False)

    players: Mapped[List["Player"]] = relationship(back_populates="scout")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=False
    )


class Player(Base):
    __tablename__ = "players"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[str] = mapped_column(String(100), nullable=False)
    player_class: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    height: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    weight: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    throw: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bat: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    birth_city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    agent: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    related_ids: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        MutableDict.as_mutable(JSON), nullable=True
    )
    notes: Mapped[str] = mapped_column(String(500), default="")

    scout_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    scout: Mapped["User"] = relationship(back_populates="players")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=True
    )


class Token(Base):
    __tablename__ = "tokens"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)

    claimer: Mapped[Optional[str]] = mapped_column(CHAR(36), default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=True
    )