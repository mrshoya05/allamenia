"""
Notification routes
"""

from fastapi import APIRouter, Depends, Query
from typing import Annotated

from ...core.dependencies import get_current_user
from ...database.database import db
from .repository import NotificationRepository
from ..users import repository as user_repo

router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_notif_repo() -> NotificationRepository:
    return NotificationRepository(db)


@router.get("")
async def get_notifications(
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type_filter: str = Query(None),
):
    """Get user notifications with optional type filter"""
    user_id = str(current_user["_id"])
    skip = (page - 1) * limit
    
    notif_repo = get_notif_repo()
    notifications = notif_repo.get_notifications(user_id, skip, limit, type_filter)
    
    # Enrich with actor details
    for notif in notifications:
        if notif.get("actor_id"):
            actor = user_repo.get_user_by_id(notif["actor_id"])
            if actor:
                notif["actor"] = {
                    "id": str(actor["_id"]),
                    "username": actor["username"],
                    "full_name": actor.get("full_name"),
                    "avatar_url": actor.get("avatar_url"),
                    "is_verified": actor.get("is_verified", False),
                }
    
    return {
        "notifications": notifications,
        "page": page,
        "limit": limit,
        "has_more": len(notifications) == limit,
    }


@router.get("/pending-requests")
async def get_pending_follow_requests(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Get pending follow requests (for private accounts)"""
    user_id = str(current_user["_id"])
    notif_repo = get_notif_repo()
    notifications = notif_repo.get_pending_follow_requests(user_id)
    
    # Enrich with actor details
    for notif in notifications:
        if notif.get("actor_id"):
            actor = user_repo.get_user_by_id(notif["actor_id"])
            if actor:
                notif["actor"] = {
                    "id": str(actor["_id"]),
                    "username": actor["username"],
                    "full_name": actor.get("full_name"),
                    "avatar_url": actor.get("avatar_url"),
                    "is_verified": actor.get("is_verified", False),
                    "bio": actor.get("bio"),
                }
    
    return {"requests": notifications}


@router.get("/unread-count")
async def get_unread_count(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Get unread notification counts by category"""
    user_id = str(current_user["_id"])
    notif_repo = get_notif_repo()
    counts = notif_repo.get_counts_by_type(user_id)
    return counts


@router.post("/follow-requests/{actor_id}/accept")
async def accept_follow_request(
    actor_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Accept a follow request"""
    from ..follows.service import FollowService
    user_id = str(current_user["_id"])
    
    follow_service = FollowService(db)
    result = follow_service.accept_follow_request(user_id, actor_id)
    
    if result["success"]:
        notif_repo = get_notif_repo()
        notif_repo.resolve_follow_request_notification(user_id, actor_id)
    
    return result


@router.post("/follow-requests/{actor_id}/reject")
async def reject_follow_request(
    actor_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Reject a follow request"""
    from ..follows.service import FollowService
    user_id = str(current_user["_id"])
    
    follow_service = FollowService(db)
    result = follow_service.reject_follow_request(user_id, actor_id)
    
    if result["success"]:
        notif_repo = get_notif_repo()
        notif_repo.resolve_follow_request_notification(user_id, actor_id)
    
    return result


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Mark notification as read"""
    user_id = str(current_user["_id"])
    notif_repo = get_notif_repo()
    success = notif_repo.mark_as_read(notification_id, user_id)
    return {"success": success}


@router.post("/read-all")
async def mark_all_as_read(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Mark all notifications as read"""
    user_id = str(current_user["_id"])
    notif_repo = get_notif_repo()
    count = notif_repo.mark_all_as_read(user_id)
    return {"success": True, "count": count}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a notification"""
    user_id = str(current_user["_id"])
    notif_repo = get_notif_repo()
    success = notif_repo.delete_notification(notification_id, user_id)
    return {"success": success}
