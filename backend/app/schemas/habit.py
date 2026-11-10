from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.habit import HabitType, HabitStatus, FrequencyType, LogStatus
from app.schemas.category import CategoryRead

class HabitScheduleBase(BaseModel):
    frequency_type: FrequencyType = FrequencyType.DAILY
    interval_value: int | None = None
    weekdays: str | None = None  # ex: "0,1,2,3,4" (0=Segunda, 6=Domingo)
    month_days: str | None = None
    times_per_period: int | None = None
    effective_from: date = Field(default_factory=date.today)
    effective_until: date | None = None

class HabitScheduleCreate(HabitScheduleBase):
    pass

class HabitScheduleRead(HabitScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    habit_id: str
    created_at: datetime

class HabitLogCreate(BaseModel):
    scheduled_date: date = Field(default_factory=date.today)
    value: float = Field(default=1.0, ge=0)
    duration_seconds: int | None = None
    status: LogStatus = LogStatus.COMPLETED
    notes: str | None = None

class HabitLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    habit_id: str
    scheduled_date: date
    value: float
    duration_seconds: int | None
    status: LogStatus
    notes: str | None
    created_at: datetime

class HabitBase(BaseModel):
    name: str = Field(..., max_length=150)
    description: str | None = None
    category_id: str | None = None
    icon: str = Field(default="check-circle", max_length=50)
    color: str = Field(default="#10B981", max_length=20)
    habit_type: HabitType = HabitType.BOOLEAN
    target_value: float = Field(default=1.0, gt=0)
    unit: str | None = Field(default=None, max_length=30)
    start_date: date = Field(default_factory=date.today)
    end_date: date | None = None

class HabitCreate(HabitBase):
    schedule: HabitScheduleCreate = Field(default_factory=HabitScheduleCreate)

class HabitUpdate(BaseModel):
    name: str | None = Field(None, max_length=150)
    description: str | None = None
    category_id: str | None = None
    icon: str | None = None
    color: str | None = None
    habit_type: HabitType | None = None
    target_value: float | None = Field(None, gt=0)
    unit: str | None = None
    status: HabitStatus | None = None
    end_date: date | None = None

class HabitRead(HabitBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: HabitStatus
    created_at: datetime
    updated_at: datetime
    category: CategoryRead | None = None
    schedules: list[HabitScheduleRead] = []

class HabitTodayItem(BaseModel):
    id: str
    name: str
    description: str | None = None
    category: str = "Geral"
    category_id: str | None = None
    icon: str
    color: str
    habit_type: HabitType
    target_value: float
    current_value: float
    unit: str | None = None
    completed: bool = False
    streak: int = 0
    logs_count: int = 0
