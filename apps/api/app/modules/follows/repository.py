"""
Follow repository - Database operations for follows
"""

from typing import Optional, List, Dict, Any
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError
from datetime import datetime

from .model import create_follow_document, FOLLOW_INDEXES


class FollowRepository:
    def __init__(self, db):
        self.collection: Collection = db["follows"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create indexes for performance"""
        for index in FOLLOW_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.collection.create_index(keys, **index_copy)

    def follow_user(self, follower_id: str, following_id: str, is_private: bool = False) -> Optional[str]:
        """
        Create a follow relationship
        Returns follow_id if successful, None if already following
        """
        try:
            status = "pending" if is_private else "active"
            follow_doc = create_follow_document(follower_id, following_id, status)
            result = self.collection.insert_one(follow_doc)
            return str(result.inserted_id)
        except DuplicateKeyError:
            # Already following
            return None

    def unfollow_user(self, follower_id: str, following_id: str) -> bool:
        """Remove a follow relationship"""
        result = self.collection.delete_one({
            "follower_id": follower_id,
            "following_id": following_id
        })
        return result.deleted_count > 0

    def get_follow_status(self, follower_id: str, following_id: str) -> Optional[str]:
        """Check if follower_id follows following_id and return status"""
        follow = self.collection.find_one({
            "follower_id": follower_id,
            "following_id": following_id
        })
        return follow.get("status") if follow else None

    def accept_follow_request(self, follower_id: str, following_id: str) -> bool:
        """Accept a pending follow request (for private accounts)"""
        result = self.collection.update_one(
            {
                "follower_id": follower_id,
                "following_id": following_id,
                "status": "pending"
            },
            {"$set": {"status": "active"}}
        )
        return result.modified_count > 0

    def reject_follow_request(self, follower_id: str, following_id: str) -> bool:
        """Reject a pending follow request"""
        result = self.collection.delete_one({
            "follower_id": follower_id,
            "following_id": following_id,
            "status": "pending"
        })
        return result.deleted_count > 0

    def get_followers(
        self, user_id: str, status: str = "active", skip: int = 0, limit: int = 20
    ) -> List[str]:
        """Get list of follower IDs for a user"""
        cursor = self.collection.find(
            {"following_id": user_id, "status": status},
            {"follower_id": 1}
        ).skip(skip).limit(limit)
        return [doc["follower_id"] for doc in cursor]

    def get_following(
        self, user_id: str, status: str = "active", skip: int = 0, limit: int = 20
    ) -> List[str]:
        """Get list of user IDs that a user is following"""
        cursor = self.collection.find(
            {"follower_id": user_id, "status": status},
            {"following_id": 1}
        ).skip(skip).limit(limit)
        return [doc["following_id"] for doc in cursor]

    def get_pending_requests(self, user_id: str, skip: int = 0, limit: int = 20) -> List[str]:
        """Get pending follow requests for a user (for private accounts)"""
        cursor = self.collection.find(
            {"following_id": user_id, "status": "pending"},
            {"follower_id": 1}
        ).skip(skip).limit(limit)
        return [doc["follower_id"] for doc in cursor]

    def count_followers(self, user_id: str, status: str = "active") -> int:
        """Count followers for a user"""
        return self.collection.count_documents({
            "following_id": user_id,
            "status": status
        })

    def count_following(self, user_id: str, status: str = "active") -> int:
        """Count users that a user is following"""
        return self.collection.count_documents({
            "follower_id": user_id,
            "status": status
        })

    def count_pending_requests(self, user_id: str) -> int:
        """Count pending follow requests"""
        return self.collection.count_documents({
            "following_id": user_id,
            "status": "pending"
        })

    def is_following(self, follower_id: str, following_id: str) -> bool:
        """Check if follower_id follows following_id (active only)"""
        return self.collection.count_documents({
            "follower_id": follower_id,
            "following_id": following_id,
            "status": "active"
        }) > 0

    def get_mutual_followers(self, user_id: str, other_user_id: str) -> List[str]:
        """Get users who follow both user_id and other_user_id"""
        # Get followers of user_id
        user_followers = set(self.get_followers(user_id, limit=10000))
        # Get followers of other_user_id
        other_followers = set(self.get_followers(other_user_id, limit=10000))
        # Return intersection
        return list(user_followers & other_followers)

    def remove_all_follows_for_user(self, user_id: str) -> int:
        """Remove all follow relationships for a user (when deleting account)"""
        result1 = self.collection.delete_many({"follower_id": user_id})
        result2 = self.collection.delete_many({"following_id": user_id})
        return result1.deleted_count + result2.deleted_count
