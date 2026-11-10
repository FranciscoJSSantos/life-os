import uuid
from datetime import date
from enum import Enum
from sqlalchemy import String, Text, Float, Integer, Date, ForeignKey, Table, Column, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class ChallengeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ARCHIVED = "ARCHIVED"

# Tabela associativa Challenge <-> Habit
challenge_habits = Table(
    "challenge_habits",
    Base.metadata,
    Column("challenge_id", String(36), ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True),
    Column("habit_id", String(36), ForeignKey("habits.id", ondelete="CASCADE"), primary_key=True)
)

class Challenge(Base, TimestampMixin):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_accuracy: Mapped[float] = mapped_column(Float, default=90.0, nullable=False) # % esperada (ex: 90% ou 100%)
    color: Mapped[str] = mapped_column(String(20), default="#06B6D4")
    icon: Mapped[str] = mapped_column(String(50), default="trophy")
    status: Mapped[ChallengeStatus] = mapped_column(SqlEnum(ChallengeStatus), default=ChallengeStatus.ACTIVE, nullable=False)

    habits = relationship("Habit", secondary=challenge_habits, lazy="joined")
