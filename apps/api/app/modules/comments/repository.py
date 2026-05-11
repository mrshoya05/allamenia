"""
Comments repository - Database operations
"""

from typing import Optional, List, Dict
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime

from .model import create_comment_document, COMMENT_INDEXES


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable format"""
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc


class CommentRepository:
    def __init__(self, db):
        self.comments: Collection = db["comments"]
        self.likes: Collection = db["comment_likes"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create indexes for performance"""
        for index in COMMENT_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.comments.create_index(keys, **index_copy)

    def create_comment(self, comment_data: dict) -> Optional[str]:
        """Create a new comment"""
        result = self.comments.insert_one(comment_data)
        return str(result.inserted_id)

    def get_comment_by_id(self, comment_id: str) -> Optional[dict]:
        """Get comment by ID"""
        try:
            doc = self.comments.find_one({"_id": ObjectId(comment_id), "is_deleted": False})
            return serialize_doc(doc) if doc else None
        except:
            return None

    def get_post_comments(self, post_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        """Get all comments for a post (flat list)"""
        comments = list(self.comments.find(
            {"post_id": post_id, "is_deleted": False}
        ).sort("created_at", 1).skip(skip).limit(limit))
        
        return [serialize_doc(comment) for comment in comments]

    def get_comment_replies(self, comment_id: str) -> List[dict]:
        """Get direct replies to a comment"""
        replies = list(self.comments.find(
            {"parent_comment_id": comment_id, "is_deleted": False}
        ).sort("created_at", 1))
        
        return [serialize_doc(reply) for reply in replies]

    def count_post_comments(self, post_id: str) -> int:
        """Count total comments for a post"""
        return self.comments.count_documents({"post_id": post_id, "is_deleted": False})

    def update_comment(self, comment_id: str, content: str) -> bool:
        """Update comment content"""
        result = self.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {
                "$set": {
                    "content": content,
                    "is_edited": True,
                    "edited_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    def delete_comment(self, comment_id: str) -> bool:
        """Soft delete comment"""
        result = self.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    def increment_replies_count(self, comment_id: str) -> bool:
        """Increment replies count"""
        result = self.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"replies_count": 1}}
        )
        return result.modified_count > 0

    def decrement_replies_count(self, comment_id: str) -> bool:
        """Decrement replies count"""
        result = self.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"replies_count": -1}}
        )
        return result.modified_count > 0

    # Likes
    def like_comment(self, user_id: str, comment_id: str) -> bool:
        """Like a comment"""
        try:
            self.likes.insert_one({
                "user_id": user_id,
                "comment_id": comment_id,
                "created_at": datetime.utcnow()
            })
            self.comments.update_one(
                {"_id": ObjectId(comment_id)},
                {"$inc": {"likes_count": 1}}
            )
            return True
        except:
            return False

    def unlike_comment(self, user_id: str, comment_id: str) -> bool:
        """Unlike a comment"""
        result = self.likes.delete_one({"user_id": user_id, "comment_id": comment_id})
        if result.deleted_count > 0:
            self.comments.update_one(
                {"_id": ObjectId(comment_id)},
                {"$inc": {"likes_count": -1}}
            )
            return True
        return False

    def is_liked(self, user_id: str, comment_id: str) -> bool:
        """Check if user liked comment"""
        return self.likes.count_documents({"user_id": user_id, "comment_id": comment_id}) > 0
