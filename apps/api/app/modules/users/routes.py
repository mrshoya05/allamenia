from fastapi import APIRouter, Depends, Query
from app.modules.users.schema import (
    UserCreate, UserLogin, UserUpdate,
    ChangePasswordRequest, RefreshTokenRequest
)
from app.modules.users import service
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# ─── Auth ─────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
def signup(data: UserCreate):
    return service.register_user(data)


@router.post("/login")
def login(data: UserLogin):
    return service.login_user(data)


@router.post("/refresh")
def refresh(data: RefreshTokenRequest):
    return service.refresh_access_token(data.refresh_token)


# ─── Profile ──────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return service.get_user_profile(current_user["username"], user_id)


@router.put("/me")
def update_me(data: UserUpdate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return service.update_user_profile(user_id, data)


@router.put("/me/password")
def change_password(data: ChangePasswordRequest, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.change_password(user_id, data.current_password, data.new_password)
    return {"message": "Password updated successfully"}


@router.delete("/me")
def soft_delete_me(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.soft_delete_account(user_id)
    return {"message": "Account deactivated"}


@router.delete("/me/hard")
def hard_delete_me(current_user=Depends(get_current_user)):
    """Permanently delete account — irreversible."""
    user_id = str(current_user["_id"])
    service.hard_delete_account(user_id)
    return {"message": "Account permanently deleted"}


@router.get("/suggestions")
def get_suggestions(
    limit: int = Query(default=10, le=20),
    current_user=Depends(get_current_user)
):
    """Get suggested users to follow (excludes self + already following)"""
    from app.modules.follows.repository import FollowRepository
    from app.database.database import db as _db
    user_id = str(current_user["_id"])
    follow_repo = FollowRepository(_db)
    following_ids = follow_repo.get_following(user_id, limit=10000)
    exclude = [user_id] + following_ids
    users = service.get_suggested_users(exclude, limit)
    return {"users": users}


@router.get("/search")
def search_users(
    q: str = Query(min_length=1),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=50),
    current_user=Depends(get_current_user)
):
    current_user_id = str(current_user["_id"])
    users = service.search_users_service(q, skip, limit, current_user_id)
    return {"results": users, "count": len(users)}


@router.get("/{username}")
def get_profile(username: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return service.get_user_profile(username, user_id)


# ─── Social ───────────────────────────────────────────────────────────────────

@router.post("/{username}/follow")
def follow(username: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.follow_user_service(user_id, username)
    return {"message": f"Now following {username}"}


@router.delete("/{username}/follow")
def unfollow(username: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.unfollow_user_service(user_id, username)
    return {"message": f"Unfollowed {username}"}


@router.post("/{username}/block")
def block(username: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.block_user_service(user_id, username)
    return {"message": f"Blocked {username}"}


@router.delete("/{username}/block")
def unblock(username: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    service.unblock_user_service(user_id, username)
    return {"message": f"Unblocked {username}"}


@router.get("/{username}/followers")
def get_followers(
    username: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=50),
    current_user=Depends(get_current_user)
):
    followers = service.get_followers(username, skip, limit)
    return {"followers": followers, "count": len(followers)}


@router.get("/{username}/following")
def get_following(
    username: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=50),
    current_user=Depends(get_current_user)
):
    following = service.get_following(username, skip, limit)
    return {"following": following, "count": len(following)}
