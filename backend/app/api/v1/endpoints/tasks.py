from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate, TaskTodayItem
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tarefas"])

@router.get("/today", response_model=list[TaskTodayItem], summary="Tarefas do Dia")
def get_today_tasks(
    target_date: date | None = Query(default=None, description="Data de referência (padrão: hoje)"),
    db: Session = Depends(get_db)
):
    return TaskService.get_today_tasks(db, target_date)

@router.post("/{task_id}/toggle", response_model=TaskTodayItem, summary="Alternar Conclusão da Tarefa")
def toggle_task(task_id: str, db: Session = Depends(get_db)):
    updated = TaskService.toggle_task(db, task_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")
    return updated

@router.get("", response_model=list[TaskRead], summary="Listar Tarefas")
def list_tasks(
    status_filter: TaskStatus | None = Query(default=None, alias="status"),
    category_id: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    return TaskService.list_tasks(db, status=status_filter, category_id=category_id)

@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED, summary="Criar Tarefa")
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    return TaskService.create_task(db, task_in)

@router.get("/{task_id}", response_model=TaskRead, summary="Detalhes da Tarefa")
def get_task(task_id: str, db: Session = Depends(get_db)):
    task = TaskService.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")
    return task

@router.put("/{task_id}", response_model=TaskRead, summary="Atualizar Tarefa")
def update_task(task_id: str, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = TaskService.update_task(db, task_id, task_in)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Excluir Tarefa")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    deleted = TaskService.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")
    return None
