from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
# Import all models to ensure they are registered with Base metadata
import app.models # noqa: F401
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Criar tabelas se não existirem (inicialização do SQLite)
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="LifeOS — Personal Habit & Life Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "LifeOS API está em execução",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
