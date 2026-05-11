from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.modules.users import repository as repo
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.logger import get_logger

logger = get_logger(__name__)


# ─── Auth Services ────────────────────────────────────────────────────────────

def register_user(data):
    if repo.get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    if repo.get_user_by_username(data.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    user = {
        "username": data.username.lower(),
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "full_name": data.full_name,
        "bio": None,
        "avatar_url": None,
        "cover_url": None,
        "website": None,
        "location": None,
        "date_of_birth": None,
        "role": "user",
        "followers": [],
        "following": [],
        "blocked_users": [],
        "followers_count": 0,
        "following_count": 0,
        "posts_count": 0,
        "is_verified": False,
        "is_private": False,
        "is_banned": False,
        "is_deleted": False,
        "deleted_at": None,
        "ai_interests": [],
        "ai_embedding": None,
        "last_seen": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    created_user = repo.create_user(user)
    logger.info(f"User registered: {created_user['username']}")

    return {
        "id": str(created_user["_id"]),
        "username": created_user["username"],
        "email": created_user["email"],
    }


def login_user(data):
    user = repo.get_user_by_email(data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.get("is_deleted"):
        raise HTTPException(status_code=403, detail="Account has been deleted")

    if user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Account is banned")

    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    repo.update_last_seen(user_id)
    logger.info(f"User logged in: {user['username']}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def refresh_access_token(refresh_token: str):
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = repo.get_user_by_id(user_id)

    if not user or user.get("is_deleted") or user.get("is_banned"):
        raise HTTPException(status_code=401, detail="Invalid user")

    new_access_token = create_access_token({"sub": user_id})

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


# ─── Profile Services ─────────────────────────────────────────────────────────

def get_user_profile(username: str, current_user_id: str = None):
    user = repo.get_user_by_username(username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])

    # Check if blocked
    if current_user_id and current_user_id in user.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this user")

    # Private account check
    if user.get("is_private") and current_user_id != user_id:
        if current_user_id not in user.get("followers", []):
            return {
                "id": user_id,
                "username": user["username"],
                "full_name": user.get("full_name"),
                "avatar_url": user.get("avatar_url"),
                "is_private": True,
                "is_verified": user.get("is_verified", False),
            }

    return {
        "id": user_id,
        "username": user["username"],
        "email": user["email"] if current_user_id == user_id else None,
        "full_name": user.get("full_name"),
        "bio": user.get("bio"),
        "avatar_url": user.get("avatar_url"),
        "cover_url": user.get("cover_url"),
        "website": user.get("website"),
        "location": user.get("location"),
        "is_verified": user.get("is_verified", False),
        "is_private": user.get("is_private", False),
        "followers_count": user.get("followers_count", 0),
        "following_count": user.get("following_count", 0),
        "posts_count": user.get("posts_count", 0),
        "created_at": user.get("created_at"),
        "role": user.get("role") if current_user_id == user_id else None,
        "ai_interests": user.get("ai_interests") if current_user_id == user_id else None,
    }


def update_user_profile(user_id: str, data):
    update_dict = data.model_dump(exclude_unset=True)
    updated_user = repo.update_user(user_id, update_dict)
    logger.info(f"User profile updated: {user_id}")
    if updated_user and "_id" in updated_user:
        updated_user["id"] = str(updated_user.pop("_id"))
    return updated_user


def change_password(user_id: str, current_password: str, new_password: str):
    user = repo.get_user_by_id(user_id)

    if not verify_password(current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    repo.update_user(user_id, {"password": hash_password(new_password)})
    logger.info(f"Password changed for user: {user_id}")


def soft_delete_account(user_id: str):
    success = repo.soft_delete_user(user_id)
    if success:
        logger.info(f"User soft deleted: {user_id}")
    return success


def hard_delete_account(user_id: str):
    success = repo.hard_delete_user(user_id)
    if success:
        logger.info(f"User hard deleted: {user_id}")
    return success


# ─── Social Services ──────────────────────────────────────────────────────────

def follow_user_service(follower_id: str, target_username: str):
    target = repo.get_user_by_username(target_username)

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target_id = str(target["_id"])

    if follower_id == target_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    follower = repo.get_user_by_id(follower_id)
    if target_id in follower.get("blocked_users", []):
        raise HTTPException(status_code=400, detail="You have blocked this user")

    if follower_id in target.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this user")

    repo.follow_user(follower_id, target_id)
    logger.info(f"User {follower_id} followed {target_id}")


def unfollow_user_service(follower_id: str, target_username: str):
    target = repo.get_user_by_username(target_username)

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target_id = str(target["_id"])
    repo.unfollow_user(follower_id, target_id)
    logger.info(f"User {follower_id} unfollowed {target_id}")


def block_user_service(blocker_id: str, target_username: str):
    target = repo.get_user_by_username(target_username)

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target_id = str(target["_id"])

    if blocker_id == target_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    repo.block_user(blocker_id, target_id)
    logger.info(f"User {blocker_id} blocked {target_id}")


def unblock_user_service(blocker_id: str, target_username: str):
    target = repo.get_user_by_username(target_username)

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target_id = str(target["_id"])
    repo.unblock_user(blocker_id, target_id)
    logger.info(f"User {blocker_id} unblocked {target_id}")


def get_followers(username: str, skip: int = 0, limit: int = 20):
    user = repo.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    follower_ids = user.get("followers", [])[skip:skip + limit]
    return repo.get_users_by_ids(follower_ids)


def get_following(username: str, skip: int = 0, limit: int = 20):
    user = repo.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    following_ids = user.get("following", [])[skip:skip + limit]
    return repo.get_users_by_ids(following_ids)


def search_users_service(query: str, skip: int = 0, limit: int = 20):
    return repo.search_users(query, skip, limit)


def get_suggested_users(exclude_ids: list, limit: int = 10):
    return repo.get_suggested_users(exclude_ids, limit)
