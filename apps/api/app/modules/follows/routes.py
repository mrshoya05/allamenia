"""
Follow routes - API endpoints for follow operations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Annotated

from .service import FollowService
from .schema import (
    FollowResponse,
    FollowStatusResponse,
    FollowersResponse,
    FollowingResponse,
    PendingRequestsResponse,
    FollowStatsResponse,
)
from ...core.dependencies import get_current_user
from ...database.database import db

router = APIRouter(prefix="/follows", tags=["follows"])


def get_follow_service() -> FollowService:
    return FollowService(db)


@router.post("/{user_id}", response_model=FollowResponse)
async def follow_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Follow a user
    - If account is private, creates a pending request
    - If account is public, follows immediately
    """
    service = get_follow_service()
    result = service.follow_user(str(current_user["_id"]), user_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.delete("/{user_id}", response_model=FollowResponse)
async def unfollow_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Unfollow a user"""
    service = get_follow_service()
    result = service.unfollow_user(str(current_user["_id"]), user_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.delete("/remove/{follower_id}", response_model=FollowResponse)
async def remove_follower(
    follower_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Remove a follower from your followers list (Instagram-style)"""
    service = get_follow_service()
    # The follower is unfollowing the current user
    result = service.unfollow_user(follower_id, str(current_user["_id"]))
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.get("/status/{user_id}", response_model=FollowStatusResponse)
async def get_follow_status(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Check if current user follows the specified user"""
    service = get_follow_service()
    return service.get_follow_status(str(current_user["_id"]), user_id)


@router.get("/{user_id}/followers", response_model=FollowersResponse)
async def get_followers(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of followers for a user with follow-back status"""
    service = get_follow_service()
    viewer_id = str(current_user["_id"])
    return service.get_followers(user_id, viewer_id, page, limit)


@router.get("/{user_id}/following", response_model=FollowingResponse)
async def get_following(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of users that a user is following with follow-back status"""
    service = get_follow_service()
    viewer_id = str(current_user["_id"])
    return service.get_following(user_id, viewer_id, page, limit)


@router.get("/requests/pending", response_model=PendingRequestsResponse)
async def get_pending_requests(
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get pending follow requests for current user (private accounts)"""
    service = get_follow_service()
    return service.get_pending_requests(str(current_user["_id"]), page, limit)


@router.post("/requests/{follower_id}/accept", response_model=FollowResponse)
async def accept_follow_request(
    follower_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Accept a pending follow request"""
    service = get_follow_service()
    result = service.accept_follow_request(str(current_user["_id"]), follower_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.post("/requests/{follower_id}/reject", response_model=FollowResponse)
async def reject_follow_request(
    follower_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Reject a pending follow request"""
    service = get_follow_service()
    result = service.reject_follow_request(str(current_user["_id"]), follower_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.get("/{user_id}/stats", response_model=FollowStatsResponse)
async def get_follow_stats(
    user_id: str,
):
    """Get follow statistics for a user"""
    service = get_follow_service()
    return service.get_follow_stats(user_id)
