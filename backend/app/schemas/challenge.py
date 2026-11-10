from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.challenge import ChallengeStatus

class ChallengeHabitStat(BaseModel):
    habit_id: str
    name: str
    color: str
    icon: str
    completed_count: int
    expected_count: int
    accuracy_rate: float

class ChallengeTimelineNote(BaseModel):
    date: date
    habit_name: str
    note: str

class ChallengeCreate(BaseModel):
    name: str = Field(..., max_length=150)
    description: str | None = None
    start_date: date = Field(default_factory=date.today)
    duration_days: int = Field(default=90, ge=1)
    target_accuracy: float = Field(default=90.0, ge=1.0, le=100.0)
    color: str = Field(default="#06B6D4")
    icon: str = Field(default="trophy")
    habit_ids: list[str] = Field(..., min_length=1)

class ChallengeUpdate(BaseModel):
    name: str | None = Field(None, max_length=150)
    description: str | None = None
    start_date: date | None = None
    duration_days: int | None = Field(None, ge=1)
    target_accuracy: float | None = Field(None, ge=1.0, le=100.0)
    color: str | None = None
    icon: str | None = None
    habit_ids: list[str] | None = None

class ChallengeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    start_date: date
    end_date: date
    duration_days: int
    days_elapsed: int
    days_remaining: int
    target_accuracy: float
    accuracy_rate: float
    days_perfect: int
    is_on_track: bool
    color: str
    icon: str
    status: ChallengeStatus
    habits_stats: list[ChallengeHabitStat] = []

class AISummaryRequest(BaseModel):
    api_key: str | None = None
    provider: str = Field(default="gemini") # "gemini" ou "openai"
    custom_prompt: str | None = None

class ChallengeSummaryReport(BaseModel):
    challenge_id: str
    name: str
    start_date: date
    end_date: date
    days_elapsed: int
    total_days: int
    overall_accuracy: float
    is_on_track: bool
    habits_stats: list[ChallengeHabitStat]
    timeline_notes: list[ChallengeTimelineNote]
    ai_analysis: str
