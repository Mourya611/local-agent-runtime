import pytest
from backend.app.config import settings
from backend.app.llm.router import LLMRouter

def test_llm_router_initialization():
    router = LLMRouter()
    if settings.is_gemini_configured:
        provider = router.get_provider("planning")
        assert provider.name == "gemini"
