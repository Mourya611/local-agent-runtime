import uuid
import logging
from typing import Any, Dict, List
import aiosqlite
from backend.app.database import DB_PATH

logger = logging.getLogger(__name__)

class MemoryManager:
    """Manages persistent user preferences and preferences retrieved during planning."""

    async def add_memory(self, category: str, content: str, source_run_id: str = "") -> Dict[str, Any]:
        memory_id = f"mem_{uuid.uuid4().hex[:8]}"
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO memory_items (memory_id, category, content, source_run_id) VALUES (?, ?, ?, ?)",
                (memory_id, category, content, source_run_id)
            )
            await db.commit()
        logger.info(f"Added memory item [{category}]: '{content}'")
        return {"memory_id": memory_id, "category": category, "content": content}

    async def list_memories(self) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM memory_items ORDER BY created_at DESC") as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    async def delete_memory(self, memory_id: str):
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("DELETE FROM memory_items WHERE memory_id = ?", (memory_id,))
            await db.commit()
        logger.info(f"Deleted memory item: {memory_id}")

    async def get_relevant_memories(self, prompt: str) -> List[str]:
        """Returns string representations of relevant stored preferences."""
        memories = await self.list_memories()
        return [f"[{m['category']}] {m['content']}" for m in memories]

memory_manager = MemoryManager()
