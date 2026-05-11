"""
Notification repository - Advanced
"""

from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime

from .model import create_notification, NOTIFICATION_INDEXES


def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


class NotificationRepository:
    def __init__(self, db):
        self.collection: Collection = db["notifications"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        for index in NOTIFICATION_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            try:
                self.collection.create_index(keys, **index_copy)
            except Exception:
                # Index exists with different options - drop and recreate
                try:
                    name = index_copy.get("name")
                    if name:
                        self.collection.drop_index(name)
                    self.collection.create_index(keys, **index_copy)
                except Exception:
                    pass  # Skip if still fails

    def create_notification(
        self,
        user_id: str,
        notification_type: str,
        actor_id: str = None,
        post_id: str = None,
        comment_id: str = None,
        message: str = None,
    ) -> Optional[str]:
        """Create a notification. Skip if self-action."""
        if actor_id and user_id == actor_id:
            return None

        notif = create_notification(
            user_id=user_id,
            notification_type=notification_type,
            actor_id=actor_id,
            post_id=post_id,
            comment_id=comment_id,
            message=message,
        )
        result = self.collection.insert_one(notif)
        return str(result.inserted_id)

    def get_notifications(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        type_filter: str = None,
    ) -> List[dict]:
        query = {"user_id": user_id}
        if type_filter:
            query["type"] = type_filter

        notifications = list(
            self.collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return [serialize_doc(n) for n in notifications]

    def get_pending_follow_requests(self, user_id: str) -> List[dict]:
        """Get all unresolved follow_request notifications"""
        notifications = list(
            self.collection.find({
                "user_id": user_id,
                "type": "follow_request",
                "resolved": {"$ne": True},
            }).sort("created_at", -1)
        )
        return [serialize_doc(n) for n in notifications]

    def resolve_follow_request_notification(self, user_id: str, actor_id: str) -> bool:
        """Mark follow_request notification as resolved (after accept/reject)"""
        result = self.collection.update_one(
            {"user_id": user_id, "actor_id": actor_id, "type": "follow_request"},
            {"$set": {"resolved": True, "is_read": True}},
        )
        return result.modified_count > 0

    def get_unread_count(self, user_id: str) -> int:
        return self.collection.count_documents({"user_id": user_id, "is_read": False})

    def get_counts_by_type(self, user_id: str) -> dict:
        """Get unread count grouped by category"""
        pipeline = [
            {"$match": {"user_id": user_id, "is_read": False}},
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        ]
        result = list(self.collection.aggregate(pipeline))
        counts = {"total": 0}
        for r in result:
            counts[r["_id"]] = r["count"]
            counts["total"] += r["count"]
        return counts

    def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        result = self.collection.update_one(
            {"_id": ObjectId(notification_id), "user_id": user_id},
            {"$set": {"is_read": True}},
        )
        return result.modified_count > 0

    def mark_all_as_read(self, user_id: str) -> int:
        result = self.collection.update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True}},
        )
        return result.modified_count

    def delete_notification(self, notification_id: str, user_id: str) -> bool:
        result = self.collection.delete_one(
            {"_id": ObjectId(notification_id), "user_id": user_id}
        )
        return result.deleted_count > 0
