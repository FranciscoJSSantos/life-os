from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.routine import RoutineCreate, RoutineRead, RoutineUpdate
from app.services.routine_service import RoutineService

router = APIRouter(prefix="/routines", tags=["Rotinas"])

@router.get("", response_model=list[RoutineRead], summary="Listar Rotinas")
def list_routines(
    active_only: bool = Query(default=False),
    db: Session = Depends(get_db)
):
    return RoutineService.list_routines(db, active_only=active_only)

@router.post("", response_model=RoutineRead, status_code=status.HTTP_201_CREATED, summary="Criar Rotina")
def create_routine(routine_in: RoutineCreate, db: Session = Depends(get_db)):
    return RoutineService.create_routine(db, routine_in)

@router.get("/{routine_id}", response_model=RoutineRead, summary="Detalhes da Rotina")
def get_routine(routine_id: str, db: Session = Depends(get_db)):
    routine = RoutineService.get_routine(db, routine_id)
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rotina não encontrada")
    return routine

@router.put("/{routine_id}", response_model=RoutineRead, summary="Atualizar Rotina")
def update_routine(routine_id: str, routine_in: RoutineUpdate, db: Session = Depends(get_db)):
    routine = RoutineService.update_routine(db, routine_id, routine_in)
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rotina não encontrada")
    return routine

@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Excluir Rotina")
def delete_routine(routine_id: str, db: Session = Depends(get_db)):
    deleted = RoutineService.delete_routine(db, routine_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rotina não encontrada")
    return None
