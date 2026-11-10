from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.task import TaskPriority, TaskStatus
from app.schemas.category import CategoryRead

class TaskSubtaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    completed: bool = False
    position: int = 0

class TaskSubtaskCreate(TaskSubtaskBase):
    pass

class TaskSubtaskRead(TaskSubtaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    created_at: datetime

class TaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str | None = None
    category_id: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: date | None = None
    scheduled_at: datetime | None = None

class TaskCreate(TaskBase):
    subtasks: list[TaskSubtaskCreate] = []

class TaskUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = None
    category_id: str | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: date | None = None
    scheduled_at: datetime | None = None

class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    category: CategoryRead | None = None
    subtasks: list[TaskSubtaskRead] = []

class TaskTodayItem(BaseModel):
    id: str
    title: str
    description: str | None = None
    category: str = "Geral"
    category_id: str | None = None
    priority: TaskPriority
    status: TaskStatus
    completed: bool
    due_date: date | None = None
    due_time: str | None = None
    subtasks_count: int = 0
    subtasks_completed: int = 0
