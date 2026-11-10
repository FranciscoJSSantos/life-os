# 🌟 LifeOS — Personal Habit, Health & Routine Management System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-Local--First-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

> **LifeOS** é um sistema completo, local-first e personalizável de produtividade, saúde e rotinas diárias, inspirado na ergonomia do **HabitNow**, otimizado para acompanhamento rigoroso de hábitos, tratamentos médicos (soros e medicamentos), notas clínicas de sintomas e protocolos de longo prazo com inteligência artificial integrada.

---

## ✨ Principais Funcionalidades

### 🩺 Protocolos Médicos & Hábitos com Múltiplos Turnos
- **Eventos no Dia (Manhã & Noite):** Gerencie hábitos que exigem mais de uma dose/aplicação ao longo do dia em uma única entidade consolidada.
- **Conclusão Parcial (50% Âmbar):** Se você realizar apenas a dose da manhã e a noite estiver pendente, o sistema destaca visualmente o status parcial de **50%** com alertas em amarelo/âmbar tanto no painel quanto no calendário.
- **Acompanhamento de Sintomas & Reações:** Registre observações de saúde, sintomas ou reações da aplicação dose a dose.

### 🏆 Desafios & Protocolos de Longo Prazo (90 Dias)
- **Cálculo Real de Acurácia:** Meça a taxa de adesão exata em relação às doses esperadas e realizadas.
- **Métricas Clínicas:** Contadores de dias 100% perfeitos, dias decorridos, dias restantes e previsão de alcance da meta.
- **Edição & Gestão Flexível:** Ajuste metas, prazos e hábitos vinculados a qualquer momento.

### 🤖 Resumos Clínicos & Relatórios de Evolução com IA
- **Auditoria de Tratamento com IA:** Gera relatórios compilados detalhando data de início, média de adesão, dias perfeitos e análise da evolução das notas de sintomas e queixas.
- **Suporte Multi-Provider:** Utilize sua própria chave de API do **Google Gemini** ou **OpenAI**, ou usufrua da **análise diagnóstica local heurística** mesmo sem chave de API.

### 📅 Calendário Interativo & Histórico Diário
- **Navegação no Tempo:** Selecione qualquer dia do mês para verificar o status e taxa de cumprimento.
- **Check + Obs Retroativo:** Dê check, desmarque e edite notas de sintomas de qualquer dia passado com atualização instantânea no grid mensal.

### 🔒 Privacidade Absoluta (Local-First)
- **Zero Cloud Lock-in:** Todos os seus hábitos, tarefas e anotações pessoais são armazenados localmente em um banco SQLite (`data/lifeos.db`).
- **Segurança Total:** Nenhum dado médico ou pessoal é enviado para a nuvem sem o seu consentimento explícito.
- **Backups JSON:** Exportação e restauração completa de dados em um clique.

---

## 🏗️ Arquitetura do Projeto

```text
life_os/
├── backend/                  # API REST em FastAPI e Regras de Negócio
│   ├── app/
│   │   ├── api/v1/           # Endpoints versionados (Habits, Challenges, Tasks, Analytics, etc.)
│   │   ├── core/             # Configurações globais e CORS
│   │   ├── database/         # Engine SQLite e Sessão Declarativa
│   │   ├── models/           # Modelos SQLAlchemy (Habit, HabitLog, Challenge, Task, Routine)
│   │   ├── schemas/          # Schemas Pydantic tipados de validação e serialização
│   │   ├── services/         # Lógica de negócio, estatísticas e integração de IA
│   │   └── main.py           # Ponto de entrada da aplicação
│   ├── tests/                # Suíte de testes automatizados com Pytest (9 testes)
│   ├── requirements.txt      # Dependências Python
│   └── alembic/              # Versionamento e migrações de banco
├── frontend/                 # Interface Web Moderna (React 19 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── api/              # Cliente HTTP tipado com fetch
│   │   ├── components/       # Componentes reutilizáveis (Sidebar, BottomNav, QuickAddModal)
│   │   ├── views/            # Visões (Dashboard, Habits, Challenges, Calendar, Analytics, Settings)
│   │   ├── App.tsx           # Layout principal e gerenciamento de estado
│   │   └── main.tsx          # Ponto de montagem React 19
│   └── package.json          # Dependências do frontend
├── docs/                     # Documentação técnica e especificações (PRD, Arquitetura, Banco)
├── data/                     # Diretório do banco de dados local SQLite (ignorado no Git)
├── backups/                  # Diretório de exportações de backup (ignorado no Git)
└── run-dev.ps1               # Script PowerShell para inicialização simultânea em 1 clique
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Python 3.12+** instalado.
- **Node.js 20+** e **npm** instalados.

---

### Opção 1: Inicialização em 1 Clique (PowerShell)

Você pode iniciar o Backend e o Frontend simultaneamente executando:
```powershell
.\run-dev.ps1
```

---

### Opção 2: Inicialização Manual

#### 1. Backend (FastAPI)
```powershell
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor FastAPI
uvicorn app.main:app --reload --port 8000
```
- **API Backend:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
- **Healthcheck:** `http://localhost:8000/api/v1/health`

#### 2. Frontend (React 19 + Vite)
Em um novo terminal:
```powershell
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```
- **Aplicação Web:** `http://localhost:4200`

---

## 🧪 Testes Automatizados

O backend conta com uma suíte de testes completa cobrindo integridade de categorias, hábitos, tarefas, rotinas, backups, desafios e cálculos de múltiplos períodos diários:

```powershell
cd backend
.\.venv\Scripts\pytest
```

---

## 🛡️ Segurança e Variáveis de Ambiente

- **Banco de Dados Local:** O arquivo `data/lifeos.db` é protegido pelo `.gitignore` para assegurar que nenhum registro pessoal seja versionado publicamente.
- **Chaves de API de IA:** Chaves do Gemini ou OpenAI são salvas apenas localmente no `localStorage` do seu navegador ou passadas via payload efêmero, nunca armazenadas em texto puro no repositório.
- **Arquivo de Configuração:** Consulte `backend/.env.example` para referências de variáveis de ambiente configuráveis.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais detalhes.
