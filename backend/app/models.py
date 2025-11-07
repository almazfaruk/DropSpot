import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Drop(Base):
    __tablename__ = "drops"
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    claim_window_start = Column(DateTime, nullable=True)
    claim_window_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Waitlist(Base):
    __tablename__ = "waitlists"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    drop_id = Column(String, ForeignKey("drops.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    priority_score = Column(Integer, default=0)
    claimed = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("user_id", "drop_id", name="u_user_drop"),)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    drop_id = Column(String, ForeignKey("drops.id"), nullable=False)
    claim_code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
