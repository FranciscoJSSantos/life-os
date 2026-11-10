from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.backup_service import BackupService

router = APIRouter(prefix="/backup", tags=["Backup & Restauração"])

@router.get("/export", summary="Exportar Backup Completo em JSON")
def export_backup(db: Session = Depends(get_db)):
    return BackupService.export_data(db)

@router.post("/import", summary="Restaurar Banco de Dados via JSON")
def import_backup(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    try:
        return BackupService.import_data(db, payload)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao restaurar backup: {str(e)}")
