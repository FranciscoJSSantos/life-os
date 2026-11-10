from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.category import Category
from app.schemas.category import CategoryCreate

DEFAULT_CATEGORIES = [
    {"name": "Saúde", "color": "#10B981", "icon": "activity", "description": "Atividades físicas, sono e alimentação"},
    {"name": "Estudos", "color": "#6366F1", "icon": "book-open", "description": "Aprendizado e capacitação"},
    {"name": "Trabalho", "color": "#3B82F6", "icon": "briefcase", "description": "Foco e projetos profissionais"},
    {"name": "Finanças", "color": "#F59E0B", "icon": "dollar-sign", "description": "Controle financeiro e metas"},
    {"name": "Pessoal", "color": "#EC4899", "icon": "user", "description": "Autocuidado e bem-estar"},
]

class CategoryService:
    @staticmethod
    def get_or_create_defaults(db: Session) -> list[Category]:
        existing = db.scalars(select(Category)).all()
        if existing:
            return list(existing)

        created = []
        for cat in DEFAULT_CATEGORIES:
            db_cat = Category(**cat)
            db.add(db_cat)
            created.append(db_cat)
        db.commit()
        for cat in created:
            db.refresh(cat)
        return created

    @staticmethod
    def list_all(db: Session) -> list[Category]:
        categories = db.scalars(select(Category).order_by(Category.name)).all()
        if not categories:
            return CategoryService.get_or_create_defaults(db)
        return list(categories)

    @staticmethod
    def create(db: Session, category_in: CategoryCreate) -> Category:
        category = Category(**category_in.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
