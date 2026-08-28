import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from backend.app.config import settings

logger = logging.getLogger(__name__)

class BrowserTool:
    """Local Chrome / Playwright browser controller for web execution."""

    def __init__(self, user_data_dir: Optional[Path] = None):
        self.user_data_dir = user_data_dir or (settings.DATA_DIR / "browser_session")
        self.playwright = None
        self.context: Optional[BrowserContext] = None
        self.active_page: Optional[Page] = None
        self.cdp_url = "http://localhost:9222"

    async def initialize(self, cdp_port: Optional[int] = None):
        """Connects to existing Chrome CDP or starts a local persistent Playwright browser."""
        if self.context:
            return

        self.playwright = await async_playwright().start()

        # Attempt to connect to existing local Chrome via CDP if requested/running
        if cdp_port:
            try:
                cdp_target = f"http://localhost:{cdp_port}"
                logger.info(f"Connecting to existing Chrome session at {cdp_target}...")
                browser = await self.playwright.chromium.connect_over_cdp(cdp_target)
                self.context = browser.contexts[0]
                if self.context.pages:
                    self.active_page = self.context.pages[0]
                else:
                    self.active_page = await self.context.new_page()
                logger.info("Successfully connected to existing Chrome session via CDP!")
                return
            except Exception as e:
                logger.warning(f"Could not connect to Chrome CDP port {cdp_port}: {e}. Launching local browser context.")

        # Fallback to local persistent browser context with user profile
        self.user_data_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Launching persistent Chromium context at {self.user_data_dir}...")
        
        import os
        is_headless = settings.is_public_mode or os.environ.get("RENDER") is not None or os.name != "nt"
        
        self.context = await self.playwright.chromium.launch_persistent_context(
            user_data_dir=str(self.user_data_dir),
            headless=is_headless,
            viewport={"width": 1280, "height": 800},
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        
        if self.context.pages:
            self.active_page = self.context.pages[0]
        else:
            self.active_page = await self.context.new_page()

    async def get_page(self) -> Page:
        if not self.context or not self.active_page:
            await self.initialize()
        return self.active_page

    async def list_tabs(self) -> List[Dict[str, str]]:
        page = await self.get_page()
        tabs = []
        for i, p in enumerate(self.context.pages):
            tabs.append({
                "index": str(i),
                "title": await p.title(),
                "url": p.url,
                "is_active": "true" if p == page else "false"
            })
        return tabs

    async def create_tab(self, url: str = "about:blank") -> Dict[str, Any]:
        await self.get_page()
        new_page = await self.context.new_page()
        self.active_page = new_page
        if url != "about:blank":
            await new_page.goto(url, wait_until="domcontentloaded")
        return await self.get_observation()

    async def close_tab(self, index: Optional[int] = None) -> Dict[str, Any]:
        pages = self.context.pages
        if not pages:
            return {"status": "no open pages"}
        
        target_page = pages[index] if (index is not None and index < len(pages)) else self.active_page
        await target_page.close()
        
        if self.context.pages:
            self.active_page = self.context.pages[-1]
        return await self.get_observation()

    async def navigate(self, url: str) -> Dict[str, Any]:
        page = await self.get_page()
        url_clean = url.strip() if url else "https://www.google.com"
        
        # If url contains spaces or lacks domain structure, convert to Google search URL
        if " " in url_clean or ("." not in url_clean and not url_clean.startswith("http")):
            import urllib.parse
            encoded = urllib.parse.quote(url_clean)
            target_url = f"https://www.google.com/search?q={encoded}"
        elif not url_clean.startswith("http://") and not url_clean.startswith("https://"):
            target_url = "https://" + url_clean
        else:
            target_url = url_clean

        logger.info(f"Navigating browser to: {target_url}")
        try:
            await page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(1000)
        except Exception as err:
            logger.warning(f"Browser navigation to {target_url} encountered issue: {err}. Extracting current state.")

        return await self.get_observation()

    async def click(self, selector: str) -> Dict[str, Any]:
        page = await self.get_page()
        logger.info(f"Clicking browser element: '{selector}'")
        # Try text matching if selector is plain text
        if not selector.startswith("#") and not selector.startswith(".") and not selector.startswith("//") and "[" not in selector:
            try:
                await page.click(f"text={selector}", timeout=5000)
            except Exception:
                await page.click(selector, timeout=10000)
        else:
            await page.click(selector, timeout=10000)
            
        await page.wait_for_timeout(1000)
        return await self.get_observation()

    async def type(self, selector: str, text: str) -> Dict[str, Any]:
        page = await self.get_page()
        logger.info(f"Typing text into selector '{selector}'")
        await page.fill(selector, text)
        await page.wait_for_timeout(500)
        return await self.get_observation()

    async def scroll(self, direction: str = "down", amount: int = 500) -> Dict[str, Any]:
        page = await self.get_page()
        delta_y = amount if direction.lower() == "down" else -amount
        await page.evaluate(f"window.scrollBy(0, {delta_y});")
        await page.wait_for_timeout(500)
        return await self.get_observation()

    async def screenshot(self, save_path: str) -> str:
        page = await self.get_page()
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=save_path, full_page=False)
        return save_path

    async def extract_content(self) -> Dict[str, Any]:
        page = await self.get_page()
        title = await page.title()
        url = page.url
        
        # Extract main readable text
        text_content = await page.evaluate("""() => {
            return document.body ? document.body.innerText : '';
        }""")
        
        # Truncate text content to avoid blowing up context window (max 3000 chars)
        truncated_text = text_content[:3000] + ("\n...[content truncated]" if len(text_content) > 3000 else "")
        
        # Extract interactive elements (buttons, links, inputs)
        interactive_elements = await page.evaluate("""() => {
            const elements = Array.from(document.querySelectorAll('a, button, input, textarea, select'));
            return elements.slice(0, 30).map((el, i) => ({
                id: i,
                tag: el.tagName.toLowerCase(),
                text: (el.innerText || el.value || el.placeholder || '').trim().substring(0, 50),
                type: el.getAttribute('type') || '',
                name: el.getAttribute('name') || '',
                id_attr: el.id || ''
            })).filter(item => item.text.length > 0 || item.id_attr || item.name);
        }""")

        return {
            "title": title,
            "url": url,
            "visible_text": truncated_text,
            "interactive_elements": interactive_elements
        }

    async def get_observation(self, screenshot_path: Optional[str] = None) -> Dict[str, Any]:
        info = await self.extract_content()
        tabs = await self.list_tabs()
        return {
            "url": info["url"],
            "title": info["title"],
            "visible_text": info["visible_text"],
            "interactive_elements": info["interactive_elements"],
            "tabs": tabs,
            "screenshot_path": screenshot_path
        }

    async def close(self):
        if self.context:
            await self.context.close()
            self.context = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

browser_tool = BrowserTool()
