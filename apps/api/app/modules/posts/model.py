"""
Post model - Scalable design for social media posts
Supports: text, images, videos, audio, PDFs, links
"""

from datetime import datetime
from typing import Optional, List

# Media types
MEDIA_TYPES = ["image", "video", "audio", "pdf", "link"]

# Post document schema
POST_SCHEMA = {
    "_id": "ObjectId",
    "author_id": "str",  # User who created the post
    "content": "str",  # Text content (optional if media present)
    "media": [  # Array of media attachments
        {
            "type": "str",  # image | video | audio | pdf | link
            "url": "str",  # Media URL
            "thumbnail_url": "str",  # Optional thumbnail for videos
            "duration": "int",  # For video/audio (seconds)
            "size": "int",  # File size in bytes
            "mime_type": "str",  # e.g., image/jpeg, video/mp4
            "width": "int",  # For images/videos
            "height": "int",  # For images/videos
        }
    ],
    "link_preview": {  # For shared links
        "url": "str",
        "title": "str",
        "description": "str",
        "image": "str",
        "domain": "str",
    },
    # Engagement (denormalized for performance)
    "likes_count": "int",
    "comments_count": "int",
    "reposts_count": "int",
    "views_count": "int",
    # Metadata
    "is_repost": "bool",
    "original_post_id": "str",  # If repost
    "reply_to_post_id": "str",  # If reply/comment
    "reply_to_user_id": "str",  # If reply
    # Privacy & moderation
    "visibility": "str",  # public | followers | private
    "is_pinned": "bool",
    "is_deleted": "bool",
    "is_edited": "bool",
    "edited_at": "datetime",
    # Timestamps
    "created_at": "datetime",
    "updated_at": "datetime",
}

# Indexes for performance
POST_INDEXES = [
    # Feed queries: Get posts from followed users
    {"keys": [("author_id", 1), ("created_at", -1)], "name": "author_timeline"},
    # Get user's posts
    {"keys": [("author_id", 1), ("is_deleted", 1), ("created_at", -1)], "name": "user_posts"},
    # Get replies to a post
    {"keys": [("reply_to_post_id", 1), ("created_at", 1)], "name": "post_replies"},
    # Get reposts of a post
    {"keys": [("original_post_id", 1), ("created_at", -1)], "name": "post_reposts"},
    # Search by content (text index)
    {"keys": [("content", "text")], "name": "content_search"},
    # Trending posts (by engagement)
    {"keys": [("created_at", -1), ("likes_count", -1)], "name": "trending"},
]


def create_post_document(
    author_id: str,
    content: str = "",
    media: List[dict] = None,
    link_preview: dict = None,
    visibility: str = "public",
    reply_to_post_id: str = None,
    reply_to_user_id: str = None,
) -> dict:
    """Create a new post document"""
    return {
        "author_id": author_id,
        "content": content,
        "media": media or [],
        "link_preview": link_preview,
        "likes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "views_count": 0,
        "is_repost": False,
        "original_post_id": None,
        "reply_to_post_id": reply_to_post_id,
        "reply_to_user_id": reply_to_user_id,
        "visibility": visibility,
        "is_pinned": False,
        "is_deleted": False,
        "is_edited": False,
        "edited_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def create_repost_document(author_id: str, original_post_id: str, content: str = "") -> dict:
    """Create a repost document"""
    return {
        "author_id": author_id,
        "content": content,  # Optional comment on repost
        "media": [],
        "link_preview": None,
        "likes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "views_count": 0,
        "is_repost": True,
        "original_post_id": original_post_id,
        "reply_to_post_id": None,
        "reply_to_user_id": None,
        "visibility": "public",
        "is_pinned": False,
        "is_deleted": False,
        "is_edited": False,
        "edited_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


# Validation rules
MAX_CONTENT_LENGTH = 5000  # characters
MAX_MEDIA_COUNT = 10  # max attachments per post
MAX_VIDEO_DURATION = 30  # seconds
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
