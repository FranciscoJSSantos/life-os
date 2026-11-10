# LifeOS - Script de Inicialização de Desenvolvimento
Write-Host "Iniciando LifeOS..." -ForegroundColor Cyan

# 1. Iniciar Backend em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

# 2. Iniciar Frontend nesta janela
cd frontend
npm start
