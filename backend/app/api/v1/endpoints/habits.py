from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.habit import HabitStatus
from app.schemas.habit import (
    HabitCreate, HabitRead, HabitUpdate,
    HabitTodayItem, HabitLogCreate, HabitLogRead
)
from app.services.habit_service import HabitService

router = APIRouter(prefix="/habits", tags=["Hábitos"])

@router.get("/today", response_model=list[HabitTodayItem], summary="Hábitos Previstos para o Dia")
def get_today_habits(
    target_date: date | None = Query(default=None, description="Data de referência (padrão: hoje)"),
    db: Session = Depends(get_db)
):
    return HabitService.get_today_habits(db, target_date)

@router.post("/{habit_id}/toggle", response_model=HabitTodayItem, summary="Alternar Conclusão do Hábito")
def toggle_habit(
    habit_id: str,
    target_date: date = Query(default_factory=date.today),
    value: float | None = Query(default=None),
    db: Session = Depends(get_db)
):
    try:
        return HabitService.toggle_or_add_log(db, habit_id, target_date, value)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("", response_model=list[HabitRead], summary="Listar Todos os Hábitos")
def list_habits(
    status_filter: HabitStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db)
):
    return HabitService.list_habits(db, status=status_filter)

@router.post("", response_model=HabitRead, status_code=status.HTTP_201_CREATED, summary="Criar Hábito")
def create_habit(habit_in: HabitCreate, db: Session = Depends(get_db)):
    return HabitService.create_habit(db, habit_in)

@router.get("/{habit_id}", response_model=HabitRead, summary="Detalhes do Hábito")
def get_habit(habit_id: str, db: Session = Depends(get_db)):
    habit = HabitService.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hábito não encontrado")
    return habit

@router.put("/{habit_id}", response_model=HabitRead, summary="Atualizar Hábito")
def update_habit(habit_id: str, habit_in: HabitUpdate, db: Session = Depends(get_db)):
    habit = HabitService.update_habit(db, habit_id, habit_in)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hábito não encontrado")
    return habit

@router.delete("/{habit_id}", response_model=HabitRead, summary="Arquivar Hábito")
def archive_habit(habit_id: str, db: Session = Depends(get_db)):
    habit = HabitService.update_habit(db, habit_id, HabitUpdate(status=HabitStatus.ARCHIVED))
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hábito não encontrado")
    return habit
