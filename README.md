# LifeOS 🌟

> **Personal Habit & Life Management System**  
> Um clone local-first e customizável inspirado no **HabitNow**, desenvolvido para organização diária de hábitos, rotinas, tarefas, metas e indicadores pessoais.

---

## 🛠️ Stack Tecnológica

- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (PWA, Dark Theme HabitNow)
- **Backend:** [Python 3.12+ / FastAPI](https://fastapi.tiangolo.com/) (REST API modular por domínios)
- **Banco de Dados:** [SQLite 3](https://www.sqlite.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + [Alembic](https://alembic.sqlalchemy.org/)
- **Armazenamento:** Local-first em `data/lifeos.db`

---

## 📂 Estrutura do Projeto

```text
life_os/
├── frontend/             # Aplicação React 19 + Vite + Tailwind CSS (PWA)
├── backend/              # API FastAPI & Regras de Negócio
│   ├── app/
│   │   ├── api/v1/       # Endpoints REST
│   │   ├── core/         # Configurações globais
│   │   ├── database/     # Sessão SQLite e Base Declarativa
│   │   ├── models/       # Entidades SQLAlchemy (Habits, Tasks, etc.)
│   │   └── main.py       # Ponto de entrada FastAPI
│   ├── alembic/          # Migrações versionadas
│   └── tests/            # Testes com Pytest
├── data/                 # Banco SQLite local (lifeos.db)
├── backups/              # Exportações e backups
├── docs/                 # Documentação técnica e de produto
│   ├── PRD.md            # Requisitos e Visão do Produto
│   ├── ARCHITECTURE.md   # Arquitetura e Decisões Técnicas
│   └── DATABASE.md       # Modelagem e Dicionário de Dados
└── README.md
```

---

## 🚀 Como Executar

### 1. Backend (FastAPI)
```bash
cd backend
# Ativar o ambiente virtual (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Iniciar o servidor de desenvolvimento
uvicorn app.main:app --reload --port 8000
```
- API disponível em: `http://localhost:8000`
- Documentação interativa Swagger: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/v1/health`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
# ou
npm start
```
- Aplicação disponível em: `http://localhost:4200`

---

## 🧪 Testes Automatizados

### Backend:
```bash
cd backend
.\.venv\Scripts\pytest
```
