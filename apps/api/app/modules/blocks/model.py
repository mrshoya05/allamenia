"""
Block model - Separate collection for scalability
"""

from datetime import datetime

# Block document schema
BLOCK_SCHEMA = {
    "_id": "ObjectId",
    "blocker_id": "str",  # User who blocked
    "blocked_id": "str",  # User who is blocked
    "created_at": "datetime",
}

# Indexes for performance
BLOCK_INDEXES = [
    # Query: Get all users blocked by a user
    {"keys": [("blocker_id", 1)], "name": "blocker_id_idx"},
    # Query: Check if user A blocked user B
    {"keys": [("blocker_id", 1), ("blocked_id", 1)], "name": "block_check", "unique": True},
    # Query: Get all users who blocked a specific user
    {"keys": [("blocked_id", 1)], "name": "blocked_id_idx"},
]


def create_block_document(blocker_id: str, blocked_id: str) -> dict:
    """Create a new block document"""
    return {
        "blocker_id": blocker_id,
        "blocked_id": blocked_id,
        "created_at": datetime.utcnow(),
    }
