"""
Comment data model
"""

from datetime import datetime
from typing import Optional

MAX_COMMENT_LENGTH = 1000

COMMENT_INDEXES = [
    {"keys": [("post_id", 1), ("created_at", -1)], "name": "post_comments"},
    {"keys": [("parent_comment_id", 1), ("created_at", 1)], "name": "nested_comments"},
    {"keys": [("author_id", 1), ("created_at", -1)], "name": "user_comments"},
]


def create_comment_document(
    post_id: str,
    author_id: str,
    content: str,
    parent_comment_id: Optional[str] = None,
) -> dict:
    """Create a comment document"""
    return {
        "post_id": post_id,
        "author_id": author_id,
        "content": content,
        "parent_comment_id": parent_comment_id,  # For nested replies
        "likes_count": 0,
        "replies_count": 0,
        "is_deleted": False,
        "is_edited": False,
        "edited_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
