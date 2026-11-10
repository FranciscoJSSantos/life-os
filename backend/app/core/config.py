from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Diretórios base
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "LifeOS"
    API_V1_STR: str = "/api/v1"
    DATABASE_PATH: Path = DATA_DIR / "lifeos.db"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"sqlite:///{self.DATABASE_PATH.as_posix()}"
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
