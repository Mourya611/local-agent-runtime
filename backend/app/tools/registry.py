import logging
from typing import Any, Callable, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

TOOL_ALIASES = {
    "search": "web_search",
    "search_web": "web_search",
    "tavily_search": "web_search",
    "google_search": "web_search",
    "linkedin_search": "web_search",
    "find": "web_search",
    
    "navigate": "browser_navigate",
    "open_url": "browser_navigate",
    "open_website": "browser_navigate",
    "go_to": "browser_navigate",
    "go_to_url": "browser_navigate",
    "browser_open": "browser_navigate",
    "visit": "browser_navigate",
    
    "click": "browser_click",
    "type": "browser_type",
    "fill": "browser_type",
    "scroll": "browser_scroll",
    "screenshot": "browser_screenshot",
    "extract": "browser_extract"
}

class ToolDefinition(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    permission_level: str  # allowed, confirmation, denied
    func: Callable

class ToolRegistry:
    """Central registry for agent tools with schema validation and tool aliases."""

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        input_schema: Dict[str, Any],
        output_schema: Dict[str, Any],
        permission_level: str,
        func: Callable
    ):
        tool_def = ToolDefinition(
            name=name,
            description=description,
            input_schema=input_schema,
            output_schema=output_schema,
            permission_level=permission_level,
            func=func
        )
        self._tools[name] = tool_def
        logger.info(f"Registered tool: '{name}' ({permission_level})")

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        if name in self._tools:
            return self._tools[name]
        
        canonical_name = TOOL_ALIASES.get(name.lower().strip())
        if canonical_name and canonical_name in self._tools:
            logger.info(f"Resolved tool alias '{name}' -> '{canonical_name}'")
            return self._tools[canonical_name]

        return None

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
                "permission_level": t.permission_level
            }
            for t in self._tools.values()
        ]

tool_registry = ToolRegistry()
