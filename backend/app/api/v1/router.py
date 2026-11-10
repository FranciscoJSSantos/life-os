from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.database.session import get_db
from app.models.category import Category
from app.models.habit import Habit
from app.models.task import Task
from app.models.routine import Routine
from app.api.v1.endpoints import categories, habits, tasks, routines, analytics

api_router = APIRouter()

@api_router.get("/health", summary="Status do Sistema")
def health_check(db: Session = Depends(get_db)):
    total_habits = db.scalar(select(func.count(Habit.id))) or 0
    total_tasks = db.scalar(select(func.count(Task.id))) or 0
    total_categories = db.scalar(select(func.count(Category.id))) or 0
    total_routines = db.scalar(select(func.count(Routine.id))) or 0
    
    return {
        "status": "healthy",
        "app": "LifeOS API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": "connected",
            "counts": {
                "categories": total_categories,
                "habits": total_habits,
                "tasks": total_tasks,
                "routines": total_routines
            }
        }
    }

api_router.include_router(categories.router)
api_router.include_router(habits.router)
api_router.include_router(tasks.router)
api_router.include_router(routines.router)
api_router.include_router(analytics.router)
