"""
Post interactions - Likes, bookmarks, views
Separate collections for scalability
"""

from datetime import datetime

# Like document schema
LIKE_SCHEMA = {
    "_id": "ObjectId",
    "user_id": "str",
    "post_id": "str",
    "created_at": "datetime",
}

# Bookmark document schema
BOOKMARK_SCHEMA = {
    "_id": "ObjectId",
    "user_id": "str",
    "post_id": "str",
    "created_at": "datetime",
}

# View document schema (for analytics)
VIEW_SCHEMA = {
    "_id": "ObjectId",
    "user_id": "str",  # Can be null for anonymous
    "post_id": "str",
    "created_at": "datetime",
    "ip_address": "str",  # For deduplication
}

# Indexes
LIKE_INDEXES = [
    {"keys": [("post_id", 1), ("created_at", -1)], "name": "post_likes"},
    {"keys": [("user_id", 1), ("created_at", -1)], "name": "user_likes"},
    {"keys": [("user_id", 1), ("post_id", 1)], "name": "unique_like", "unique": True},
]

BOOKMARK_INDEXES = [
    {"keys": [("user_id", 1), ("created_at", -1)], "name": "user_bookmarks"},
    {"keys": [("user_id", 1), ("post_id", 1)], "name": "unique_bookmark", "unique": True},
]

VIEW_INDEXES = [
    {"keys": [("post_id", 1), ("created_at", -1)], "name": "post_views"},
    {"keys": [("user_id", 1), ("post_id", 1), ("created_at", -1)], "name": "user_post_views"},
]


def create_like_document(user_id: str, post_id: str) -> dict:
    return {
        "user_id": user_id,
        "post_id": post_id,
        "created_at": datetime.utcnow(),
    }


def create_bookmark_document(user_id: str, post_id: str) -> dict:
    return {
        "user_id": user_id,
        "post_id": post_id,
        "created_at": datetime.utcnow(),
    }


def create_view_document(post_id: str, user_id: str = None, ip_address: str = None) -> dict:
    return {
        "user_id": user_id,
        "post_id": post_id,
        "ip_address": ip_address,
        "created_at": datetime.utcnow(),
    }
