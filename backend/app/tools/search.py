import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from tavily import TavilyClient
from backend.app.config import settings

logger = logging.getLogger(__name__)

class SearchProvider(ABC):
    """Abstract search provider interface."""

    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Executes search query and returns structured list of sources."""
        pass

class TavilySearchProvider(SearchProvider):
    """Tavily web search provider implementation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TAVILY_API_KEY
        if self.api_key:
            self.client = TavilyClient(api_key=self.api_key)
        else:
            self.client = None

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        if not self.client:
            raise ValueError("Tavily API key is missing. Please configure TAVILY_API_KEY in your .env file.")

        try:
            logger.info(f"Executing Tavily search for query: '{query}'")
            # Tavily synchronous SDK call wrapped in async executor or direct call
            response = self.client.search(query=query, max_results=max_results, search_depth="advanced")
            
            results = []
            for item in response.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "content": item.get("content", ""),
                    "score": item.get("score", 0.0),
                    "raw_content": item.get("raw_content", None)
                })
            return results
        except Exception as e:
            logger.error(f"Tavily search failed for query '{query}': {e}")
            raise e
