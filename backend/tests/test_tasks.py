from datetime import date
from fastapi.testclient import TestClient
from app.main import app

def test_create_and_toggle_task():
    with TestClient(app) as client:
        # 1. Obter categoria
        cat_res = client.get("/api/v1/categories")
        categories = cat_res.json()
        work_cat = next(c for c in categories if c["name"] == "Trabalho")

        # 2. Criar tarefa com prioridade ALTA
        payload = {
            "title": "Enviar relatório semanal",
            "category_id": work_cat["id"],
            "priority": "HIGH",
            "due_date": date.today().isoformat(),
            "subtasks": [
                {"title": "Coletar métricas", "completed": False},
                {"title": "Revisar texto", "completed": False}
            ]
        }
        res = client.post("/api/v1/tasks", json=payload)
        assert res.status_code == 201
        created = res.json()
        task_id = created["id"]
        assert created["title"] == "Enviar relatório semanal"
        assert len(created["subtasks"]) == 2

        # 3. Listar tarefas do dia
        today_res = client.get("/api/v1/tasks/today")
        assert today_res.status_code == 200
        today_tasks = today_res.json()
        found = next(t for t in today_tasks if t["id"] == task_id)
        assert found["completed"] is False
        assert found["priority"] == "HIGH"

        # 4. Alternar conclusão
        toggle_res = client.post(f"/api/v1/tasks/{task_id}/toggle")
        assert toggle_res.status_code == 200
        updated = toggle_res.json()
        assert updated["completed"] is True
        assert updated["status"] == "COMPLETED"

        # 5. Alternar de volta para pendente
        untoggle_res = client.post(f"/api/v1/tasks/{task_id}/toggle")
        assert untoggle_res.status_code == 200
        reverted = untoggle_res.json()
        assert reverted["completed"] is False
        assert reverted["status"] == "PENDING"
