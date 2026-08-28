import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import aiosqlite

from backend.app.database import init_db, DB_PATH
from backend.app.config import settings
from backend.app.agent.runtime import agent_runtime
from backend.app.agent.memory import memory_manager
from backend.app.skills.loader import skill_loader
from backend.app.events.manager import event_manager
from backend.app.tools.browser import browser_tool

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Initializing Agent Runtime Database schema...")
    await init_db()
    yield
    # Shutdown logic
    logger.info("Closing browser session...")
    await browser_tool.close()

app = FastAPI(
    title="Open-Source Local-First Agent Runtime API",
    version=settings.VERSION,
    lifespan=lifespan
)

# Parse CORS origins from settings (supports comma-separated origins)
cors_origins_list = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount runs directory for serving screenshots & artifacts
app.mount("/runs_files", StaticFiles(directory=str(settings.RUNS_DIR)), name="runs_files")

# In-memory IP Rate Limiter and Concurrency tracker for Public Mode
ip_request_history: Dict[str, list] = {}
active_public_tasks_count: int = 0

async def release_public_task_slot(run_id: str):
    """Release one public-mode execution slot after a background run exits."""
    global active_public_tasks_count
    active_public_tasks_count = max(0, active_public_tasks_count - 1)

# Request Models
class TaskRequest(BaseModel):
    prompt: str
    cdp_port: Optional[int] = None

class ConfirmationResponse(BaseModel):
    approved: bool

class ChallengeResponse(BaseModel):
    choice: str  # "expand_scope" or "keep_original"

class MemoryCreateRequest(BaseModel):
    category: str
    content: str

# Endpoints
@app.get("/")
async def root():
    return {
        "name": "Open-Source Local-First Agent Runtime API",
        "version": settings.VERSION,
        "mode": settings.AGENT_MODE,
        "status": "online",
        "documentation": "/docs",
        "health": "/health",
        "diagnostics": "/api/diagnostics"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "version": settings.VERSION,
        "mode": settings.AGENT_MODE,
        "service": "Agent Runtime API"
    }

@app.get("/api/diagnostics")
async def system_diagnostics():
    """Returns developer environment diagnostics and readiness checks."""
    import sys
    db_connected = Path(DB_PATH).exists()
    skills = skill_loader.discover_skills()
    cdp_status = bool(browser_tool.context)
    
    return {
        "version": settings.VERSION,
        "mode": settings.AGENT_MODE,
        "environment": {
            "python_version": sys.version.split()[0],
            "database_ready": db_connected,
            "browser_cdp_connected": cdp_status,
            "skills_loaded": len(skills)
        },
        "providers": settings.get_provider_status()
    }

@app.get("/api/settings")
async def get_settings():
    """Returns provider status without revealing secrets."""
    res = settings.get_provider_status()
    res["mode"] = settings.AGENT_MODE
    return res

@app.post("/api/tasks")
async def create_task(req: TaskRequest, request: Request):
    """Creates and starts an execution task with rate limiting and concurrency safeguards."""
    global active_public_tasks_count
    import time
    
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Task prompt cannot be empty.")

    # Enforce Public Mode Security & Rate Limits
    if settings.is_public_mode:
        client_ip = request.client.host if request.client else "unknown"

        # 1. IP Rate Limiting check
        now = time.time()
        history = [t for t in ip_request_history.get(client_ip, []) if now - t < 60]
        if len(history) >= settings.RATE_LIMIT_REQUESTS_PER_MIN:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Maximum {settings.RATE_LIMIT_REQUESTS_PER_MIN} requests per minute allowed."
            )
        history.append(now)
        ip_request_history[client_ip] = history

        # 2. Concurrent Tasks check
        if active_public_tasks_count >= settings.MAX_CONCURRENT_PUBLIC_TASKS:
            raise HTTPException(
                status_code=429, 
                detail="Public server is busy processing maximum concurrent research tasks. Please try again in a few moments."
            )
            
        # 3. Block CDP Port attachment in public mode
        cdp_port = None
        active_public_tasks_count += 1
        on_complete = release_public_task_slot
    else:
        cdp_port = req.cdp_port
        on_complete = None
    
    try:
        run_id = await agent_runtime.start_task(prompt=req.prompt, cdp_port=cdp_port, on_complete=on_complete)
    except Exception:
        if settings.is_public_mode:
            active_public_tasks_count = max(0, active_public_tasks_count - 1)
        raise
    return {"run_id": run_id, "status": "started", "mode": settings.AGENT_MODE}

@app.get("/api/runs")
async def list_runs():
    """Lists all historical and active runs."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM runs ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

@app.get("/api/runs/{run_id}")
async def get_run_details(run_id: str):
    """Gets details for a specific run including evidence and result."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Run not found.")
            run_dict = dict(row)

    run_dir = settings.RUNS_DIR / run_id
    evidence_file = run_dir / "evidence.json"
    final_file = run_dir / "final_result.json"

    evidence = []
    if evidence_file.exists():
        import json
        with open(evidence_file, "r", encoding="utf-8") as f:
            evidence = json.load(f)

    final_result = None
    if final_file.exists():
        import json
        with open(final_file, "r", encoding="utf-8") as f:
            final_result = json.load(f)

    return {
        "run": run_dict,
        "evidence": evidence,
        "final_result": final_result
    }

@app.post("/api/runs/{run_id}/stop")
async def stop_run(run_id: str):
    await agent_runtime.stop_task(run_id)
    return {"status": "stopped"}

@app.post("/api/runs/{run_id}/confirm")
async def confirm_action(run_id: str, resp: ConfirmationResponse):
    await agent_runtime.resume_after_confirmation(run_id, approved=resp.approved)
    return {"status": "resumed"}

@app.post("/api/runs/{run_id}/challenge")
async def resolve_challenge(run_id: str, resp: ChallengeResponse):
    await agent_runtime.resume_after_challenge(run_id, choice=resp.choice)
    return {"status": "resumed"}

@app.get("/api/skills")
async def list_skills():
    return skill_loader.discover_skills()

@app.get("/api/memories")
async def list_memories():
    return await memory_manager.list_memories()

@app.post("/api/memories")
async def create_memory(req: MemoryCreateRequest):
    return await memory_manager.add_memory(category=req.category, content=req.content)

@app.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: str):
    await memory_manager.delete_memory(memory_id)
    return {"status": "deleted"}

@app.get("/api/browser/status")
async def browser_status():
    if not browser_tool.context:
        return {"connected": False, "tabs": []}
    tabs = await browser_tool.list_tabs()
    return {"connected": True, "tabs": tabs}

@app.post("/api/browser/connect")
async def connect_browser(port: int = 9222):
    await browser_tool.initialize(cdp_port=port)
    tabs = await browser_tool.list_tabs()
    return {"connected": True, "tabs": tabs}

@app.websocket("/ws/execution/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await event_manager.connect(websocket, run_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        event_manager.disconnect(websocket, run_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
