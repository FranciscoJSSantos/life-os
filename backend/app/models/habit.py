import uuid
from datetime import date
from enum import Enum
from sqlalchemy import String, Text, Float, Integer, Date, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class HabitType(str, Enum):
    BOOLEAN = "BOOLEAN"
    NUMERIC = "NUMERIC"
    DURATION = "DURATION"

class HabitStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"

class FrequencyType(str, Enum):
    DAILY = "DAILY"
    WEEKLY_DAYS = "WEEKLY_DAYS"
    INTERVAL = "INTERVAL"
    MONTHLY_DAYS = "MONTHLY_DAYS"
    TIMES_PER_WEEK = "TIMES_PER_WEEK"

class LogStatus(str, Enum):
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    FAILED = "FAILED"

class Habit(Base, TimestampMixin):
    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), default="check-circle")
    color: Mapped[str] = mapped_column(String(20), default="#10B981")
    habit_type: Mapped[HabitType] = mapped_column(SqlEnum(HabitType), default=HabitType.BOOLEAN, nullable=False)
    target_value: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[HabitStatus] = mapped_column(SqlEnum(HabitStatus), default=HabitStatus.ACTIVE, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    category = relationship("Category", back_populates="habits")
    schedules = relationship("HabitSchedule", back_populates="habit", cascade="all, delete-orphan", order_by="HabitSchedule.effective_from.desc()")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan", order_by="HabitLog.scheduled_date.desc()")

class HabitSchedule(Base, TimestampMixin):
    __tablename__ = "habit_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id: Mapped[str] = mapped_column(String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    frequency_type: Mapped[FrequencyType] = mapped_column(SqlEnum(FrequencyType), default=FrequencyType.DAILY, nullable=False)
    interval_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weekdays: Mapped[str | None] = mapped_column(String(50), nullable=True) # Ex: "0,2,4" (0=Seg, 6=Dom)
    month_days: Mapped[str | None] = mapped_column(String(100), nullable=True) # Ex: "1,15,30"
    times_per_period: Mapped[int | None] = mapped_column(Integer, nullable=True)
    effective_from: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    effective_until: Mapped[date | None] = mapped_column(Date, nullable=True)

    habit = relationship("Habit", back_populates="schedules")

class HabitLog(Base, TimestampMixin):
    __tablename__ = "habit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id: Mapped[str] = mapped_column(String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[LogStatus] = mapped_column(SqlEnum(LogStatus), default=LogStatus.COMPLETED, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    habit = relationship("Habit", back_populates="logs")
