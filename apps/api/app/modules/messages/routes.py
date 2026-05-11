"""Message routes + WebSocket"""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from typing import Annotated
import json

from ...core.dependencies import get_current_user
from ...core.security import decode_token
from ...database.database import db
from ..users import repository as user_repo
from ..follows.repository import FollowRepository
from ..blocks.repository import BlockRepository
from .repository import MessageRepository
from .websocket_manager import manager

router = APIRouter(prefix="/messages", tags=["messages"])


def get_msg_repo() -> MessageRepository:
    return MessageRepository(db)


def _enrich_user(user_id: str) -> dict:
    u = user_repo.get_user_by_id(user_id)
    if not u:
        return {"id": user_id, "username": "deleted", "full_name": None, "avatar_url": None, "is_verified": False}
    return {
        "id": str(u["_id"]),
        "username": u["username"],
        "full_name": u.get("full_name"),
        "avatar_url": u.get("avatar_url"),
        "is_verified": u.get("is_verified", False),
    }


# ── REST endpoints ──────────────────────────────────────────────────────────

@router.get("/conversations")
async def get_conversations(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Get all conversations for current user"""
    user_id = str(current_user["_id"])
    repo = get_msg_repo()
    convs = repo.get_user_conversations(user_id)

    result = []
    for conv in convs:
        # Get other participant
        other_id = next(p for p in conv["participants"] if p != user_id)
        other = _enrich_user(other_id)
        result.append({
            **conv,
            "other_user": other,
            "unread_count": conv.get("unread_counts", {}).get(user_id, 0),
            "is_online": manager.is_online(other_id),
        })

    return {"conversations": result}


@router.post("/conversations/{user_id}")
async def start_conversation(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Start or get a conversation with a user"""
    my_id = str(current_user["_id"])

    if my_id == user_id:
        raise HTTPException(400, "Cannot message yourself")

    target = user_repo.get_user_by_id(user_id)
    if not target:
        raise HTTPException(404, "User not found")

    # Check if mutual follow (can DM directly) or need request
    follow_repo = FollowRepository(db)
    i_follow_them = follow_repo.is_following(my_id, user_id)
    they_follow_me = follow_repo.is_following(user_id, my_id)
    is_request = not (i_follow_them or they_follow_me)

    # Check if blocked
    block_repo = BlockRepository(db)
    if block_repo.is_blocking_or_blocked(my_id, user_id):
        raise HTTPException(403, "Cannot message a blocked user")

    repo = get_msg_repo()
    conv = repo.get_or_create_conversation(my_id, user_id, is_request)

    return {
        "conversation": conv,
        "other_user": _enrich_user(user_id),
        "is_request": conv.get("is_request", False),
    }


@router.get("/conversations/{conv_id}/messages")
async def get_messages(
    conv_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
):
    """Get messages in a conversation"""
    user_id = str(current_user["_id"])
    repo = get_msg_repo()

    conv = repo.get_conversation_by_id(conv_id)
    if not conv or user_id not in conv["participants"]:
        raise HTTPException(403, "Not authorized")

    skip = (page - 1) * 50
    messages = repo.get_messages(conv_id, skip=skip, limit=50)

    # Mark as read
    repo.mark_messages_read(conv_id, user_id)
    repo.mark_conversation_read(conv_id, user_id)

    # Enrich with sender info
    for msg in messages:
        msg["sender"] = _enrich_user(msg["sender_id"])

    return {
        "messages": messages,
        "has_more": len(messages) == 50,
    }


@router.post("/conversations/{conv_id}/messages")
async def send_message(
    conv_id: str,
    body: dict,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Send a message (REST fallback if WebSocket not available)"""
    user_id = str(current_user["_id"])
    content = body.get("content", "").strip()

    if not content:
        raise HTTPException(400, "Message cannot be empty")

    repo = get_msg_repo()
    conv = repo.get_conversation_by_id(conv_id)
    if not conv or user_id not in conv["participants"]:
        raise HTTPException(403, "Not authorized")

    if conv.get("is_request") and not conv.get("request_accepted"):
        if conv["participants"][0] != user_id:
            raise HTTPException(403, "Message request not accepted yet")

    msg = repo.create_message(conv_id, user_id, content)
    recipient_id = next(p for p in conv["participants"] if p != user_id)
    repo.update_last_message(conv_id, content, user_id, recipient_id)

    msg["sender"] = _enrich_user(user_id)

    # Push via WebSocket
    await manager.send_to_user(recipient_id, {
        "type": "new_message",
        "conversation_id": conv_id,
        "message": msg,
    })

    return {"message": msg}


@router.post("/conversations/{conv_id}/accept")
async def accept_request(
    conv_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Accept a message request"""
    user_id = str(current_user["_id"])
    repo = get_msg_repo()

    conv = repo.get_conversation_by_id(conv_id)
    if not conv or user_id not in conv["participants"]:
        raise HTTPException(403, "Not authorized")

    repo.accept_message_request(conv_id)
    return {"success": True}


@router.delete("/conversations/{conv_id}/messages/{msg_id}")
async def delete_message(
    conv_id: str,
    msg_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a message"""
    user_id = str(current_user["_id"])
    repo = get_msg_repo()
    success = repo.delete_message(msg_id, user_id)
    return {"success": success}


@router.get("/unread-count")
async def get_unread_count(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    user_id = str(current_user["_id"])
    repo = get_msg_repo()
    return {"count": repo.get_total_unread(user_id)}


# ── WebSocket ───────────────────────────────────────────────────────────────
# NOTE: Registered directly on app in main.py (not via APIRouter prefix)

async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket connection authenticated via token in URL"""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)

    # Notify contacts that user is online
    await manager.send_to_user(user_id, {"type": "connected", "user_id": user_id})

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)

            if msg_data.get("type") == "send_message":
                conv_id = msg_data.get("conversation_id")
                content = msg_data.get("content", "").strip()

                if not conv_id or not content:
                    continue

                repo = MessageRepository(db)
                conv = repo.get_conversation_by_id(conv_id)

                if not conv or user_id not in conv["participants"]:
                    continue

                msg = repo.create_message(conv_id, user_id, content)
                recipient_id = next(p for p in conv["participants"] if p != user_id)
                repo.update_last_message(conv_id, content, user_id, recipient_id)

                msg["sender"] = _enrich_user(user_id)
                msg["sender_id"] = user_id  # Ensure sender_id is in response

                print(f"[WS DEBUG] Sending message_sent to user_id={user_id}")
                print(f"[WS DEBUG] Active connections: {list(manager.active.keys())}")

                # Send to sender (confirmation)
                await manager.send_to_user(user_id, {
                    "type": "message_sent",
                    "conversation_id": conv_id,
                    "message": msg,
                })

                print(f"[WS DEBUG] Sending new_message to recipient_id={recipient_id}")

                # Send to recipient
                await manager.send_to_user(recipient_id, {
                    "type": "new_message",
                    "conversation_id": conv_id,
                    "message": msg,
                })

            elif msg_data.get("type") == "typing":
                conv_id = msg_data.get("conversation_id")
                if conv_id:
                    repo = MessageRepository(db)
                    conv = repo.get_conversation_by_id(conv_id)
                    if conv and user_id in conv["participants"]:
                        recipient_id = next(p for p in conv["participants"] if p != user_id)
                        await manager.send_to_user(recipient_id, {
                            "type": "typing",
                            "conversation_id": conv_id,
                            "user_id": user_id,
                        })

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
