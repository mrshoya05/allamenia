# User document structure for MongoDB
# This serves as documentation for the user collection schema

USER_MODEL = {
    "_id": "ObjectId",
    "username": "str - unique, 3-30 chars",
    "email": "str - unique, lowercase",
    "password": "str - bcrypt hashed",
    "full_name": "str - optional",
    "bio": "str - optional, max 160 chars",
    "avatar_url": "str - profile picture URL",
    "cover_url": "str - cover photo URL",
    "website": "str - optional personal website",
    "location": "str - optional",
    "date_of_birth": "datetime - optional",
    "role": "str - user | admin | moderator",

    # Social graph (stored as lists of user_ids)
    "followers": "List[str] - user_ids who follow this user",
    "following": "List[str] - user_ids this user follows",
    "blocked_users": "List[str] - user_ids this user has blocked",

    # Counts (denormalized for performance)
    "followers_count": "int",
    "following_count": "int",
    "posts_count": "int",

    # Account status
    "is_verified": "bool - blue tick",
    "is_private": "bool - private account",
    "is_banned": "bool - banned by admin",
    "is_deleted": "bool - soft delete flag",
    "deleted_at": "datetime - when soft deleted",

    # AI features
    "ai_interests": "List[str] - topics for AI feed personalization",
    "ai_embedding": "List[float] - user profile vector for recommendations",

    # Metadata
    "last_seen": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
}
