"""WebSocket connection manager for real-time messaging"""
from fastapi import WebSocket
from typing import Dict, Set
import json


class ConnectionManager:
    def __init__(self):
        # user_id -> set of WebSocket connections (multiple tabs)
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active:
            self.active[user_id] = set()
        self.active[user_id].add(websocket)
        print(f"[WS DEBUG] connection open")
        print(f"[WS DEBUG] Active connections: {list(self.active.keys())}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active:
            self.active[user_id].discard(websocket)
            if not self.active[user_id]:
                del self.active[user_id]
        print(f"[WS DEBUG] connection closed for {user_id}")
        print(f"[WS DEBUG] Active connections: {list(self.active.keys())}")

    async def send_to_user(self, user_id: str, data: dict):
        """Send message to all connections of a user"""
        if user_id not in self.active:
            print(f"[WS DEBUG] User {user_id} not connected, skipping")
            return

        print(f"[WS DEBUG] Sending {data.get('type')} to user_id={user_id}")
        dead = set()
        for ws in list(self.active[user_id]):
            try:
                await ws.send_text(json.dumps(data, default=str))
                print(f"[WS DEBUG] ✅ Delivered to {user_id}")
            except Exception as e:
                print(f"[WS DEBUG] ❌ Failed to deliver to {user_id}: {e}")
                dead.add(ws)
        self.active[user_id] -= dead
        if not self.active[user_id]:
            del self.active[user_id]

    def is_online(self, user_id: str) -> bool:
        return user_id in self.active and len(self.active[user_id]) > 0


# Global singleton
manager = ConnectionManager()
