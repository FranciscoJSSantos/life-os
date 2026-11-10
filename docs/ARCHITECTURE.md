# LifeOS — Arquitetura de Software

**Versão:** 1.0  
**Stack Principal:** Angular 19+ (Frontend PWA) + Python FastAPI (Backend REST) + SQLite (Banco Local)

---

## 1. Visão Arquitetural

```
+-----------------------------------------------------------+
|                     Client (PWA)                         |
|  - Angular (TypeScript, Standalone Components, Signals)   |
|  - Service Worker (Offline Caching / Background Sync)     |
|  - Tailwind CSS / Lucide Icons / Charting Engine          |
+-----------------------------+-----------------------------+
                              | REST API (HTTP / JSON)
                              v
+-----------------------------------------------------------+
|                  Backend API (FastAPI)                    |
|  - Python 3.12+ / FastAPI / Pydantic v2                   |
|  - Camada de Domínio & Serviços de Regras de Negócio      |
|  - SQLAlchemy 2.0 ORM / Alembic Migrations                |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|                   Storage / Persistência                  |
|  - SQLite (Arquivo Local: data/lifeos.db)                |
|  - Diretório de Backups (backups/*.json)                  |
+-----------------------------------------------------------+
```

---

## 2. Estrutura do Monorepo

```text
life_os/
├── frontend/                # Aplicação Angular (PWA)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Serviços globais, interceptors, guards
│   │   │   ├── shared/      # Componentes UI reutilizáveis, pipes, diretivas
│   │   │   ├── features/    # Módulos funcionais (dashboard, habits, tasks, etc.)
│   │   │   └── app.routes.ts
│   │   └── manifest.webmanifest
│   ├── angular.json
│   └── package.json
│
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/v1/          # Routers e endpoints
│   │   ├── core/            # Configurações globais, segurança, logs
│   │   ├── database/        # Conexão SQLite e sessão SQLAlchemy
│   │   ├── models/          # Entidades SQLAlchemy ORM
│   │   ├── schemas/         # Modelos Pydantic (Input/Output)
│   │   ├── repositories/    # Acesso a dados
│   │   ├── services/        # Regras de negócio (recorrência, streaks, etc.)
│   │   └── main.py          # Entrypoint da aplicação
│   ├── alembic/             # Migrações versionadas
│   ├── requirements.txt
│   └── alembic.ini
│
├── data/                    # Banco SQLite local
│   └── lifeos.db
├── backups/                 # Backups gerados (JSON/CSV)
├── docs/                    # Documentações técnicas e PRD
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
└── README.md
```

---

## 3. Diretrizes Técnicas

### 3.1 Backend
- **FastAPI:** Rotas estruturadas com injeção de dependência (`Depends`) para sessões de banco e serviços.
- **SQLAlchemy 2.0:** Uso do padrão declarativo moderno (`Mapped[...]`, `mapped_column[...]`).
- **Alembic:** Qualquer alteração no schema precisa de script de migração.
- **Regras de Negócio Isoladas:** O cálculo de dias previstos, streaks e taxas de conclusão fica no `services/`, nunca nos controllers/routers ou no banco.

### 3.2 Frontend
- **Angular 19+:** Utilização de Standalone Components, Control Flow moderno (`@if`, `@for`), e Angular Signals para reatividade de estado.
- **Design System:** Inspirado no HabitNow com tema escuro elegante, paleta de cores para categorias e ícones claros.
- **PWA:** Habilitado com service worker para carga instantânea e funcionamento local.
