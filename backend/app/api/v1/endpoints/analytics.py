from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.analytics import HeatmapDay, CalendarMonthRead, AnalyticsOverview
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Analytics & Calendário"])

@router.get("/analytics/overview", response_model=AnalyticsOverview, summary="Visão Geral de Métricas")
def get_overview(db: Session = Depends(get_db)):
    return AnalyticsService.get_overview(db)

@router.get("/analytics/heatmap/{habit_id}", response_model=list[HeatmapDay], summary="Heatmap de Consistência do Hábito")
def get_heatmap(
    habit_id: str,
    year: int | None = Query(default=None, description="Ano do heatmap (padrão: ano atual)"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_habit_heatmap(db, habit_id, year)

@router.get("/calendar", response_model=CalendarMonthRead, summary="Dados Mensais do Calendário")
def get_calendar(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_calendar_month(db, year, month)
