"""
Follow service - Business logic for follow operations
"""

from typing import Optional, List, Dict, Any
from .repository import FollowRepository
from ..users import repository as user_repo
from ..notifications.repository import NotificationRepository


class FollowService:
    def __init__(self, db):
        self.follow_repo = FollowRepository(db)
        self.notif_repo = NotificationRepository(db)

    def follow_user(self, follower_id: str, following_id: str) -> Dict[str, Any]:
        """
        Follow a user
        Returns: {success, message, status}
        """
        if follower_id == following_id:
            return {"success": False, "message": "Cannot follow yourself"}

        follower = user_repo.get_user_by_id(follower_id)
        following = user_repo.get_user_by_id(following_id)

        if not follower or not following:
            return {"success": False, "message": "User not found"}

        existing_status = self.follow_repo.get_follow_status(follower_id, following_id)
        if existing_status:
            return {
                "success": False,
                "message": f"Already following (status: {existing_status})",
                "status": existing_status
            }

        is_private = following.get("is_private", False)
        follow_id = self.follow_repo.follow_user(follower_id, following_id, is_private)

        if not follow_id:
            return {"success": False, "message": "Failed to follow user"}

        status = "pending" if is_private else "active"

        if status == "active":
            user_repo.increment_followers_count(following_id)
            user_repo.increment_following_count(follower_id)
            # Notify the followed user
            self.notif_repo.create_notification(
                user_id=following_id,
                actor_id=follower_id,
                notification_type="follow",
            )
        else:
            # Send follow request notification to private account owner
            self.notif_repo.create_notification(
                user_id=following_id,
                actor_id=follower_id,
                notification_type="follow_request",
            )

        message = "Follow request sent" if is_private else "Successfully followed user"
        return {"success": True, "message": message, "status": status}

    def unfollow_user(self, follower_id: str, following_id: str) -> Dict[str, Any]:
        """Unfollow a user"""
        # Check current status
        status = self.follow_repo.get_follow_status(follower_id, following_id)
        if not status:
            return {"success": False, "message": "Not following this user"}

        # Remove follow relationship
        success = self.follow_repo.unfollow_user(follower_id, following_id)
        if not success:
            return {"success": False, "message": "Failed to unfollow user"}

        # Update counts only if it was active
        if status == "active":
            user_repo.decrement_followers_count(following_id)
            user_repo.decrement_following_count(follower_id)

        return {"success": True, "message": "Successfully unfollowed user"}

    def accept_follow_request(self, user_id: str, follower_id: str) -> Dict[str, Any]:
        """Accept a pending follow request (for private accounts)"""
        success = self.follow_repo.accept_follow_request(follower_id, user_id)
        if not success:
            return {"success": False, "message": "No pending request found"}

        user_repo.increment_followers_count(user_id)
        user_repo.increment_following_count(follower_id)

        # Notify the requester that their request was accepted
        self.notif_repo.create_notification(
            user_id=follower_id,
            actor_id=user_id,
            notification_type="follow_accepted",
        )

        return {"success": True, "message": "Follow request accepted"}

    def reject_follow_request(self, user_id: str, follower_id: str) -> Dict[str, Any]:
        """Reject a pending follow request"""
        success = self.follow_repo.reject_follow_request(follower_id, user_id)
        if not success:
            return {"success": False, "message": "No pending request found"}

        return {"success": True, "message": "Follow request rejected"}

    def get_follow_status(self, follower_id: str, following_id: str) -> Dict[str, Any]:
        """Check if follower_id follows following_id"""
        status = self.follow_repo.get_follow_status(follower_id, following_id)
        return {
            "is_following": status is not None,
            "status": status
        }

    def get_followers(
        self, user_id: str, viewer_id: str = None, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """Get followers list with user details + follow-back status"""
        skip = (page - 1) * limit
        follower_ids = self.follow_repo.get_followers(user_id, skip=skip, limit=limit)
        total = self.follow_repo.count_followers(user_id)

        users = []
        for uid in follower_ids:
            user = user_repo.get_user_by_id(uid)
            if user:
                follow_status = None
                if viewer_id:
                    follow_status = self.follow_repo.get_follow_status(viewer_id, uid)
                users.append({
                    "id": str(user["_id"]),
                    "username": user["username"],
                    "full_name": user.get("full_name"),
                    "avatar_url": user.get("avatar_url"),
                    "is_verified": user.get("is_verified", False),
                    "is_private": user.get("is_private", False),
                    "bio": user.get("bio"),
                    "followers_count": user.get("followers_count", 0),
                    "follow_status": follow_status,  # "active" | "pending" | None
                })

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": skip + len(users) < total
        }

    def get_following(
        self, user_id: str, viewer_id: str = None, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """Get following list with user details + follow-back status"""
        skip = (page - 1) * limit
        following_ids = self.follow_repo.get_following(user_id, skip=skip, limit=limit)
        total = self.follow_repo.count_following(user_id)

        users = []
        for uid in following_ids:
            user = user_repo.get_user_by_id(uid)
            if user:
                follow_status = None
                if viewer_id:
                    follow_status = self.follow_repo.get_follow_status(viewer_id, uid)
                users.append({
                    "id": str(user["_id"]),
                    "username": user["username"],
                    "full_name": user.get("full_name"),
                    "avatar_url": user.get("avatar_url"),
                    "is_verified": user.get("is_verified", False),
                    "is_private": user.get("is_private", False),
                    "bio": user.get("bio"),
                    "followers_count": user.get("followers_count", 0),
                    "follow_status": follow_status,
                })

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": skip + len(users) < total
        }

    def get_pending_requests(
        self, user_id: str, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """Get pending follow requests with user details"""
        skip = (page - 1) * limit
        requester_ids = self.follow_repo.get_pending_requests(user_id, skip=skip, limit=limit)
        total = self.follow_repo.count_pending_requests(user_id)

        # Get user details
        users = []
        for uid in requester_ids:
            user = user_repo.get_user_by_id(uid)
            if user:
                users.append({
                    "id": str(user["_id"]),
                    "username": user["username"],
                    "full_name": user.get("full_name"),
                    "avatar_url": user.get("avatar_url"),
                    "is_verified": user.get("is_verified", False),
                    "bio": user.get("bio"),
                })

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": skip + len(users) < total
        }

    def get_follow_stats(self, user_id: str) -> Dict[str, int]:
        """Get follow statistics for a user"""
        return {
            "followers_count": self.follow_repo.count_followers(user_id),
            "following_count": self.follow_repo.count_following(user_id),
            "pending_requests_count": self.follow_repo.count_pending_requests(user_id)
        }
