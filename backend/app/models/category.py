import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#3B82F6")
    icon: Mapped[str] = mapped_column(String(50), nullable=False, default="tag")

    habits = relationship("Habit", back_populates="category", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="category", cascade="all, delete-orphan")
