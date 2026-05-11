from bson import ObjectId
from datetime import datetime, timezone
from app.database.database import db

collection = db["users"]


def _serialize(user: dict) -> dict:
    """Convert ObjectId to string for API responses."""
    if user and "_id" in user:
        user["id"] = str(user["_id"])
    return user


# ─── Read ─────────────────────────────────────────────────────────────────────

def get_user_by_email(email: str) -> dict:
    return collection.find_one({"email": email, "is_deleted": {"$ne": True}})


def get_user_by_username(username: str) -> dict:
    return collection.find_one({"username": username, "is_deleted": {"$ne": True}})


def get_user_by_id(user_id: str) -> dict:
    try:
        return collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def get_users_by_ids(user_ids: list) -> list:
    object_ids = [ObjectId(uid) for uid in user_ids]
    users = list(collection.find({"_id": {"$in": object_ids}, "is_deleted": {"$ne": True}}))
    for u in users:
        u["id"] = str(u.pop("_id"))
    return users


def search_users(query: str, skip: int = 0, limit: int = 20) -> list:
    users = list(collection.find(
        {
            "$or": [
                {"username": {"$regex": query, "$options": "i"}},
                {"full_name": {"$regex": query, "$options": "i"}},
            ],
            "is_deleted": {"$ne": True},
            "is_banned": {"$ne": True},
        },
        {"password": 0}
    ).skip(skip).limit(limit))
    for u in users:
        u["id"] = str(u.pop("_id"))
    return users


def get_suggested_users(exclude_ids: list, limit: int = 10) -> list:
    """Get users to suggest (excluding current user and already-following)"""
    object_ids = []
    for uid in exclude_ids:
        try:
            object_ids.append(ObjectId(uid))
        except Exception:
            pass

    users = list(collection.find(
        {
            "_id": {"$nin": object_ids},
            "is_deleted": {"$ne": True},
            "is_banned": {"$ne": True},
        },
        {"password": 0}
    ).sort("followers_count", -1).limit(limit))

    for u in users:
        u["id"] = str(u.pop("_id"))
    return users


# ─── Write ────────────────────────────────────────────────────────────────────

def create_user(user_data: dict) -> dict:
    result = collection.insert_one(user_data)
    return collection.find_one({"_id": result.inserted_id})


def update_user(user_id: str, update_data: dict) -> dict:
    update_data["updated_at"] = datetime.now(timezone.utc)
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return get_user_by_id(user_id)


def soft_delete_user(user_id: str) -> bool:
    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "is_deleted": True,
            "deleted_at": datetime.now(timezone.utc),
            "email": f"deleted_{user_id}@deleted.com",  # free up email
            "username": f"deleted_{user_id}",           # free up username
        }}
    )
    return result.modified_count > 0


def hard_delete_user(user_id: str) -> bool:
    result = collection.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0


def update_last_seen(user_id: str):
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_seen": datetime.now(timezone.utc)}}
    )


# ─── Social Graph ─────────────────────────────────────────────────────────────

def follow_user(follower_id: str, target_id: str):
    """Add follower_id to target's followers, add target_id to follower's following."""
    collection.update_one(
        {"_id": ObjectId(target_id)},
        {"$addToSet": {"followers": follower_id}, "$inc": {"followers_count": 1}}
    )
    collection.update_one(
        {"_id": ObjectId(follower_id)},
        {"$addToSet": {"following": target_id}, "$inc": {"following_count": 1}}
    )


def unfollow_user(follower_id: str, target_id: str):
    collection.update_one(
        {"_id": ObjectId(target_id)},
        {"$pull": {"followers": follower_id}, "$inc": {"followers_count": -1}}
    )
    collection.update_one(
        {"_id": ObjectId(follower_id)},
        {"$pull": {"following": target_id}, "$inc": {"following_count": -1}}
    )


def block_user(blocker_id: str, target_id: str):
    collection.update_one(
        {"_id": ObjectId(blocker_id)},
        {"$addToSet": {"blocked_users": target_id}}
    )
    # Also unfollow both ways if they were following
    unfollow_user(blocker_id, target_id)
    unfollow_user(target_id, blocker_id)


def unblock_user(blocker_id: str, target_id: str):
    collection.update_one(
        {"_id": ObjectId(blocker_id)},
        {"$pull": {"blocked_users": target_id}}
    )


def increment_posts_count(user_id: str, amount: int = 1):
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"posts_count": amount}}
    )


# ─── Follow Count Helpers (for new follow system) ────────────────────────────

def increment_followers_count(user_id: str, amount: int = 1):
    """Increment followers count (denormalized counter)"""
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"followers_count": amount}}
    )


def decrement_followers_count(user_id: str, amount: int = 1):
    """Decrement followers count (denormalized counter)"""
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"followers_count": -amount}}
    )


def increment_following_count(user_id: str, amount: int = 1):
    """Increment following count (denormalized counter)"""
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"following_count": amount}}
    )


def decrement_following_count(user_id: str, amount: int = 1):
    """Decrement following count (denormalized counter)"""
    collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"following_count": -amount}}
    )
