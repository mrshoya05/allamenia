"""
Comment schemas for request/response validation
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class CreateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_comment_id: Optional[str] = None


class UpdateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class UserBasic(BaseModel):
    id: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool


class CommentResponse(BaseModel):
    id: str
    post_id: str
    author: UserBasic
    content: str
    parent_comment_id: Optional[str]
    likes_count: int
    replies_count: int
    is_edited: bool
    edited_at: Optional[datetime]
    created_at: datetime
    is_liked: bool = False


class CommentsListResponse(BaseModel):
    comments: List[CommentResponse]
    total: int
