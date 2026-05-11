"""
Quick test script for follow system

Run: python -m scripts.test_follows
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database.database import db
from app.modules.follows.service import FollowService


def test_follow_system():
    """Test basic follow operations"""
    service = FollowService(db)

    print("🧪 Testing Follow System\n")

    # Create test users (you need to have these in your DB)
    user1_id = "user1_id_here"  # Replace with actual user ID
    user2_id = "user2_id_here"  # Replace with actual user ID

    print("1️⃣ Testing follow...")
    result = service.follow_user(user1_id, user2_id)
    print(f"   Result: {result}\n")

    print("2️⃣ Testing follow status...")
    status = service.get_follow_status(user1_id, user2_id)
    print(f"   Status: {status}\n")

    print("3️⃣ Testing followers list...")
    followers = service.get_followers(user2_id, page=1, limit=10)
    print(f"   Followers: {followers['total']} total\n")

    print("4️⃣ Testing following list...")
    following = service.get_following(user1_id, page=1, limit=10)
    print(f"   Following: {following['total']} total\n")

    print("5️⃣ Testing stats...")
    stats = service.get_follow_stats(user2_id)
    print(f"   Stats: {stats}\n")

    print("6️⃣ Testing unfollow...")
    result = service.unfollow_user(user1_id, user2_id)
    print(f"   Result: {result}\n")

    print("✅ All tests completed!")


if __name__ == "__main__":
    try:
        test_follow_system()
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
