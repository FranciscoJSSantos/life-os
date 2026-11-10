from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.category import CategoryRead, CategoryCreate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categorias"])

@router.get("", response_model=list[CategoryRead], summary="Listar Categorias")
def get_categories(db: Session = Depends(get_db)):
    return CategoryService.list_all(db)

@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED, summary="Criar Categoria")
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService.create(db, category_in)
