"""
Post schemas for request/response validation
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional
from enum import Enum


class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"
    LINK = "link"


class Visibility(str, Enum):
    PUBLIC = "public"
    FOLLOWERS = "followers"
    PRIVATE = "private"


class MediaAttachment(BaseModel):
    type: MediaType
    url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None  # seconds
    size: Optional[int] = None  # bytes
    mime_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class LinkPreview(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    domain: Optional[str] = None


class CreatePostRequest(BaseModel):
    content: str = Field("", max_length=5000)
    media: List[MediaAttachment] = Field(default_factory=list, max_items=10)
    link_preview: Optional[LinkPreview] = None
    visibility: Visibility = Visibility.PUBLIC
    reply_to_post_id: Optional[str] = None

    @validator('content', 'media')
    def validate_content_or_media(cls, v, values):
        # At least content or media must be present
        if 'content' in values and not values['content'] and not v:
            raise ValueError('Post must have content or media')
        return v


class UpdatePostRequest(BaseModel):
    content: str = Field(..., max_length=5000)


class CreateRepostRequest(BaseModel):
    content: str = Field("", max_length=500)  # Optional comment


class UserBasic(BaseModel):
    id: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool


class PostResponse(BaseModel):
    id: str
    author: UserBasic
    content: str
    media: List[MediaAttachment]
    link_preview: Optional[LinkPreview]
    likes_count: int
    comments_count: int
    reposts_count: int
    views_count: int
    is_repost: bool
    original_post: Optional['PostResponse'] = None
    reply_to_post_id: Optional[str]
    visibility: str
    is_pinned: bool
    is_edited: bool
    edited_at: Optional[datetime]
    created_at: datetime
    # User-specific fields
    is_liked: bool = False
    is_bookmarked: bool = False
    is_reposted: bool = False


class FeedResponse(BaseModel):
    posts: List[PostResponse]
    page: int
    limit: int
    total: int
    has_more: bool


class LikeResponse(BaseModel):
    success: bool
    message: str
    likes_count: int


class RepostResponse(BaseModel):
    success: bool
    message: str
    repost_id: Optional[str] = None


class BookmarkResponse(BaseModel):
    success: bool
    message: str


# Enable forward references
PostResponse.update_forward_refs()
