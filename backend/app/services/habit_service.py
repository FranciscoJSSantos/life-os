from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func, desc
from app.models.habit import (
    Habit, HabitSchedule, HabitLog,
    HabitStatus, FrequencyType, LogStatus, HabitType
)
from app.schemas.habit import HabitCreate, HabitUpdate, HabitTodayItem, HabitLogCreate

class HabitService:
    @staticmethod
    def create_habit(db: Session, habit_in: HabitCreate) -> Habit:
        schedule_data = habit_in.schedule.model_dump()
        habit_data = habit_in.model_dump(exclude={"schedule"})

        habit = Habit(**habit_data)
        db.add(habit)
        db.flush()

        schedule = HabitSchedule(habit_id=habit.id, **schedule_data)
        db.add(schedule)
        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def list_habits(db: Session, status: HabitStatus | None = None) -> list[Habit]:
        query = select(Habit).order_by(Habit.created_at.desc())
        if status:
            query = query.where(Habit.status == status)
        return list(db.scalars(query).all())

    @staticmethod
    def get_habit(db: Session, habit_id: str) -> Habit | None:
        return db.get(Habit, habit_id)

    @staticmethod
    def update_habit(db: Session, habit_id: str, habit_in: HabitUpdate) -> Habit | None:
        habit = db.get(Habit, habit_id)
        if not habit:
            return None

        update_data = habit_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(habit, key, value)

        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def delete_habit(db: Session, habit_id: str, hard_delete: bool = False) -> bool:
        habit = db.get(Habit, habit_id)
        if not habit:
            return False

        if hard_delete:
            from app.models.challenge import challenge_habits
            # Limpar associações em desafios antes de deletar
            db.execute(challenge_habits.delete().where(challenge_habits.c.habit_id == habit_id))
            db.delete(habit)
        else:
            habit.status = HabitStatus.ARCHIVED

        db.commit()
        return True

    @staticmethod
    def is_habit_scheduled(habit: Habit, target_date: date) -> bool:
        """
        Determina se um hábito está previsto para uma data específica com base
        no agendamento ativo naquela data.
        """
        if habit.status != HabitStatus.ACTIVE:
            return False
        if target_date < habit.start_date:
            return False
        if habit.end_date and target_date > habit.end_date:
            return False

        # Encontrar a regra de agendamento em vigor na data
        active_schedule: HabitSchedule | None = None
        for s in habit.schedules:
            if s.effective_from <= target_date:
                if s.effective_until is None or s.effective_until >= target_date:
                    active_schedule = s
                    break

        # Se não houver regra específica, padrão é DAILY
        if not active_schedule:
            return True

        freq = active_schedule.frequency_type

        if freq == FrequencyType.DAILY:
            return True

        if freq == FrequencyType.WEEKLY_DAYS:
            # target_date.weekday(): 0=Segunda, 6=Domingo
            if not active_schedule.weekdays:
                return True
            valid_days = [int(d.strip()) for d in active_schedule.weekdays.split(",") if d.strip().isdigit()]
            return target_date.weekday() in valid_days

        if freq == FrequencyType.INTERVAL:
            interval = active_schedule.interval_value or 1
            days_diff = (target_date - active_schedule.effective_from).days
            return days_diff >= 0 and (days_diff % interval == 0)

        if freq == FrequencyType.MONTHLY_DAYS:
            if not active_schedule.month_days:
                return True
            valid_month_days = [int(d.strip()) for d in active_schedule.month_days.split(",") if d.strip().isdigit()]
            return target_date.day in valid_month_days

        return True

    @staticmethod
    def calculate_streak(db: Session, habit: Habit, reference_date: date) -> int:
        """
        Calcula a sequência contínua (streak) respeitando rigorosamente os dias
        programados do hábito, sem punir dias de folga programados.
        """
        streak = 0
        current_date = reference_date

        # Checar se hoje já foi concluído
        today_completed = HabitService.is_completed_on_date(db, habit.id, current_date, habit.target_value)
        if today_completed:
            streak += 1
            current_date -= timedelta(days=1)
        elif HabitService.is_habit_scheduled(habit, current_date):
            # Se hoje está previsto mas ainda não concluído, começar a verificar a partir de ontem
            current_date -= timedelta(days=1)
        else:
            # Hoje não era previsto, começar a verificar a partir de ontem
            current_date -= timedelta(days=1)

        # Olhar até 365 dias para trás
        max_lookback = 365
        days_checked = 0

        while days_checked < max_lookback and current_date >= habit.start_date:
            days_checked += 1
            if HabitService.is_habit_scheduled(habit, current_date):
                if HabitService.is_completed_on_date(db, habit.id, current_date, habit.target_value):
                    streak += 1
                else:
                    # Falha em dia programado: quebra o streak
                    break
            # Se não estava programado naquele dia, pula sem quebrar a sequência
            current_date -= timedelta(days=1)

        return streak

    @staticmethod
    def is_completed_on_date(db: Session, habit_id: str, target_date: date, target_value: float) -> bool:
        total = db.scalar(
            select(func.coalesce(func.sum(HabitLog.value), 0.0))
            .where(
                and_(
                    HabitLog.habit_id == habit_id,
                    HabitLog.scheduled_date == target_date,
                    HabitLog.status == LogStatus.COMPLETED
                )
            )
        ) or 0.0
        return total >= target_value

    @staticmethod
    def get_today_habits(db: Session, target_date: date | None = None) -> list[HabitTodayItem]:
        ref_date = target_date or date.today()
        all_habits = db.scalars(
            select(Habit)
            .where(Habit.status == HabitStatus.ACTIVE)
            .order_by(Habit.created_at.asc())
        ).all()

        today_items: list[HabitTodayItem] = []

        for habit in all_habits:
            if not HabitService.is_habit_scheduled(habit, ref_date):
                continue

            # Somar valor dos logs da data
            logs = db.scalars(
                select(HabitLog)
                .where(
                    and_(
                        HabitLog.habit_id == habit.id,
                        HabitLog.scheduled_date == ref_date,
                        HabitLog.status == LogStatus.COMPLETED
                    )
                )
            ).all()

            current_val = sum(log.value for log in logs)
            is_completed = current_val >= habit.target_value
            streak = HabitService.calculate_streak(db, habit, ref_date)

            category_name = habit.category.name if habit.category else "Geral"
            notes_list = [log.notes for log in logs if log.notes]
            notes_str = " | ".join(notes_list) if notes_list else None

            today_items.append(
                HabitTodayItem(
                    id=habit.id,
                    name=habit.name,
                    description=habit.description,
                    category=category_name,
                    category_id=habit.category_id,
                    icon=habit.icon,
                    color=habit.color,
                    habit_type=habit.habit_type,
                    target_value=habit.target_value,
                    current_value=current_val,
                    unit=habit.unit,
                    completed=is_completed,
                    streak=streak,
                    logs_count=len(logs),
                    notes=notes_str
                )
            )

        return today_items

    @staticmethod
    def toggle_or_add_log(
        db: Session, 
        habit_id: str, 
        target_date: date, 
        value: float | None = None,
        notes: str | None = None
    ) -> HabitTodayItem:
        habit = db.get(Habit, habit_id)
        if not habit:
            raise ValueError("Hábito não encontrado")

        # Buscar logs existentes para a data
        existing_logs = list(db.scalars(
            select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit_id,
                    HabitLog.scheduled_date == target_date
                )
            )
        ).all())

        current_val = sum(log.value for log in existing_logs if log.status == LogStatus.COMPLETED)
        is_already_completed = current_val >= habit.target_value

        if is_already_completed and notes is None:
            # Desmarcar: remove os logs do dia
            for log in existing_logs:
                db.delete(log)
            db.commit()
        elif is_already_completed and notes is not None:
            # Apenas atualizar nota
            for log in existing_logs:
                log.notes = notes
            db.commit()
        else:
            # Marcar como concluído
            add_val = value if value is not None else (habit.target_value - current_val)
            if add_val <= 0:
                add_val = habit.target_value

            new_log = HabitLog(
                habit_id=habit_id,
                scheduled_date=target_date,
                value=add_val,
                status=LogStatus.COMPLETED,
                notes=notes
            )
            db.add(new_log)
            db.commit()

        # Retornar estado atualizado
        updated_list = HabitService.get_today_habits(db, target_date)
        for item in updated_list:
            if item.id == habit_id:
                return item

        # Caso não esteja previsto para hoje, retorna item calculado
        return HabitTodayItem(
            id=habit.id,
            name=habit.name,
            description=habit.description,
            category=habit.category.name if habit.category else "Geral",
            category_id=habit.category_id,
            icon=habit.icon,
            color=habit.color,
            habit_type=habit.habit_type,
            target_value=habit.target_value,
            current_value=0.0 if is_already_completed else habit.target_value,
            unit=habit.unit,
            completed=not is_already_completed,
            streak=HabitService.calculate_streak(db, habit, target_date),
            logs_count=0 if is_already_completed else 1
        )
