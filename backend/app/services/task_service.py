from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_, func
from app.models.task import Task, TaskSubtask, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskTodayItem

class TaskService:
    @staticmethod
    def create_task(db: Session, task_in: TaskCreate) -> Task:
        subtasks_data = task_in.subtasks
        task_data = task_in.model_dump(exclude={"subtasks"})

        task = Task(**task_data)
        db.add(task)
        db.flush()

        for idx, sub_in in enumerate(subtasks_data):
            subtask = TaskSubtask(
                task_id=task.id,
                title=sub_in.title,
                completed=sub_in.completed,
                position=idx
            )
            db.add(subtask)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def list_tasks(
        db: Session,
        status: TaskStatus | None = None,
        category_id: str | None = None
    ) -> list[Task]:
        query = select(Task).order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc())
        if status:
            query = query.where(Task.status == status)
        if category_id:
            query = query.where(Task.category_id == category_id)
        return list(db.scalars(query).all())

    @staticmethod
    def get_task(db: Session, task_id: str) -> Task | None:
        return db.get(Task, task_id)

    @staticmethod
    def update_task(db: Session, task_id: str, task_in: TaskUpdate) -> Task | None:
        task = db.get(Task, task_id)
        if not task:
            return None

        update_data = task_in.model_dump(exclude_unset=True)
        if "status" in update_data:
            if update_data["status"] == TaskStatus.COMPLETED and task.status != TaskStatus.COMPLETED:
                task.completed_at = datetime.now(timezone.utc)
            elif update_data["status"] != TaskStatus.COMPLETED:
                task.completed_at = None

        for key, value in update_data.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def toggle_task(db: Session, task_id: str) -> TaskTodayItem | None:
        task = db.get(Task, task_id)
        if not task:
            return None

        if task.status == TaskStatus.COMPLETED:
            task.status = TaskStatus.PENDING
            task.completed_at = None
        else:
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(task)

        category_name = task.category.name if task.category else "Geral"
        due_time_str = task.scheduled_at.strftime("%H:%M") if task.scheduled_at else None

        return TaskTodayItem(
            id=task.id,
            title=task.title,
            description=task.description,
            category=category_name,
            category_id=task.category_id,
            priority=task.priority,
            status=task.status,
            completed=task.status == TaskStatus.COMPLETED,
            due_date=task.due_date,
            due_time=due_time_str,
            subtasks_count=len(task.subtasks),
            subtasks_completed=sum(1 for s in task.subtasks if s.completed)
        )

    @staticmethod
    def get_today_tasks(db: Session, target_date: date | None = None) -> list[TaskTodayItem]:
        ref_date = target_date or date.today()

        # Tarefas que vencem hoje OU pendentes com prazo vencido OU pendentes sem prazo
        query = select(Task).where(
            or_(
                Task.due_date == ref_date,
                and_(Task.due_date < ref_date, Task.status != TaskStatus.COMPLETED),
                and_(Task.due_date.is_(None), Task.status != TaskStatus.COMPLETED),
                and_(
                    Task.status == TaskStatus.COMPLETED,
                    func.date(Task.completed_at) == ref_date
                )
            )
        ).order_by(
            Task.status.desc(),
            Task.priority.desc(),
            Task.scheduled_at.asc().nulls_last()
        )

        tasks = db.scalars(query).all()
        result: list[TaskTodayItem] = []

        for t in tasks:
            category_name = t.category.name if t.category else "Geral"
            due_time_str = t.scheduled_at.strftime("%H:%M") if t.scheduled_at else None

            result.append(
                TaskTodayItem(
                    id=t.id,
                    title=t.title,
                    description=t.description,
                    category=category_name,
                    category_id=t.category_id,
                    priority=t.priority,
                    status=t.status,
                    completed=t.status == TaskStatus.COMPLETED,
                    due_date=t.due_date,
                    due_time=due_time_str,
                    subtasks_count=len(t.subtasks),
                    subtasks_completed=sum(1 for s in t.subtasks if s.completed)
                )
            )

        return result

    @staticmethod
    def delete_task(db: Session, task_id: str) -> bool:
        task = db.get(Task, task_id)
        if not task:
            return False
        db.delete(task)
        db.commit()
        return True
