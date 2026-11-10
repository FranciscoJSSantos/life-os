import calendar
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.models.habit import Habit, HabitLog, HabitStatus, LogStatus
from app.models.task import Task, TaskStatus
from app.schemas.analytics import HeatmapDay, CalendarDayData, CalendarMonthRead, AnalyticsOverview
from app.services.habit_service import HabitService

class AnalyticsService:
    @staticmethod
    def get_habit_heatmap(db: Session, habit_id: str, year: int | None = None) -> list[HeatmapDay]:
        habit = db.get(Habit, habit_id)
        if not habit:
            return []

        target_year = year or date.today().year
        start_date = date(target_year, 1, 1)
        end_date = date(target_year, 12, 31)

        # Buscar todos os logs do hábito no período
        logs = db.scalars(
            select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit_id,
                    HabitLog.scheduled_date >= start_date,
                    HabitLog.scheduled_date <= end_date,
                    HabitLog.status == LogStatus.COMPLETED
                )
            )
        ).all()

        # Agrupar valores por data
        daily_values: dict[str, float] = {}
        for log in logs:
            key = log.scheduled_date.isoformat()
            daily_values[key] = daily_values.get(key, 0.0) + log.value

        days: list[HeatmapDay] = []
        curr = start_date
        while curr <= end_date:
            date_str = curr.isoformat()
            val = daily_values.get(date_str, 0.0)
            completed = val >= habit.target_value

            if val == 0:
                intensity = 0
            elif val < (habit.target_value * 0.3):
                intensity = 1
            elif val < (habit.target_value * 0.7):
                intensity = 2
            elif val < habit.target_value:
                intensity = 3
            else:
                intensity = 4

            days.append(
                HeatmapDay(
                    date=date_str,
                    value=round(val, 2),
                    target_value=habit.target_value,
                    completed=completed,
                    intensity=intensity
                )
            )
            curr += timedelta(days=1)

        return days

    @staticmethod
    def get_calendar_month(db: Session, year: int, month: int) -> CalendarMonthRead:
        num_days = calendar.monthrange(year, month)[1]
        active_habits = list(db.scalars(
            select(Habit).where(Habit.status == HabitStatus.ACTIVE)
        ).all())

        days_data: list[CalendarDayData] = []

        for day in range(1, num_days + 1):
            curr_date = date(year, month, day)

            # Hábitos previstos e concluídos no dia
            habits_scheduled = 0
            habits_completed = 0
            for h in active_habits:
                if HabitService.is_habit_scheduled(h, curr_date):
                    habits_scheduled += 1
                    if HabitService.is_completed_on_date(db, h.id, curr_date, h.target_value):
                        habits_completed += 1

            # Tarefas do dia
            tasks_due = list(db.scalars(
                select(Task).where(Task.due_date == curr_date)
            ).all())
            tasks_total = len(tasks_due)
            tasks_completed = sum(1 for t in tasks_due if t.status == TaskStatus.COMPLETED)

            total_items = habits_scheduled + tasks_total
            completed_items = habits_completed + tasks_completed
            completion_rate = round((completed_items / total_items * 100), 1) if total_items > 0 else 0.0

            days_data.append(
                CalendarDayData(
                    date=curr_date.isoformat(),
                    weekday=curr_date.weekday(),
                    habits_total=habits_scheduled,
                    habits_completed=habits_completed,
                    tasks_total=tasks_total,
                    tasks_completed=tasks_completed,
                    completion_rate=completion_rate
                )
            )

        return CalendarMonthRead(
            year=year,
            month=month,
            days=days_data
        )

    @staticmethod
    def get_overview(db: Session) -> AnalyticsOverview:
        habits = list(db.scalars(select(Habit)).all())
        active_habits = [h for h in habits if h.status == HabitStatus.ACTIVE]
        tasks = list(db.scalars(select(Task)).all())
        completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED]

        today = date.today()

        # Melhor sequência atual
        best_habit_name: str | None = None
        best_streak = 0
        for h in active_habits:
            streak = HabitService.calculate_streak(db, h, today)
            if streak > best_streak:
                best_streak = streak
                best_habit_name = h.name

        # Total de logs concluídos
        total_logs = db.scalar(
            select(func.count(HabitLog.id)).where(HabitLog.status == LogStatus.COMPLETED)
        ) or 0

        # Média semanal (últimos 7 dias)
        week_completed = 0
        week_total = 0
        for i in range(7):
            d = today - timedelta(days=i)
            for h in active_habits:
                if HabitService.is_habit_scheduled(h, d):
                    week_total += 1
                    if HabitService.is_completed_on_date(db, h.id, d, h.target_value):
                        week_completed += 1

        weekly_rate = round((week_completed / week_total * 100), 1) if week_total > 0 else 0.0

        return AnalyticsOverview(
            total_habits=len(habits),
            active_habits=len(active_habits),
            total_tasks=len(tasks),
            completed_tasks=len(completed_tasks),
            best_streak_habit=best_habit_name,
            best_streak_count=best_streak,
            weekly_completion_rate=weekly_rate,
            monthly_completion_rate=weekly_rate,
            total_completed_logs=total_logs
        )
