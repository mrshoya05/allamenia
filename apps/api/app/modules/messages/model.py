"""Message data models"""
from datetime import datetime

MESSAGE_INDEXES = [
    {"keys": [("conversation_id", 1), ("created_at", 1)], "name": "conv_messages"},
    {"keys": [("sender_id", 1), ("created_at", -1)], "name": "sender_messages"},
]

CONVERSATION_INDEXES = [
    {"keys": [("participants", 1)], "name": "conv_participants"},
    {"keys": [("updated_at", -1)], "name": "conv_updated"},
]


def create_conversation(participant_ids: list, is_request: bool = False) -> dict:
    return {
        "participants": participant_ids,  # [user_id_1, user_id_2]
        "is_request": is_request,         # True = message request (not mutual follow)
        "request_accepted": not is_request,
        "last_message": None,
        "last_message_at": None,
        "unread_counts": {pid: 0 for pid in participant_ids},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def create_message(conversation_id: str, sender_id: str, content: str, msg_type: str = "text") -> dict:
    return {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "content": content,
        "type": msg_type,  # text | image | video
        "is_read": False,
        "is_deleted": False,
        "created_at": datetime.utcnow(),
    }
