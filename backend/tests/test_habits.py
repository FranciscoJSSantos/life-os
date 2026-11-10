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

        # 6. Atualizar hábito
        edit_res = client.put(f"/api/v1/habits/{habit_id}", json={"name": "Caminhada Rápida", "target_value": 2.0})
        assert edit_res.status_code == 200
        assert edit_res.json()["name"] == "Caminhada Rápida"

        # 7. Toggle com observação / notas
        toggle_note_res = client.post(f"/api/v1/habits/{habit_id}/toggle?notes=Senti%20bastante%20energia")
        assert toggle_note_res.status_code == 200
        assert toggle_note_res.json()["completed"] is True
        assert toggle_note_res.json()["notes"] == "Senti bastante energia"

        # 8. Excluir hábito
        del_res = client.delete(f"/api/v1/habits/{habit_id}?hard_delete=true")
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True

def test_challenges_crud_and_accuracy():
    with TestClient(app) as client:
        # Obter hábitos
        today_res = client.get("/api/v1/habits/today")
        assert today_res.status_code == 200
        habits = today_res.json()
        assert len(habits) >= 2
        habit_ids = [habits[0]["id"], habits[1]["id"]]

        # Criar desafio
        ch_payload = {
            "name": "Desafio de Teste",
            "duration_days": 30,
            "target_accuracy": 85.0,
            "habit_ids": habit_ids
        }
        create_res = client.post("/api/v1/challenges", json=ch_payload)
        assert create_res.status_code == 201
        ch_data = create_res.json()
        ch_id = ch_data["id"]
        assert ch_data["name"] == "Desafio de Teste"

        # Atualizar desafio
        update_res = client.put(f"/api/v1/challenges/{ch_id}", json={
            "name": "Desafio de Teste Editado",
            "duration_days": 45,
            "habit_ids": [habit_ids[0]]
        })
        assert update_res.status_code == 200
        assert update_res.json()["name"] == "Desafio de Teste Editado"

        # Excluir desafio
        del_ch_res = client.delete(f"/api/v1/challenges/{ch_id}")
        assert del_ch_res.status_code == 204

        # Testar deletar hábito associado a desafio
        new_ch = client.post("/api/v1/challenges", json={
            "name": "Desafio Temporario",
            "duration_days": 10,
            "target_accuracy": 80.0,
            "habit_ids": [habit_ids[0]]
        }).json()
        
        # Deletar hábito com hard_delete
        # Primeiro criamos um hábito novo e associamos ao desafio
        h_temp = client.post("/api/v1/habits", json={
            "name": "Habito Para Exclusao",
            "habit_type": "BOOLEAN",
            "target_value": 1.0
        }).json()
        client.put(f"/api/v1/challenges/{new_ch['id']}", json={
            "habit_ids": [h_temp["id"]]
        })
        del_h_res = client.delete(f"/api/v1/habits/{h_temp['id']}?hard_delete=true")
        assert del_h_res.status_code == 200
        client.delete(f"/api/v1/challenges/{new_ch['id']}")

def test_habit_multi_periods_and_partial_completion():
    with TestClient(app) as client:
        # Criar hábito com períodos Manhã e Noite
        payload = {
            "name": "Soro Teste Periodos",
            "habit_type": "NUMERIC",
            "target_value": 2.0,
            "unit": "doses",
            "periods": "Manhã,Noite"
        }
        create_res = client.post("/api/v1/habits", json=payload)
        assert create_res.status_code == 201
        h_id = create_res.json()["id"]

        # Marcar apenas Manhã (50% do dia)
        toggle_m = client.post(f"/api/v1/habits/{h_id}/toggle?period=Manhã&notes=Dose%20ok")
        assert toggle_m.status_code == 200
        data_m = toggle_m.json()
        assert data_m["completed"] is False
        assert data_m["is_partial"] is True
        assert data_m["completion_rate"] == 50.0
        assert data_m["current_value"] == 1.0

        # Marcar Noite (100% do dia)
        toggle_n = client.post(f"/api/v1/habits/{h_id}/toggle?period=Noite")
        assert toggle_n.status_code == 200
        data_n = toggle_n.json()
        assert data_n["completed"] is True
        assert data_n["is_partial"] is False
        assert data_n["completion_rate"] == 100.0
        assert data_n["current_value"] == 2.0

        # Limpar hábito de teste
        client.delete(f"/api/v1/habits/{h_id}?hard_delete=true")
