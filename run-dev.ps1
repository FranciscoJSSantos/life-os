# LifeOS - Script de Inicialização de Desenvolvimento (FastAPI + React Vite)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  LifeOS - HabitNow Local-First PWA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Iniciando Backend (FastAPI :8000) e Frontend (React Vite :4200)..." -ForegroundColor Yellow

# 1. Iniciar Backend em nova janela de PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

# 2. Iniciar Frontend React nesta janela
Set-Location frontend
npm run dev
