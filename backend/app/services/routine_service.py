from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.routine import Routine, RoutineItem
from app.schemas.routine import RoutineCreate, RoutineUpdate, RoutineItemCreate

DEFAULT_ROUTINES = [
    {
        "name": "Rotina Matinal ☀️",
        "description": "Ativação do corpo, mente e planejamento do dia",
        "days_of_week": "0,1,2,3,4,5,6",
        "items": [
            {"title": "Beber 500ml de água", "start_time": "06:30", "duration_minutes": 5, "position": 0},
            {"title": "Alongamento ou exercício leve", "start_time": "06:40", "duration_minutes": 20, "position": 1},
            {"title": "Banho e café da manhã", "start_time": "07:00", "duration_minutes": 30, "position": 2},
            {"title": "Revisar tarefas do dia no LifeOS", "start_time": "07:30", "duration_minutes": 10, "position": 3}
        ]
    },
    {
        "name": "Rotina Noturna 🌙",
        "description": "Desaceleração e preparação para o sono reparador",
        "days_of_week": "0,1,2,3,4,5,6",
        "items": [
            {"title": "Desconectar telas e celular", "start_time": "21:30", "duration_minutes": 10, "position": 0},
            {"title": "Leitura de livro", "start_time": "21:40", "duration_minutes": 30, "position": 1},
            {"title": "Higiene e relaxamento", "start_time": "22:10", "duration_minutes": 15, "position": 2}
        ]
    }
]

class RoutineService:
    @staticmethod
    def get_or_create_defaults(db: Session) -> list[Routine]:
        existing = db.scalars(select(Routine)).all()
        if existing:
            return list(existing)

        created = []
        for r_data in DEFAULT_ROUTINES:
            items_data = r_data["items"]
            routine = Routine(
                name=r_data["name"],
                description=r_data["description"],
                days_of_week=r_data["days_of_week"],
                active=True
            )
            db.add(routine)
            db.flush()

            for item in items_data:
                db_item = RoutineItem(routine_id=routine.id, **item)
                db.add(db_item)

            created.append(routine)

        db.commit()
        for r in created:
            db.refresh(r)
        return created

    @staticmethod
    def list_routines(db: Session, active_only: bool = False) -> list[Routine]:
        query = select(Routine).order_by(Routine.created_at.asc())
        if active_only:
            query = query.where(Routine.active == True)
        routines = list(db.scalars(query).all())
        if not routines:
            return RoutineService.get_or_create_defaults(db)
        return routines

    @staticmethod
    def create_routine(db: Session, routine_in: RoutineCreate) -> Routine:
        items_data = routine_in.items
        routine_data = routine_in.model_dump(exclude={"items"})

        routine = Routine(**routine_data)
        db.add(routine)
        db.flush()

        for idx, item_in in enumerate(items_data):
            item = RoutineItem(
                routine_id=routine.id,
                position=idx,
                **item_in.model_dump(exclude={"position"})
            )
            db.add(item)

        db.commit()
        db.refresh(routine)
        return routine

    @staticmethod
    def get_routine(db: Session, routine_id: str) -> Routine | None:
        return db.get(Routine, routine_id)

    @staticmethod
    def update_routine(db: Session, routine_id: str, routine_in: RoutineUpdate) -> Routine | None:
        routine = db.get(Routine, routine_id)
        if not routine:
            return None

        update_data = routine_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(routine, key, value)

        db.commit()
        db.refresh(routine)
        return routine

    @staticmethod
    def delete_routine(db: Session, routine_id: str) -> bool:
        routine = db.get(Routine, routine_id)
        if not routine:
            return False
        db.delete(routine)
        db.commit()
        return True
