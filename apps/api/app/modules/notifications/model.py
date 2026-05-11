"""
Notification model - Advanced notification system
"""

from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    # Social
    LIKE = "like"
    COMMENT = "comment"
    COMMENT_LIKE = "comment_like"
    COMMENT_REPLY = "comment_reply"
    REPOST = "repost"
    MENTION = "mention"
    # Follow
    FOLLOW = "follow"
    FOLLOW_REQUEST = "follow_request"
    FOLLOW_ACCEPTED = "follow_accepted"
    # System
    SYSTEM = "system"
    WELCOME = "welcome"


NOTIFICATION_INDEXES = [
    {"keys": [("user_id", 1), ("created_at", -1)], "name": "user_notifications"},
    {"keys": [("user_id", 1), ("is_read", 1)], "name": "unread_notifications"},
    {"keys": [("user_id", 1), ("type", 1)], "name": "user_type_notifications"},
    {"keys": [("created_at", 1)], "name": "created_at_ttl", "expireAfterSeconds": 7776000},  # 90 days
]


def create_notification(
    user_id: str,
    notification_type: str,
    actor_id: str = None,
    post_id: str = None,
    comment_id: str = None,
    message: str = None,   # For system notifications
) -> dict:
    return {
        "user_id": user_id,
        "actor_id": actor_id,
        "type": notification_type,
        "post_id": post_id,
        "comment_id": comment_id,
        "message": message,
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
