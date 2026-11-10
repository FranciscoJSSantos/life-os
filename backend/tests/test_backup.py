from fastapi.testclient import TestClient
from app.main import app

def test_backup_export_and_import():
    with TestClient(app) as client:
        # 1. Exportar backup
        export_res = client.get("/api/v1/backup/export")
        assert export_res.status_code == 200
        backup_data = export_res.json()
        assert backup_data["version"] == "1.0"
        assert "data" in backup_data
        assert "categories" in backup_data["data"]
        assert "habits" in backup_data["data"]

        # 2. Restaurar backup
        import_res = client.post("/api/v1/backup/import", json=backup_data)
        assert import_res.status_code == 200
        result = import_res.json()
        assert result["status"] == "success"
        assert "records_restored" in result
