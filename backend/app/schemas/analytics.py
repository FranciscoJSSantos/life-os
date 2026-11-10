from pydantic import BaseModel

class HeatmapDay(BaseModel):
    date: str # YYYY-MM-DD
    value: float
    target_value: float
    completed: bool
    intensity: int # 0 (nenhum), 1 (pouco), 2 (médio), 3 (quase tudo), 4 (completo)

class CalendarDayData(BaseModel):
    date: str # YYYY-MM-DD
    weekday: int # 0=Segunda, 6=Domingo
    habits_total: int
    habits_completed: float
    tasks_total: int
    tasks_completed: int
    completion_rate: float

class CalendarMonthRead(BaseModel):
    year: int
    month: int
    days: list[CalendarDayData]

class AnalyticsOverview(BaseModel):
    total_habits: int
    active_habits: int
    total_tasks: int
    completed_tasks: int
    best_streak_habit: str | None
    best_streak_count: int
    weekly_completion_rate: float
    monthly_completion_rate: float
    total_completed_logs: int
