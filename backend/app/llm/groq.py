import json
import logging
import httpx
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel
from backend.app.config import settings
from backend.app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768"
]

class GroqProvider(LLMProvider):
    """Groq LLM Provider implementation for fast extraction & classification."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    @property
    def name(self) -> str:
        return "groq"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        if not self.api_key:
            raise ValueError("Groq API Key is missing. Please configure GROQ_API_KEY in .env.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        last_error = None
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            for model in GROQ_MODELS:
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 2048
                }
                try:
                    response = await client.post(self.base_url, json=payload, headers=headers)
                    if response.status_code == 200:
                        data = response.json()
                        return data["choices"][0]["message"]["content"].strip()
                    else:
                        last_error = f"HTTP {response.status_code}: {response.text}"
                except Exception as e:
                    last_error = str(e)
                    logger.warning(f"Groq API error with model {model}: {e}")

        raise RuntimeError(f"Failed to generate using Groq: {last_error}")

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        format_instruction = (
            f"\n\nRespond ONLY with a valid JSON object adhering strictly to this JSON Schema:\n"
            f"```json\n{schema_json}\n```"
        )
        raw = await self.generate(prompt + format_instruction, system_prompt=system_prompt, temperature=temperature)
        
        clean = raw.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()
        
        return json.loads(clean)
