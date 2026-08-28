import os
from pathlib import Path
from dotenv import load_dotenv

# Find root .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    VERSION: str = "0.1.0"
    AGENT_MODE: str = os.getenv("AGENT_MODE", "local").lower().strip()
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "").strip()
    
    HOST: str = os.getenv("HOST", "0.0.0.0" if os.getenv("PORT") else "127.0.0.1")
    PORT: int = int(os.getenv("PORT", os.getenv("BACKEND_PORT", "8000")))
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000").strip()
    
    # Public Demo Execution Budgets & Safety Limits
    MAX_TASK_DURATION_SECONDS: int = int(os.getenv("MAX_TASK_DURATION_SECONDS", "120"))
    MAX_TOOL_CALLS_PER_TASK: int = int(os.getenv("MAX_TOOL_CALLS_PER_TASK", "20"))
    MAX_SEARCHES_PER_TASK: int = int(os.getenv("MAX_SEARCHES_PER_TASK", "8"))
    MAX_LLM_CALLS_PER_TASK: int = int(os.getenv("MAX_LLM_CALLS_PER_TASK", "10"))
    MAX_CONCURRENT_PUBLIC_TASKS: int = int(os.getenv("MAX_CONCURRENT_PUBLIC_TASKS", "3"))
    RATE_LIMIT_REQUESTS_PER_MIN: int = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MIN", "5"))
    PUBLIC_ARTIFACT_RETENTION_HOURS: int = int(os.getenv("PUBLIC_ARTIFACT_RETENTION_HOURS", "24"))
    
    DATA_DIR: Path = BASE_DIR / "data"
    RUNS_DIR: Path = BASE_DIR / "runs"
    SKILLS_DIR: Path = BASE_DIR / "skills"
    
    @property
    def is_public_mode(self) -> bool:
        return self.AGENT_MODE == "public"
    
    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY)
        
    @property
    def is_groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY)
        
    @property
    def is_tavily_configured(self) -> bool:
        return bool(self.TAVILY_API_KEY)

    def get_provider_status(self) -> dict:
        """Returns provider configuration status without revealing secrets."""
        return {
            "gemini": {
                "name": "Google Gemini",
                "configured": self.is_gemini_configured
            },
            "groq": {
                "name": "Groq",
                "configured": self.is_groq_configured
            },
            "tavily": {
                "name": "Tavily Search",
                "configured": self.is_tavily_configured
            }
        }

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.RUNS_DIR.mkdir(parents=True, exist_ok=True)
settings.SKILLS_DIR.mkdir(parents=True, exist_ok=True)
