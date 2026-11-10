import uuid
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Routine(Base, TimestampMixin):
    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    days_of_week: Mapped[str | None] = mapped_column(String(50), nullable=True) # Ex: "0,1,2,3,4"

    items = relationship("RoutineItem", back_populates="routine", cascade="all, delete-orphan", order_by="RoutineItem.position")

class RoutineItem(Base, TimestampMixin):
    __tablename__ = "routine_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    routine_id: Mapped[str] = mapped_column(String(36), ForeignKey("routines.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    start_time: Mapped[str | None] = mapped_column(String(10), nullable=True) # Ex: "08:00"
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    linked_habit_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("habits.id", ondelete="SET NULL"), nullable=True)
    linked_task_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)

    routine = relationship("Routine", back_populates="items")
