import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

# Prioritize parent .env (Laravel .env) if present, else local .env
parent_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if parent_env.exists():
    load_dotenv(parent_env)
else:
    load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Disputatio AI Engine"
    API_V1_STR: str = "/api/v1"
    INTERNAL_SERVICE_KEY: str = os.getenv("INTERNAL_SERVICE_KEY", "disputatio-secret-internal-token-2026")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
    FALLBACK_MODEL: str = "gemini-3-flash-preview"

    class Config:
        case_sensitive = True

settings = Settings()
