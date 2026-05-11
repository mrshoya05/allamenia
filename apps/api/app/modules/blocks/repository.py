"""
Block repository - Database operations for blocks
"""

from typing import List
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError
from datetime import datetime

from .model import create_block_document, BLOCK_INDEXES


class BlockRepository:
    def __init__(self, db):
        self.collection: Collection = db["blocks"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create indexes for performance"""
        for index in BLOCK_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.collection.create_index(keys, **index_copy)

    def block_user(self, blocker_id: str, blocked_id: str) -> bool:
        """Block a user"""
        try:
            block_doc = create_block_document(blocker_id, blocked_id)
            self.collection.insert_one(block_doc)
            return True
        except DuplicateKeyError:
            return False  # Already blocked

    def unblock_user(self, blocker_id: str, blocked_id: str) -> bool:
        """Unblock a user"""
        result = self.collection.delete_one({
            "blocker_id": blocker_id,
            "blocked_id": blocked_id
        })
        return result.deleted_count > 0

    def is_blocked(self, blocker_id: str, blocked_id: str) -> bool:
        """Check if blocker_id has blocked blocked_id"""
        return self.collection.count_documents({
            "blocker_id": blocker_id,
            "blocked_id": blocked_id
        }) > 0

    def is_blocking_or_blocked(self, user_a: str, user_b: str) -> bool:
        """Check if either user has blocked the other"""
        return self.collection.count_documents({
            "$or": [
                {"blocker_id": user_a, "blocked_id": user_b},
                {"blocker_id": user_b, "blocked_id": user_a}
            ]
        }) > 0

    def get_blocked_users(self, user_id: str, skip: int = 0, limit: int = 20) -> List[str]:
        """Get list of user IDs that a user has blocked"""
        cursor = self.collection.find(
            {"blocker_id": user_id},
            {"blocked_id": 1}
        ).skip(skip).limit(limit)
        return [doc["blocked_id"] for doc in cursor]

    def get_all_blocked_users(self, user_id: str) -> List[str]:
        """Get all blocked user IDs (for filtering)"""
        cursor = self.collection.find(
            {"blocker_id": user_id},
            {"blocked_id": 1}
        )
        return [doc["blocked_id"] for doc in cursor]

    def get_users_who_blocked(self, user_id: str) -> List[str]:
        """Get all user IDs who have blocked this user (for filtering)"""
        cursor = self.collection.find(
            {"blocked_id": user_id},
            {"blocker_id": 1}
        )
        return [doc["blocker_id"] for doc in cursor]

    def count_blocked_users(self, user_id: str) -> int:
        """Count how many users a user has blocked"""
        return self.collection.count_documents({"blocker_id": user_id})
