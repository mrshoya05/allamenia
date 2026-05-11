"""
Follow schemas for request/response validation
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class FollowResponse(BaseModel):
    """Response when following/unfollowing a user"""
    success: bool
    message: str
    status: Optional[str] = None  # 'active' or 'pending'


class FollowStatusResponse(BaseModel):
    """Response for follow status check"""
    is_following: bool
    status: Optional[str] = None  # 'active', 'pending', or None


class UserFollowInfo(BaseModel):
    """Basic user info for followers/following lists"""
    id: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    bio: Optional[str]


class FollowersResponse(BaseModel):
    """Response for followers list"""
    users: List[UserFollowInfo]
    total: int
    page: int
    limit: int
    has_more: bool


class FollowingResponse(BaseModel):
    """Response for following list"""
    users: List[UserFollowInfo]
    total: int
    page: int
    limit: int
    has_more: bool


class PendingRequestsResponse(BaseModel):
    """Response for pending follow requests"""
    users: List[UserFollowInfo]
    total: int
    page: int
    limit: int
    has_more: bool


class FollowStatsResponse(BaseModel):
    """Follow statistics for a user"""
    followers_count: int
    following_count: int
    pending_requests_count: int = 0
