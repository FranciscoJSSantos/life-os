import uuid
from datetime import date, datetime
from enum import Enum
from sqlalchemy import String, Text, Float, Date, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class GoalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"

class Goal(Base, TimestampMixin):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    initial_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    target_value: Mapped[float] = mapped_column(Float, nullable=False)
    current_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(SqlEnum(GoalStatus), default=GoalStatus.ACTIVE, nullable=False)

    items = relationship("GoalItem", back_populates="goal", cascade="all, delete-orphan")

class GoalItem(Base, TimestampMixin):
    __tablename__ = "goal_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id: Mapped[str] = mapped_column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    target_value: Mapped[float] = mapped_column(Float, nullable=False)
    current_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    goal = relationship("Goal", back_populates="items")
