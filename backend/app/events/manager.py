import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class EventManager:
    """Manages WebSocket connections and broadcasts real-time execution events."""

    def __init__(self):
        # Maps run_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, run_id: str):
        await websocket.accept()
        if run_id not in self.active_connections:
            self.active_connections[run_id] = set()
        self.active_connections[run_id].add(websocket)
        logger.info(f"WebSocket client connected to run_id: {run_id}")

    def disconnect(self, websocket: WebSocket, run_id: str):
        if run_id in self.active_connections:
            self.active_connections[run_id].discard(websocket)
            if not self.active_connections[run_id]:
                del self.active_connections[run_id]
        logger.info(f"WebSocket client disconnected from run_id: {run_id}")

    async def broadcast(self, run_id: str, event_type: str, data: dict):
        payload = {
            "type": event_type,
            "run_id": run_id,
            "data": data
        }
        connections = self.active_connections.get(run_id, set())
        logger.debug(f"Broadcasting event '{event_type}' to {len(connections)} clients for run {run_id}")
        
        dead_connections = set()
        for websocket in list(connections):
            try:
                await websocket.send_json(payload)
            except Exception as e:
                logger.warning(f"Error sending WS event: {e}")
                dead_connections.add(websocket)

        for dead in dead_connections:
            self.disconnect(dead, run_id)

event_manager = EventManager()
