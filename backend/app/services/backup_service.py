from datetime import datetime, date, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.category import Category
from app.models.habit import Habit, HabitSchedule, HabitLog, HabitType, HabitStatus, FrequencyType, LogStatus
from app.models.task import Task, TaskSubtask, TaskPriority, TaskStatus
from app.models.routine import Routine, RoutineItem
from app.models.setting import Setting

class BackupService:
    @staticmethod
    def export_data(db: Session) -> dict:
        """
        Exporta todos os dados das tabelas do LifeOS em formato JSON estruturado.
        """
        categories = db.scalars(select(Category)).all()
        habits = db.scalars(select(Habit)).all()
        schedules = db.scalars(select(HabitSchedule)).all()
        logs = db.scalars(select(HabitLog)).all()
        tasks = db.scalars(select(Task)).all()
        subtasks = db.scalars(select(TaskSubtask)).all()
        routines = db.scalars(select(Routine)).all()
        routine_items = db.scalars(select(RoutineItem)).all()
        settings = db.scalars(select(Setting)).all()

        return {
            "version": "1.0",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "data": {
                "categories": [
                    {
                        "id": c.id, "name": c.name, "description": c.description,
                        "color": c.color, "icon": c.icon,
                        "created_at": c.created_at.isoformat(), "updated_at": c.updated_at.isoformat()
                    }
                    for c in categories
                ],
                "habits": [
                    {
                        "id": h.id, "category_id": h.category_id, "name": h.name,
                        "description": h.description, "icon": h.icon, "color": h.color,
                        "habit_type": h.habit_type.value, "target_value": h.target_value,
                        "unit": h.unit, "status": h.status.value,
                        "start_date": h.start_date.isoformat(),
                        "end_date": h.end_date.isoformat() if h.end_date else None,
                        "created_at": h.created_at.isoformat(), "updated_at": h.updated_at.isoformat()
                    }
                    for h in habits
                ],
                "habit_schedules": [
                    {
                        "id": s.id, "habit_id": s.habit_id,
                        "frequency_type": s.frequency_type.value,
                        "interval_value": s.interval_value,
                        "weekdays": s.weekdays, "month_days": s.month_days,
                        "times_per_period": s.times_per_period,
                        "effective_from": s.effective_from.isoformat(),
                        "effective_until": s.effective_until.isoformat() if s.effective_until else None,
                        "created_at": s.created_at.isoformat()
                    }
                    for s in schedules
                ],
                "habit_logs": [
                    {
                        "id": l.id, "habit_id": l.habit_id,
                        "scheduled_date": l.scheduled_date.isoformat(),
                        "value": l.value, "duration_seconds": l.duration_seconds,
                        "status": l.status.value, "notes": l.notes,
                        "created_at": l.created_at.isoformat()
                    }
                    for l in logs
                ],
                "tasks": [
                    {
                        "id": t.id, "category_id": t.category_id, "title": t.title,
                        "description": t.description, "priority": t.priority.value,
                        "status": t.status.value,
                        "due_date": t.due_date.isoformat() if t.due_date else None,
                        "scheduled_at": t.scheduled_at.isoformat() if t.scheduled_at else None,
                        "completed_at": t.completed_at.isoformat() if t.completed_at else None,
                        "created_at": t.created_at.isoformat(), "updated_at": t.updated_at.isoformat()
                    }
                    for t in tasks
                ],
                "task_subtasks": [
                    {
                        "id": st.id, "task_id": st.task_id, "title": st.title,
                        "completed": st.completed, "position": st.position,
                        "created_at": st.created_at.isoformat()
                    }
                    for st in subtasks
                ],
                "routines": [
                    {
                        "id": r.id, "name": r.name, "description": r.description,
                        "active": r.active, "days_of_week": r.days_of_week,
                        "created_at": r.created_at.isoformat(), "updated_at": r.updated_at.isoformat()
                    }
                    for r in routines
                ],
                "routine_items": [
                    {
                        "id": ri.id, "routine_id": ri.routine_id, "title": ri.title,
                        "start_time": ri.start_time, "duration_minutes": ri.duration_minutes,
                        "position": ri.position, "linked_habit_id": ri.linked_habit_id,
                        "linked_task_id": ri.linked_task_id, "created_at": ri.created_at.isoformat()
                    }
                    for ri in routine_items
                ],
                "settings": [
                    {
                        "id": setg.id, "key": setg.key, "value": setg.value,
                        "updated_at": setg.updated_at.isoformat()
                    }
                    for setg in settings
                ]
            }
        }

    @staticmethod
    def import_data(db: Session, backup_payload: dict) -> dict:
        """
        Restaura o banco a partir do backup exportado.
        """
        data = backup_payload.get("data", {})

        # Limpar tabelas mantendo integridade
        db.execute(delete(HabitLog))
        db.execute(delete(HabitSchedule))
        db.execute(delete(TaskSubtask))
        db.execute(delete(RoutineItem))
        db.execute(delete(Habit))
        db.execute(delete(Task))
        db.execute(delete(Routine))
        db.execute(delete(Category))
        db.execute(delete(Setting))
        db.flush()

        # Restaurar Categorias
        for c in data.get("categories", []):
            db.add(Category(
                id=c["id"], name=c["name"], description=c.get("description"),
                color=c["color"], icon=c["icon"]
            ))
        db.flush()

        # Restaurar Hábitos
        for h in data.get("habits", []):
            db.add(Habit(
                id=h["id"], category_id=h.get("category_id"), name=h["name"],
                description=h.get("description"), icon=h["icon"], color=h["color"],
                habit_type=HabitType(h["habit_type"]), target_value=h["target_value"],
                unit=h.get("unit"), status=HabitStatus(h["status"]),
                start_date=date.fromisoformat(h["start_date"]),
                end_date=date.fromisoformat(h["end_date"]) if h.get("end_date") else None
            ))
        db.flush()

        # Restaurar Agendamentos
        for s in data.get("habit_schedules", []):
            db.add(HabitSchedule(
                id=s["id"], habit_id=s["habit_id"],
                frequency_type=FrequencyType(s["frequency_type"]),
                interval_value=s.get("interval_value"), weekdays=s.get("weekdays"),
                month_days=s.get("month_days"), times_per_period=s.get("times_per_period"),
                effective_from=date.fromisoformat(s["effective_from"]),
                effective_until=date.fromisoformat(s["effective_until"]) if s.get("effective_until") else None
            ))

        # Restaurar Logs
        for l in data.get("habit_logs", []):
            db.add(HabitLog(
                id=l["id"], habit_id=l["habit_id"],
                scheduled_date=date.fromisoformat(l["scheduled_date"]),
                value=l["value"], duration_seconds=l.get("duration_seconds"),
                status=LogStatus(l["status"]), notes=l.get("notes")
            ))

        # Restaurar Tarefas
        for t in data.get("tasks", []):
            db.add(Task(
                id=t["id"], category_id=t.get("category_id"), title=t["title"],
                description=t.get("description"), priority=TaskPriority(t["priority"]),
                status=TaskStatus(t["status"]),
                due_date=date.fromisoformat(t["due_date"]) if t.get("due_date") else None
            ))
        db.flush()

        # Restaurar Subtarefas
        for st in data.get("task_subtasks", []):
            db.add(TaskSubtask(
                id=st["id"], task_id=st["task_id"], title=st["title"],
                completed=st["completed"], position=st.get("position", 0)
            ))

        # Restaurar Rotinas
        for r in data.get("routines", []):
            db.add(Routine(
                id=r["id"], name=r["name"], description=r.get("description"),
                active=r["active"], days_of_week=r.get("days_of_week")
            ))
        db.flush()

        for ri in data.get("routine_items", []):
            db.add(RoutineItem(
                id=ri["id"], routine_id=ri["routine_id"], title=ri["title"],
                start_time=ri.get("start_time"), duration_minutes=ri.get("duration_minutes"),
                position=ri.get("position", 0)
            ))

        db.commit()

        return {
            "status": "success",
            "message": "Dados restaurados com sucesso",
            "records_restored": {
                "categories": len(data.get("categories", [])),
                "habits": len(data.get("habits", [])),
                "tasks": len(data.get("tasks", [])),
                "routines": len(data.get("routines", []))
            }
        }
