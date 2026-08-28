import logging
from typing import Dict, Optional, Type, Any
from pydantic import BaseModel
from backend.app.config import settings
from backend.app.llm.base import LLMProvider
from backend.app.llm.gemini import GeminiProvider
from backend.app.llm.groq import GroqProvider

logger = logging.getLogger(__name__)

class LLMRouter:
    """Intelligent Router selecting the optimal LLM provider based on task context."""

    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {}
        
        # Instantiate available providers
        if settings.is_gemini_configured:
            self.providers["gemini"] = GeminiProvider()
        if settings.is_groq_configured:
            self.providers["groq"] = GroqProvider()
            
    def get_provider(self, task_type: str = "general") -> LLMProvider:
        """Selects provider for given task type with graceful fallbacks."""
        if not self.providers:
            raise ValueError(
                "No LLM providers are configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your .env file."
            )

        # Provider routing rules
        if task_type in ["fast_classification", "simple_extraction"]:
            if "groq" in self.providers:
                return self.providers["groq"]
        
        # Primary reasoning provider: Gemini
        if "gemini" in self.providers:
            return self.providers["gemini"]
            
        # Fallback to any active provider
        return list(self.providers.values())[0]

    async def generate(
        self,
        prompt: str,
        task_type: str = "general",
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        provider = self.get_provider(task_type)
        try:
            return await provider.generate(prompt, system_prompt=system_prompt, temperature=temperature)
        except Exception as e:
            logger.warning(f"Primary provider {provider.name} failed for task {task_type}: {e}")
            # Try fallback provider if available
            for fallback_name, fallback_provider in self.providers.items():
                if fallback_name != provider.name:
                    logger.info(f"Attempting fallback to {fallback_name}...")
                    return await fallback_provider.generate(prompt, system_prompt=system_prompt, temperature=temperature)
            raise e

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        task_type: str = "general",
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        provider = self.get_provider(task_type)
        try:
            return await provider.generate_structured(prompt, schema=schema, system_prompt=system_prompt, temperature=temperature)
        except Exception as e:
            logger.warning(f"Primary provider {provider.name} failed structured output for task {task_type}: {e}")
            for fallback_name, fallback_provider in self.providers.items():
                if fallback_name != provider.name:
                    logger.info(f"Attempting structured fallback to {fallback_name}...")
                    return await fallback_provider.generate_structured(prompt, schema=schema, system_prompt=system_prompt, temperature=temperature)
            raise e

llm_router = LLMRouter()
