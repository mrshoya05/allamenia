"""
Follow relationship model
Separate collection for scalability
"""

from datetime import datetime
from typing import Optional

# Follow document schema
FOLLOW_SCHEMA = {
    "_id": "ObjectId",
    "follower_id": "str",  # User who is following
    "following_id": "str",  # User being followed
    "created_at": "datetime",
    "status": "str",  # 'active', 'pending' (for private accounts)
}

# Indexes for performance
FOLLOW_INDEXES = [
    # Query: Get all followers of a user
    {"keys": [("following_id", 1), ("status", 1)], "name": "following_id_status"},
    # Query: Get all users a user is following
    {"keys": [("follower_id", 1), ("status", 1)], "name": "follower_id_status"},
    # Unique constraint: Can't follow same user twice
    {"keys": [("follower_id", 1), ("following_id", 1)], "name": "unique_follow", "unique": True},
    # Query: Check if user A follows user B
    {"keys": [("follower_id", 1), ("following_id", 1), ("status", 1)], "name": "follow_check"},
]


def create_follow_document(follower_id: str, following_id: str, status: str = "active") -> dict:
    """Create a new follow document"""
    return {
        "follower_id": follower_id,
        "following_id": following_id,
        "created_at": datetime.utcnow(),
        "status": status,
    }
