# Tool Architecture & Integration Guide

Tools are executable actions available to the Agent Runtime.

## Available Core Tools

1. **`web_search`** (`backend/app/tools/search.py`):
   - Queries Tavily Search API for authoritative web articles and source URLs.

2. **`browser_navigate`** (`backend/app/tools/browser.py`):
   - Directs Chrome/Playwright to visit a URL or search query string.

3. **`browser_click` / `browser_type`** (`backend/app/tools/browser.py`):
   - Performs interactive UI clicks and form text typing.

4. **`browser_screenshot`** (`backend/app/tools/browser.py`):
   - Captures full-page viewport PNG screenshots for empirical proof.

---

## Adding a Custom Tool

1. Create `backend/app/tools/my_tool.py`:
   ```python
   from typing import Dict, Any

   class MyCustomTool:
       name = "my_custom_tool"
       description = "Description of tool capability"

       async def execute(self, **kwargs) -> Dict[str, Any]:
           # Tool logic
           return {"status": "success", "result": "output"}
   ```

2. Register your tool in `backend/app/agent/runtime.py`.
3. Write test coverage in `backend/tests/test_tools.py`.
