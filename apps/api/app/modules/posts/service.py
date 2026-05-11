"""
Posts service - Business logic
"""

from typing import Optional, List, Dict, Any
from .repository import PostRepository
from .model import create_post_document, MAX_CONTENT_LENGTH, MAX_MEDIA_COUNT
from ..users import repository as user_repo
from ..follows.repository import FollowRepository
from ..blocks.repository import BlockRepository
from ..notifications.repository import NotificationRepository


class PostService:
    def __init__(self, db):
        self.post_repo = PostRepository(db)
        self.follow_repo = FollowRepository(db)
        self.block_repo = BlockRepository(db)
        self.notif_repo = NotificationRepository(db)

    def create_post(
        self,
        author_id: str,
        content: str = "",
        media: List[dict] = None,
        link_preview: dict = None,
        visibility: str = "public",
        reply_to_post_id: str = None,
    ) -> Dict[str, Any]:
        """Create a new post"""
        # Validation
        if not content and (not media or len(media) == 0):
            return {"success": False, "message": "Post must have content or media"}

        if len(content) > MAX_CONTENT_LENGTH:
            return {"success": False, "message": f"Content too long (max {MAX_CONTENT_LENGTH} chars)"}

        if media and len(media) > MAX_MEDIA_COUNT:
            return {"success": False, "message": f"Too many media attachments (max {MAX_MEDIA_COUNT})"}

        # If reply, validate parent post exists
        reply_to_user_id = None
        if reply_to_post_id:
            parent_post = self.post_repo.get_post_by_id(reply_to_post_id)
            if not parent_post:
                return {"success": False, "message": "Parent post not found"}
            reply_to_user_id = parent_post["author_id"]

        # Create post document
        post_doc = create_post_document(
            author_id=author_id,
            content=content,
            media=media or [],
            link_preview=link_preview,
            visibility=visibility,
            reply_to_post_id=reply_to_post_id,
            reply_to_user_id=reply_to_user_id,
        )

        post_id = self.post_repo.create_post(post_doc)
        if not post_id:
            return {"success": False, "message": "Failed to create post"}

        # If reply, increment parent's comment count
        if reply_to_post_id:
            self.post_repo.increment_comments_count(reply_to_post_id)

        # Increment user's post count
        user_repo.increment_posts_count(author_id)

        return {"success": True, "post_id": post_id}

    def get_post(self, post_id: str, viewer_id: str = None) -> Optional[Dict[str, Any]]:
        """Get a single post with user context"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return None

        # Check visibility
        if not self._can_view_post(post, viewer_id):
            return None

        # Enrich with author info
        post = self._enrich_post_with_author(post)

        # Add user-specific fields
        if viewer_id:
            post["is_liked"] = self.post_repo.is_liked(viewer_id, post_id)
            post["is_bookmarked"] = self.post_repo.is_bookmarked(viewer_id, post_id)
            post["is_reposted"] = self.post_repo.is_reposted(viewer_id, post_id)
        else:
            post["is_liked"] = False
            post["is_bookmarked"] = False
            post["is_reposted"] = False

        # If repost, get original post
        if post.get("is_repost") and post.get("original_post_id"):
            original = self.get_post(post["original_post_id"], viewer_id)
            post["original_post"] = original

        return post

    def get_feed(
        self, user_id: str, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """Get personalized feed for user"""
        skip = (page - 1) * limit

        # Get users that current user follows
        following_ids = self.follow_repo.get_following(user_id, skip=0, limit=10000)
        following_ids.append(user_id)  # Include own posts

        # Get blocked users (both ways)
        blocked_users = self.block_repo.get_all_blocked_users(user_id)
        users_who_blocked_me = self.block_repo.get_users_who_blocked(user_id)
        all_blocked = list(set(blocked_users + users_who_blocked_me))

        # Filter out blocked users from following list
        following_ids = [uid for uid in following_ids if uid not in all_blocked]

        # Get posts
        posts = self.post_repo.get_feed(following_ids, skip=skip, limit=limit)

        # Enrich posts
        enriched_posts = []
        for post in posts:
            # Skip if author is blocked
            if post["author_id"] in all_blocked:
                continue
                
            enriched = self._enrich_post_with_author(post)
            enriched["is_liked"] = self.post_repo.is_liked(user_id, post["id"])
            enriched["is_bookmarked"] = self.post_repo.is_bookmarked(user_id, post["id"])
            enriched["is_reposted"] = self.post_repo.is_reposted(user_id, post["id"])
            enriched_posts.append(enriched)

        total = len(following_ids) * 100  # Rough estimate
        has_more = len(posts) == limit

        return {
            "posts": enriched_posts,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": has_more,
        }

    def get_user_posts(
        self, username: str, viewer_id: str = None, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """Get posts by a specific user"""
        # Get user
        user = user_repo.get_user_by_username(username)
        if not user:
            return {"posts": [], "page": page, "limit": limit, "total": 0, "has_more": False}

        user_id = str(user["_id"])
        skip = (page - 1) * limit

        # Get posts
        posts = self.post_repo.get_user_posts(user_id, skip=skip, limit=limit)

        # Enrich posts
        enriched_posts = []
        for post in posts:
            # Check visibility
            if not self._can_view_post(post, viewer_id):
                continue

            enriched = self._enrich_post_with_author(post)
            if viewer_id:
                enriched["is_liked"] = self.post_repo.is_liked(viewer_id, post["id"])
                enriched["is_bookmarked"] = self.post_repo.is_bookmarked(viewer_id, post["id"])
                enriched["is_reposted"] = self.post_repo.is_reposted(viewer_id, post["id"])
            enriched_posts.append(enriched)

        total = self.post_repo.count_user_posts(user_id)
        has_more = skip + len(posts) < total

        return {
            "posts": enriched_posts,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": has_more,
        }

    def get_trending_posts(self, hours: int = 24, limit: int = 20, viewer_id: str = None) -> List[Dict[str, Any]]:
        """Get trending posts (only public posts, excluding blocked users)"""
        posts = self.post_repo.get_trending_posts(hours=hours, limit=limit * 2)  # Fetch more to account for filtering

        # Get blocked users if viewer is logged in
        all_blocked = []
        if viewer_id:
            blocked_users = self.block_repo.get_all_blocked_users(viewer_id)
            users_who_blocked_me = self.block_repo.get_users_who_blocked(viewer_id)
            all_blocked = list(set(blocked_users + users_who_blocked_me))

        enriched_posts = []
        for post in posts:
            # Skip blocked users
            if post["author_id"] in all_blocked:
                continue
                
            # Only show public posts in trending
            if post.get("visibility") != "public":
                continue
                
            enriched = self._enrich_post_with_author(post)
            # Add default user-specific fields for unauthenticated users
            if viewer_id:
                enriched["is_liked"] = self.post_repo.is_liked(viewer_id, post["id"])
                enriched["is_bookmarked"] = self.post_repo.is_bookmarked(viewer_id, post["id"])
                enriched["is_reposted"] = self.post_repo.is_reposted(viewer_id, post["id"])
            else:
                enriched["is_liked"] = False
                enriched["is_bookmarked"] = False
                enriched["is_reposted"] = False
            enriched_posts.append(enriched)
            
            if len(enriched_posts) >= limit:
                break

        return enriched_posts

    def update_post(self, post_id: str, user_id: str, content: str) -> Dict[str, Any]:
        """Update post content"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}

        if post["author_id"] != user_id:
            return {"success": False, "message": "Not authorized"}

        if len(content) > MAX_CONTENT_LENGTH:
            return {"success": False, "message": "Content too long"}

        success = self.post_repo.update_post(post_id, {"content": content})
        return {"success": success, "message": "Post updated" if success else "Update failed"}

    def delete_post(self, post_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a post"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}

        if post["author_id"] != user_id:
            return {"success": False, "message": "Not authorized"}

        # If this is a reply, decrement parent's comment count
        if post.get("reply_to_post_id"):
            self.post_repo.decrement_comments_count(post["reply_to_post_id"])

        success = self.post_repo.delete_post(post_id)
        if success:
            # Decrement user's post count
            user_repo.increment_posts_count(user_id, -1)

        return {"success": success, "message": "Post deleted" if success else "Delete failed"}

    def like_post(self, user_id: str, post_id: str) -> Dict[str, Any]:
        """Like a post"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found", "likes_count": 0}

        success = self.post_repo.like_post(user_id, post_id)
        if not success:
            return {"success": False, "message": "Already liked", "likes_count": post["likes_count"]}

        # Create notification
        self.notif_repo.create_notification(
            user_id=post["author_id"],
            actor_id=user_id,
            notification_type="like",
            post_id=post_id,
        )

        return {
            "success": True,
            "message": "Post liked",
            "likes_count": post["likes_count"] + 1,
        }

    def unlike_post(self, user_id: str, post_id: str) -> Dict[str, Any]:
        """Unlike a post"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found", "likes_count": 0}

        success = self.post_repo.unlike_post(user_id, post_id)
        if not success:
            return {"success": False, "message": "Not liked", "likes_count": post["likes_count"]}

        return {
            "success": True,
            "message": "Post unliked",
            "likes_count": max(0, post["likes_count"] - 1),
        }

    def repost(self, user_id: str, post_id: str, content: str = "") -> Dict[str, Any]:
        """Repost a post"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}

        # Check if already reposted
        if self.post_repo.is_reposted(user_id, post_id):
            return {"success": False, "message": "Already reposted"}

        repost_id = self.post_repo.create_repost(user_id, post_id, content)
        return {"success": True, "message": "Reposted", "repost_id": repost_id}

    def unrepost(self, user_id: str, post_id: str) -> Dict[str, Any]:
        """Remove repost"""
        success = self.post_repo.delete_repost(user_id, post_id)
        return {
            "success": success,
            "message": "Repost removed" if success else "Not reposted",
        }

    def bookmark_post(self, user_id: str, post_id: str) -> Dict[str, Any]:
        """Bookmark a post"""
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}

        success = self.post_repo.bookmark_post(user_id, post_id)
        return {
            "success": success,
            "message": "Bookmarked" if success else "Already bookmarked",
        }

    def unbookmark_post(self, user_id: str, post_id: str) -> Dict[str, Any]:
        """Remove bookmark"""
        success = self.post_repo.unbookmark_post(user_id, post_id)
        return {
            "success": success,
            "message": "Bookmark removed" if success else "Not bookmarked",
        }

    def get_bookmarks(self, user_id: str, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get user's bookmarked posts"""
        skip = (page - 1) * limit
        post_ids = self.post_repo.get_user_bookmarks(user_id, skip=skip, limit=limit)

        posts = []
        for post_id in post_ids:
            post = self.get_post(post_id, user_id)
            if post:
                posts.append(post)

        total = self.post_repo.count_user_bookmarks(user_id)
        has_more = skip + len(posts) < total

        return {
            "posts": posts,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": has_more,
        }

    def get_replies(self, post_id: str, viewer_id: str = None, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get replies to a post"""
        skip = (page - 1) * limit
        replies = self.post_repo.get_replies(post_id, skip=skip, limit=limit)

        enriched_replies = []
        for reply in replies:
            enriched = self._enrich_post_with_author(reply)
            if viewer_id:
                enriched["is_liked"] = self.post_repo.is_liked(viewer_id, reply["id"])
                enriched["is_bookmarked"] = self.post_repo.is_bookmarked(viewer_id, reply["id"])
                enriched["is_reposted"] = self.post_repo.is_reposted(viewer_id, reply["id"])
            else:
                enriched["is_liked"] = False
                enriched["is_bookmarked"] = False
                enriched["is_reposted"] = False
            enriched_replies.append(enriched)

        total = self.post_repo.count_replies(post_id)
        has_more = skip + len(replies) < total

        return {
            "posts": enriched_replies,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": has_more,
        }

    def track_view(self, post_id: str, user_id: str = None, ip_address: str = None) -> bool:
        """Track post view"""
        return self.post_repo.track_view(post_id, user_id, ip_address)

    # ─── Helper Methods ───────────────────────────────────────────────────────

    def _enrich_post_with_author(self, post: dict) -> dict:
        """Add author information to post"""
        author = user_repo.get_user_by_id(post["author_id"])
        if author:
            post["author"] = {
                "id": str(author["_id"]),
                "username": author["username"],
                "full_name": author.get("full_name"),
                "avatar_url": author.get("avatar_url"),
                "is_verified": author.get("is_verified", False),
            }
        else:
            # Fallback for deleted/missing users
            post["author"] = {
                "id": post["author_id"],
                "username": "deleted_user",
                "full_name": "Deleted User",
                "avatar_url": None,
                "is_verified": False,
            }
        return post

    def _can_view_post(self, post: dict, viewer_id: str = None) -> bool:
        """Check if viewer can see the post"""
        # Own post
        if viewer_id and post["author_id"] == viewer_id:
            return True

        # Public post
        if post.get("visibility") == "public":
            return True

        # Followers only
        if post.get("visibility") == "followers" and viewer_id:
            return self.follow_repo.is_following(viewer_id, post["author_id"])

        return False
