from datetime import date
from fastapi.testclient import TestClient
from app.main import app

def test_routines_auto_defaults():
    with TestClient(app) as client:
        res = client.get("/api/v1/routines")
        assert res.status_code == 200
        routines = res.json()
        assert len(routines) >= 2
        names = [r["name"] for r in routines]
        assert any("Rotina Matinal" in n for n in names)
        assert any("Rotina Noturna" in n for n in names)

def test_calendar_and_analytics():
    with TestClient(app) as client:
        # Overview
        overview_res = client.get("/api/v1/analytics/overview")
        assert overview_res.status_code == 200
        overview = overview_res.json()
        assert "total_habits" in overview
        assert "weekly_completion_rate" in overview

        # Calendar
        today = date.today()
        cal_res = client.get(f"/api/v1/calendar?year={today.year}&month={today.month}")
        assert cal_res.status_code == 200
        cal = cal_res.json()
        assert cal["year"] == today.year
        assert cal["month"] == today.month
        assert len(cal["days"]) >= 28
