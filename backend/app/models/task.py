import uuid
from datetime import date, datetime
from enum import Enum
from sqlalchemy import String, Text, Integer, Boolean, Date, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(SqlEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(SqlEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False, index=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    category = relationship("Category", back_populates="tasks")
    subtasks = relationship("TaskSubtask", back_populates="task", cascade="all, delete-orphan", order_by="TaskSubtask.position")

class TaskSubtask(Base, TimestampMixin):
    __tablename__ = "task_subtasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    task = relationship("Task", back_populates="subtasks")
