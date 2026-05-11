"""
Posts repository - Database operations
"""

from typing import Optional, List, Dict, Any
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError
from datetime import datetime

from .model import create_post_document, create_repost_document, POST_INDEXES
from .interactions_model import (
    create_like_document, create_bookmark_document, create_view_document,
    LIKE_INDEXES, BOOKMARK_INDEXES, VIEW_INDEXES
)


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable format"""
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    # Convert any other ObjectId fields
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc


class PostRepository:
    def __init__(self, db):
        self.posts: Collection = db["posts"]
        self.likes: Collection = db["likes"]
        self.bookmarks: Collection = db["bookmarks"]
        self.views: Collection = db["views"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create indexes for performance"""
        for index in POST_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.posts.create_index(keys, **index_copy)
        
        for index in LIKE_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.likes.create_index(keys, **index_copy)
        
        for index in BOOKMARK_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.bookmarks.create_index(keys, **index_copy)
        
        for index in VIEW_INDEXES:
            index_copy = index.copy()
            keys = index_copy.pop("keys")
            self.views.create_index(keys, **index_copy)

    # ─── Posts CRUD ───────────────────────────────────────────────────────────

    def create_post(self, post_data: dict) -> Optional[str]:
        """Create a new post"""
        result = self.posts.insert_one(post_data)
        return str(result.inserted_id)

    def get_post_by_id(self, post_id: str) -> Optional[dict]:
        """Get post by ID"""
        try:
            doc = self.posts.find_one({"_id": ObjectId(post_id), "is_deleted": False})
            return serialize_doc(doc) if doc else None
        except:
            return None

    def update_post(self, post_id: str, update_data: dict) -> bool:
        """Update post"""
        update_data["updated_at"] = datetime.utcnow()
        update_data["is_edited"] = True
        update_data["edited_at"] = datetime.utcnow()
        
        result = self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def delete_post(self, post_id: str) -> bool:
        """Soft delete post"""
        result = self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    # ─── Feed Queries ─────────────────────────────────────────────────────────

    def get_feed(self, user_ids: List[str], skip: int = 0, limit: int = 20) -> List[dict]:
        """Get posts from followed users - only original posts, no replies"""
        posts = list(self.posts.find(
            {
                "author_id": {"$in": user_ids},
                "is_deleted": False,
                "is_repost": False,
                "reply_to_post_id": None,  # Exclude replies/comments
                "visibility": {"$in": ["public", "followers"]}
            }
        ).sort("created_at", -1).skip(skip).limit(limit))
        
        return [serialize_doc(post) for post in posts]

    def get_user_posts(self, user_id: str, skip: int = 0, limit: int = 20) -> List[dict]:
        """Get user's original posts (no replies)"""
        posts = list(self.posts.find(
            {
                "author_id": user_id,
                "is_deleted": False,
                "reply_to_post_id": None,  # Exclude replies
            }
        ).sort("created_at", -1).skip(skip).limit(limit))
        
        return [serialize_doc(post) for post in posts]

    def get_trending_posts(self, hours: int = 24, limit: int = 20) -> List[dict]:
        """Get trending posts"""
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        posts = list(self.posts.find(
            {
                "created_at": {"$gte": cutoff},
                "is_deleted": False,
                "visibility": "public"
            }
        ).sort([("likes_count", -1), ("comments_count", -1)]).limit(limit))
        
        return [serialize_doc(post) for post in posts]

    def get_replies(self, post_id: str, skip: int = 0, limit: int = 20) -> List[dict]:
        """Get all replies to a post (including nested replies)"""
        # Get all replies recursively
        all_replies = []
        
        def fetch_nested_replies(parent_id: str):
            replies = list(self.posts.find(
                {"reply_to_post_id": parent_id, "is_deleted": False}
            ).sort("created_at", 1))
            
            for reply in replies:
                all_replies.append(serialize_doc(reply))
                # Recursively fetch replies to this reply
                fetch_nested_replies(reply["_id"])
        
        # Start with direct replies to the post
        fetch_nested_replies(ObjectId(post_id))
        
        # Apply pagination to the flattened list
        return all_replies[skip:skip + limit] if limit else all_replies

    def count_replies(self, post_id: str) -> int:
        """Count replies to a post"""
        return self.posts.count_documents({"reply_to_post_id": post_id, "is_deleted": False})

    def count_user_posts(self, user_id: str) -> int:
        """Count user's posts"""
        return self.posts.count_documents({"author_id": user_id, "is_deleted": False})

    # ─── Likes ────────────────────────────────────────────────────────────────

    def like_post(self, user_id: str, post_id: str) -> bool:
        """Like a post"""
        try:
            like_doc = create_like_document(user_id, post_id)
            self.likes.insert_one(like_doc)
            # Increment count
            self.posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$inc": {"likes_count": 1}}
            )
            return True
        except DuplicateKeyError:
            return False

    def unlike_post(self, user_id: str, post_id: str) -> bool:
        """Unlike a post"""
        result = self.likes.delete_one({"user_id": user_id, "post_id": post_id})
        if result.deleted_count > 0:
            # Decrement count
            self.posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$inc": {"likes_count": -1}}
            )
            return True
        return False

    def is_liked(self, user_id: str, post_id: str) -> bool:
        """Check if user liked post"""
        return self.likes.count_documents({"user_id": user_id, "post_id": post_id}) > 0

    def get_post_likes(self, post_id: str, skip: int = 0, limit: int = 20) -> List[str]:
        """Get user IDs who liked the post"""
        likes = self.likes.find({"post_id": post_id}).sort("created_at", -1).skip(skip).limit(limit)
        return [like["user_id"] for like in likes]

    # ─── Bookmarks ────────────────────────────────────────────────────────────

    def bookmark_post(self, user_id: str, post_id: str) -> bool:
        """Bookmark a post"""
        try:
            bookmark_doc = create_bookmark_document(user_id, post_id)
            self.bookmarks.insert_one(bookmark_doc)
            return True
        except DuplicateKeyError:
            return False

    def unbookmark_post(self, user_id: str, post_id: str) -> bool:
        """Remove bookmark"""
        result = self.bookmarks.delete_one({"user_id": user_id, "post_id": post_id})
        return result.deleted_count > 0

    def is_bookmarked(self, user_id: str, post_id: str) -> bool:
        """Check if user bookmarked post"""
        return self.bookmarks.count_documents({"user_id": user_id, "post_id": post_id}) > 0

    def get_user_bookmarks(self, user_id: str, skip: int = 0, limit: int = 20) -> List[str]:
        """Get user's bookmarked post IDs"""
        bookmarks = self.bookmarks.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        return [b["post_id"] for b in bookmarks]

    def count_user_bookmarks(self, user_id: str) -> int:
        """Count user's bookmarks"""
        return self.bookmarks.count_documents({"user_id": user_id})

    # ─── Reposts ──────────────────────────────────────────────────────────────

    def create_repost(self, user_id: str, original_post_id: str, content: str = "") -> Optional[str]:
        """Create a repost"""
        repost_doc = create_repost_document(user_id, original_post_id, content)
        result = self.posts.insert_one(repost_doc)
        
        # Increment repost count on original
        self.posts.update_one(
            {"_id": ObjectId(original_post_id)},
            {"$inc": {"reposts_count": 1}}
        )
        
        return str(result.inserted_id)

    def delete_repost(self, user_id: str, original_post_id: str) -> bool:
        """Delete a repost"""
        result = self.posts.delete_one({
            "author_id": user_id,
            "original_post_id": original_post_id,
            "is_repost": True
        })
        
        if result.deleted_count > 0:
            # Decrement repost count
            self.posts.update_one(
                {"_id": ObjectId(original_post_id)},
                {"$inc": {"reposts_count": -1}}
            )
            return True
        return False

    def is_reposted(self, user_id: str, post_id: str) -> bool:
        """Check if user reposted"""
        return self.posts.count_documents({
            "author_id": user_id,
            "original_post_id": post_id,
            "is_repost": True
        }) > 0

    # ─── Views ────────────────────────────────────────────────────────────────

    def track_view(self, post_id: str, user_id: str = None, ip_address: str = None) -> bool:
        """Track post view - deduplicated per user per 24h"""
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(hours=24)

        # Dedup: same user + same post within 24h = skip
        if user_id:
            already_viewed = self.views.count_documents({
                "user_id": user_id,
                "post_id": post_id,
                "created_at": {"$gte": cutoff},
            })
            if already_viewed:
                return False
        else:
            # Anonymous: dedup by IP within 1h
            if ip_address:
                cutoff_ip = datetime.utcnow() - timedelta(hours=1)
                already_viewed = self.views.count_documents({
                    "ip_address": ip_address,
                    "post_id": post_id,
                    "created_at": {"$gte": cutoff_ip},
                })
                if already_viewed:
                    return False

        view_doc = create_view_document(post_id, user_id, ip_address)
        self.views.insert_one(view_doc)

        self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"views_count": 1}}
        )
        return True

    # ─── Counts ───────────────────────────────────────────────────────────────

    def increment_comments_count(self, post_id: str) -> bool:
        """Increment comments count"""
        result = self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"comments_count": 1}}
        )
        return result.modified_count > 0

    def decrement_comments_count(self, post_id: str) -> bool:
        """Decrement comments count"""
        result = self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"comments_count": -1}}
        )
        return result.modified_count > 0
