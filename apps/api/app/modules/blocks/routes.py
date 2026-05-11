"""
Block routes - API endpoints for blocking users
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from ...core.dependencies import get_current_user
from ...database.database import db
from .repository import BlockRepository
from ..users import repository as user_repo

router = APIRouter(prefix="/blocks", tags=["blocks"])


def get_block_repo() -> BlockRepository:
    return BlockRepository(db)


@router.post("/{user_id}")
async def block_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Block a user"""
    blocker_id = str(current_user["_id"])
    
    if blocker_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    
    # Check if user exists
    target_user = user_repo.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    block_repo = get_block_repo()
    success = block_repo.block_user(blocker_id, user_id)
    
    if not success:
        return {"success": False, "message": "User already blocked"}
    
    # TODO: Unfollow both ways when blocking
    
    return {"success": True, "message": "User blocked successfully"}


@router.delete("/{user_id}")
async def unblock_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Unblock a user"""
    blocker_id = str(current_user["_id"])
    
    block_repo = get_block_repo()
    success = block_repo.unblock_user(blocker_id, user_id)
    
    if not success:
        return {"success": False, "message": "User not blocked"}
    
    return {"success": True, "message": "User unblocked successfully"}


@router.get("/list")
async def get_blocked_users(
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = 1,
    limit: int = 20,
):
    """Get list of blocked users"""
    user_id = str(current_user["_id"])
    skip = (page - 1) * limit
    
    block_repo = get_block_repo()
    blocked_ids = block_repo.get_blocked_users(user_id, skip, limit)
    
    # Get user details
    users = user_repo.get_users_by_ids(blocked_ids)
    
    total = block_repo.count_blocked_users(user_id)
    
    return {
        "users": users,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": skip + len(users) < total,
    }


@router.get("/check/{user_id}")
async def check_block_status(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Check if current user has blocked or is blocked by another user"""
    my_id = str(current_user["_id"])
    
    block_repo = get_block_repo()
    i_blocked_them = block_repo.is_blocked(my_id, user_id)
    they_blocked_me = block_repo.is_blocked(user_id, my_id)
    
    return {
        "i_blocked_them": i_blocked_them,
        "they_blocked_me": they_blocked_me,
        "is_blocking_or_blocked": i_blocked_them or they_blocked_me,
    }
