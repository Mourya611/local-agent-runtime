import os
from pathlib import Path
from dotenv import load_dotenv

# Find root .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    VERSION: str = "0.1.0"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "").strip()
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    DATA_DIR: Path = BASE_DIR / "data"
    RUNS_DIR: Path = BASE_DIR / "runs"
    SKILLS_DIR: Path = BASE_DIR / "skills"
    
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
