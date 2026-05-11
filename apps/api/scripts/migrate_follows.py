"""
Migration script to move followers/following from user documents to separate follows collection

Run this once to migrate existing data:
    python -m scripts.migrate_follows
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database.database import db
from app.modules.follows.model import create_follow_document, FOLLOW_INDEXES
from datetime import datetime


def migrate_follows():
    """Migrate followers/following arrays to separate collection"""
    users_collection = db["users"]
    follows_collection = db["follows"]

    print("🔄 Starting follow migration...")

    # Create indexes first
    print("📊 Creating indexes...")
    for index in FOLLOW_INDEXES:
        keys = index.pop("keys")
        try:
            follows_collection.create_index(keys, **index)
            print(f"  ✓ Created index: {index.get('name', 'unnamed')}")
        except Exception as e:
            print(f"  ⚠️  Index might already exist: {e}")

    # Get all users with followers or following
    users = users_collection.find({
        "$or": [
            {"followers": {"$exists": True, "$ne": []}},
            {"following": {"$exists": True, "$ne": []}}
        ]
    })

    total_follows = 0
    migrated_users = 0
    errors = 0

    for user in users:
        user_id = str(user["_id"])
        migrated_users += 1

        # Migrate followers (people who follow this user)
        followers = user.get("followers", [])
        for follower_id in followers:
            try:
                follow_doc = create_follow_document(follower_id, user_id, "active")
                follows_collection.insert_one(follow_doc)
                total_follows += 1
            except Exception as e:
                # Might be duplicate, skip
                if "duplicate" not in str(e).lower():
                    print(f"  ⚠️  Error migrating follower {follower_id} -> {user_id}: {e}")
                    errors += 1

        # Migrate following (people this user follows)
        following = user.get("following", [])
        for following_id in following:
            try:
                follow_doc = create_follow_document(user_id, following_id, "active")
                follows_collection.insert_one(follow_doc)
                total_follows += 1
            except Exception as e:
                # Might be duplicate, skip
                if "duplicate" not in str(e).lower():
                    print(f"  ⚠️  Error migrating following {user_id} -> {following_id}: {e}")
                    errors += 1

        if migrated_users % 100 == 0:
            print(f"  📦 Processed {migrated_users} users, {total_follows} follows...")

    print(f"\n✅ Migration complete!")
    print(f"  👥 Users processed: {migrated_users}")
    print(f"  🔗 Follows created: {total_follows}")
    print(f"  ❌ Errors: {errors}")

    # Verify counts
    print(f"\n🔍 Verifying data...")
    follows_count = follows_collection.count_documents({})
    print(f"  Total follows in new collection: {follows_count}")

    # Optional: Remove old arrays from user documents (uncomment to clean up)
    # print("\n🧹 Cleaning up old data...")
    # users_collection.update_many(
    #     {},
    #     {"$unset": {"followers": "", "following": ""}}
    # )
    # print("  ✓ Removed followers/following arrays from user documents")

    print("\n⚠️  Note: Old followers/following arrays are still in user documents.")
    print("   Uncomment cleanup code in script to remove them after verifying migration.")


if __name__ == "__main__":
    try:
        migrate_follows()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
