from fastapi.testclient import TestClient
from app.main import app

def test_categories_auto_initialization():
    with TestClient(app) as client:
        response = client.get("/api/v1/categories")
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) >= 5
        names = [c["name"] for c in categories]
        assert "Saúde" in names
        assert "Estudos" in names

def test_create_and_toggle_habit():
    with TestClient(app) as client:
        # 1. Pegar categoria Saúde
        cat_res = client.get("/api/v1/categories")
        health_cat = next(c for c in cat_res.json() if c["name"] == "Saúde")

        # 2. Criar hábito diário
        payload = {
            "name": "Caminhada Matinal",
            "category_id": health_cat["id"],
            "habit_type": "BOOLEAN",
            "target_value": 1.0,
            "color": "#10B981",
            "icon": "footprints",
            "schedule": {
                "frequency_type": "DAILY"
            }
        }
        res = client.post("/api/v1/habits", json=payload)
        assert res.status_code == 201
        created = res.json()
        habit_id = created["id"]
        assert created["name"] == "Caminhada Matinal"

        # 3. Consultar hábitos de hoje
        today_res = client.get("/api/v1/habits/today")
        assert today_res.status_code == 200
        today_items = today_res.json()
        item = next(h for h in today_items if h["id"] == habit_id)
        assert item["completed"] is False
        assert item["streak"] == 0

        # 4. Alternar para concluído
        toggle_res = client.post(f"/api/v1/habits/{habit_id}/toggle")
        assert toggle_res.status_code == 200
        updated = toggle_res.json()
        assert updated["completed"] is True
        assert updated["streak"] == 1

        # 5. Desmarcar (toggle novamente)
        untoggle_res = client.post(f"/api/v1/habits/{habit_id}/toggle")
        assert untoggle_res.status_code == 200
        reverted = untoggle_res.json()
        assert reverted["completed"] is False
        assert reverted["streak"] == 0

        # 6. Limpar hábito de teste do banco
        from app.database.session import SessionLocal
        from app.models.habit import Habit
        with SessionLocal() as db:
            h = db.get(Habit, habit_id)
            if h:
                db.delete(h)
                db.commit()
