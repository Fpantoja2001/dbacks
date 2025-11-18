from datetime import datetime, date, time
from typing import Any, Dict, List, Optional
from uuid import uuid4
import enum
from sqlalchemy import CHAR, DateTime, ForeignKey, JSON, String, Date, Time, Integer, Enum
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
    token: Mapped[str] = mapped_column(String(128), nullable=True)

    players: Mapped[List["Player"]] = relationship(back_populates="scout")
    sessions: Mapped[List["Session"]] = relationship(back_populates="scout")

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
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
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

class Session(Base):
    __tablename__ = "sessions"
    
    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)
    scout_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    # Relationships
    scout: Mapped["User"] = relationship(back_populates="sessions")
    turns: Mapped[List["Turn"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=True
    )

class Turn(Base):
    __tablename__ = "turns"
    
    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), nullable=False)
    
    # Player references
    batter_id: Mapped[str] = mapped_column(String(36), ForeignKey("players.id"), nullable=False)
    pitcher_id: Mapped[str] = mapped_column(String(36), ForeignKey("players.id"), nullable=False)
    
    # Timing
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    
    # Count tracking (calculated from pitches)
    balls: Mapped[int] = mapped_column(Integer, default=0)
    strikes: Mapped[int] = mapped_column(Integer, default=0)
    outs: Mapped[int] = mapped_column(Integer, default=0)
    runs: Mapped[int] = mapped_column(Integer, default=0)
    
    # Turn outcome
    is_complete: Mapped[bool] = mapped_column(default=False)
    outcome: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # "walk", "strikeout", "hit", etc.
    
    # Relationships
    session: Mapped["Session"] = relationship(back_populates="turns")
    batter: Mapped["Player"] = relationship(foreign_keys=[batter_id])
    pitcher: Mapped["Player"] = relationship(foreign_keys=[pitcher_id])
    pitches: Mapped[List["Pitch"]] = relationship(back_populates="turn", cascade="all, delete-orphan", order_by="Pitch.pitch_number")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=True
    )

class PitchType(str, enum.Enum):
    FASTBALL = "FB"
    CURVEBALL = "CB"
    CHANGEUP = "CH"
    SLIDER = "SL"

class PitchResult(str, enum.Enum):
    BALL = "ball"
    STRIKE_CALL = "strike_call"
    SWING_MISS = "swing_miss"
    FOUL = "foul"
    HIT = "hit"
    OUT = "out"
    WALK = "walk"
    HBP = "hbp"  # Hit by pitch


class Pitch(Base):
    __tablename__ = "pitches"
    
    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=gen_id)
    turn_id: Mapped[str] = mapped_column(String(36), ForeignKey("turns.id"), nullable=False)
    
    pitch_number: Mapped[int] = mapped_column(Integer, nullable=False)
    pitch_type: Mapped[Optional[PitchType]] = mapped_column(Enum(PitchType), nullable=True)
    pitch_result: Mapped[PitchResult] = mapped_column(Enum(PitchResult), nullable=False)
    release_speed: Mapped[Optional[float]] = mapped_column(nullable=True)

    # Relationships
    turn: Mapped["Turn"] = relationship(back_populates="pitches")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)