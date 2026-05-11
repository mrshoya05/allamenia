"""Messages repository"""
from typing import Optional, List
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime

from .model import create_conversation, create_message, MESSAGE_INDEXES, CONVERSATION_INDEXES


def _s(doc: dict) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    for k, v in list(doc.items()):
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc


class MessageRepository:
    def __init__(self, db):
        self.conversations: Collection = db["conversations"]
        self.messages: Collection = db["messages"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        for idx in CONVERSATION_INDEXES:
            c = idx.copy(); keys = c.pop("keys")
            try: self.conversations.create_index(keys, **c)
            except: pass
        for idx in MESSAGE_INDEXES:
            c = idx.copy(); keys = c.pop("keys")
            try: self.messages.create_index(keys, **c)
            except: pass

    # ── Conversations ──────────────────────────────────────────────────────

    def get_or_create_conversation(self, user_a: str, user_b: str, is_request: bool = False) -> dict:
        """Get existing conversation or create new one"""
        # Check both orderings
        conv = self.conversations.find_one({
            "participants": {"$all": [user_a, user_b], "$size": 2}
        })
        if conv:
            return _s(conv)

        doc = create_conversation([user_a, user_b], is_request)
        result = self.conversations.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        del doc["_id"]
        return doc

    def get_conversation_by_id(self, conv_id: str) -> Optional[dict]:
        try:
            doc = self.conversations.find_one({"_id": ObjectId(conv_id)})
            return _s(doc) if doc else None
        except:
            return None

    def get_user_conversations(self, user_id: str) -> List[dict]:
        """Get all conversations for a user, sorted by latest message"""
        convs = list(self.conversations.find(
            {"participants": user_id}
        ).sort("updated_at", -1))
        return [_s(c) for c in convs]

    def accept_message_request(self, conv_id: str) -> bool:
        result = self.conversations.update_one(
            {"_id": ObjectId(conv_id)},
            {"$set": {"is_request": False, "request_accepted": True}}
        )
        return result.modified_count > 0

    def update_last_message(self, conv_id: str, content: str, sender_id: str, recipient_id: str):
        self.conversations.update_one(
            {"_id": ObjectId(conv_id)},
            {
                "$set": {
                    "last_message": content[:100],
                    "last_message_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
                "$inc": {f"unread_counts.{recipient_id}": 1}
            }
        )

    def mark_conversation_read(self, conv_id: str, user_id: str):
        self.conversations.update_one(
            {"_id": ObjectId(conv_id)},
            {"$set": {f"unread_counts.{user_id}": 0}}
        )

    def get_total_unread(self, user_id: str) -> int:
        pipeline = [
            {"$match": {"participants": user_id}},
            {"$group": {"_id": None, "total": {"$sum": f"$unread_counts.{user_id}"}}}
        ]
        result = list(self.conversations.aggregate(pipeline))
        return result[0]["total"] if result else 0

    # ── Messages ───────────────────────────────────────────────────────────

    def create_message(self, conv_id: str, sender_id: str, content: str) -> dict:
        doc = create_message(conv_id, sender_id, content)
        result = self.messages.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        del doc["_id"]
        return doc

    def get_messages(self, conv_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        msgs = list(self.messages.find(
            {"conversation_id": conv_id, "is_deleted": False}
        ).sort("created_at", -1).skip(skip).limit(limit))
        return [_s(m) for m in reversed(msgs)]  # oldest first

    def mark_messages_read(self, conv_id: str, user_id: str):
        self.messages.update_many(
            {"conversation_id": conv_id, "sender_id": {"$ne": user_id}, "is_read": False},
            {"$set": {"is_read": True}}
        )

    def delete_message(self, msg_id: str, user_id: str) -> bool:
        result = self.messages.update_one(
            {"_id": ObjectId(msg_id), "sender_id": user_id},
            {"$set": {"is_deleted": True, "content": "This message was deleted"}}
        )
        return result.modified_count > 0
