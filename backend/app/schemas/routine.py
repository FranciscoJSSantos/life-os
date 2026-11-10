from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RoutineItemBase(BaseModel):
    title: str = Field(..., max_length=150)
    start_time: str | None = Field(None, max_length=10) # Ex: "07:30"
    duration_minutes: int | None = None
    position: int = 0
    linked_habit_id: str | None = None
    linked_task_id: str | None = None

class RoutineItemCreate(RoutineItemBase):
    pass

class RoutineItemRead(RoutineItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    routine_id: str
    created_at: datetime

class RoutineBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None
    active: bool = True
    days_of_week: str | None = None # Ex: "0,1,2,3,4"

class RoutineCreate(RoutineBase):
    items: list[RoutineItemCreate] = []

class RoutineUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    description: str | None = None
    active: bool | None = None
    days_of_week: str | None = None

class RoutineRead(RoutineBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
    items: list[RoutineItemRead] = []
