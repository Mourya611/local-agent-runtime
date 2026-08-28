import json
import asyncio
import logging
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel
from google import genai
from backend.app.config import settings
from backend.app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

MODELS_TO_TRY = [
    "gemini-3.6-flash"
]

class GeminiProvider(LLMProvider):
    """Google Gemini LLM Provider implementation using google.genai Client with fast fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    @property
    def name(self) -> str:
        return "gemini"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        if not self.client:
            raise ValueError("Gemini API Key is missing. Please configure GEMINI_API_KEY in .env.")

        contents = []
        if system_prompt:
            contents.append(f"System Instructions:\n{system_prompt}\n\nUser Prompt:\n{prompt}")
        else:
            contents.append(prompt)

        last_error = None
        for model in MODELS_TO_TRY:
            try:
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=model,
                    contents=contents
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Gemini API call failed for model {model}: {e}")

        raise RuntimeError(f"Failed to generate text using Gemini models. Last error: {last_error}")

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        format_instruction = (
            f"\n\nIMPORTANT: Respond ONLY with a valid JSON object adhering strictly to this JSON Schema:\n"
            f"```json\n{schema_json}\n```\nDo NOT include markdown backticks or explanations outside the JSON."
        )

        full_prompt = prompt + format_instruction
        raw_text = await self.generate(full_prompt, system_prompt=system_prompt, temperature=temperature)
        
        # Clean text formatting if wrapped in code blocks
        clean_text = raw_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            parsed = json.loads(clean_text)
            return parsed
        except json.JSONDecodeError as err:
            logger.error(f"Failed to parse structured JSON from Gemini output: {raw_text}")
            start_idx = clean_text.find("{")
            end_idx = clean_text.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                try:
                    return json.loads(clean_text[start_idx:end_idx+1])
                except Exception:
                    pass
            raise ValueError(f"Gemini output is not valid JSON matching schema: {err}")
