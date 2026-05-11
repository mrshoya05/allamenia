"""
Comments service - Business logic
"""

from typing import Optional, List, Dict, Any
from .repository import CommentRepository
from .model import create_comment_document, MAX_COMMENT_LENGTH
from ..posts.repository import PostRepository
from ..users import repository as user_repo


class CommentService:
    def __init__(self, db):
        self.comment_repo = CommentRepository(db)
        self.post_repo = PostRepository(db)

    def create_comment(
        self,
        post_id: str,
        author_id: str,
        content: str,
        parent_comment_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new comment"""
        # Validation
        if not content or not content.strip():
            return {"success": False, "message": "Comment cannot be empty"}

        if len(content) > MAX_COMMENT_LENGTH:
            return {"success": False, "message": f"Comment too long (max {MAX_COMMENT_LENGTH} chars)"}

        # Validate post exists
        post = self.post_repo.get_post_by_id(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}

        # If replying to a comment, validate it exists
        if parent_comment_id:
            parent_comment = self.comment_repo.get_comment_by_id(parent_comment_id)
            if not parent_comment:
                return {"success": False, "message": "Parent comment not found"}
            
            # Increment parent comment's reply count
            self.comment_repo.increment_replies_count(parent_comment_id)

        # Create comment
        comment_doc = create_comment_document(
            post_id=post_id,
            author_id=author_id,
            content=content,
            parent_comment_id=parent_comment_id,
        )

        comment_id = self.comment_repo.create_comment(comment_doc)
        if not comment_id:
            return {"success": False, "message": "Failed to create comment"}

        # Increment post's comment count
        self.post_repo.increment_comments_count(post_id)

        return {"success": True, "comment_id": comment_id}

    def get_post_comments(
        self, post_id: str, viewer_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all comments for a post with nested structure"""
        comments = self.comment_repo.get_post_comments(post_id)

        # Enrich with author info and user-specific data
        enriched_comments = []
        for comment in comments:
            enriched = self._enrich_comment(comment, viewer_id)
            enriched_comments.append(enriched)

        return enriched_comments

    def update_comment(
        self, comment_id: str, user_id: str, content: str
    ) -> Dict[str, Any]:
        """Update comment content"""
        comment = self.comment_repo.get_comment_by_id(comment_id)
        if not comment:
            return {"success": False, "message": "Comment not found"}

        if comment["author_id"] != user_id:
            return {"success": False, "message": "Not authorized"}

        if len(content) > MAX_COMMENT_LENGTH:
            return {"success": False, "message": "Comment too long"}

        success = self.comment_repo.update_comment(comment_id, content)
        return {"success": success, "message": "Comment updated" if success else "Update failed"}

    def delete_comment(
        self, comment_id: str, user_id: str
    ) -> Dict[str, Any]:
        """Delete a comment"""
        comment = self.comment_repo.get_comment_by_id(comment_id)
        if not comment:
            return {"success": False, "message": "Comment not found"}

        if comment["author_id"] != user_id:
            return {"success": False, "message": "Not authorized"}

        # Decrement post's comment count
        self.post_repo.decrement_comments_count(comment["post_id"])

        # If this is a reply, decrement parent's reply count
        if comment.get("parent_comment_id"):
            self.comment_repo.decrement_replies_count(comment["parent_comment_id"])

        success = self.comment_repo.delete_comment(comment_id)
        return {"success": success, "message": "Comment deleted" if success else "Delete failed"}

    def like_comment(self, user_id: str, comment_id: str) -> Dict[str, Any]:
        """Like a comment"""
        comment = self.comment_repo.get_comment_by_id(comment_id)
        if not comment:
            return {"success": False, "message": "Comment not found"}

        success = self.comment_repo.like_comment(user_id, comment_id)
        return {
            "success": success,
            "message": "Comment liked" if success else "Already liked",
            "likes_count": comment["likes_count"] + (1 if success else 0),
        }

    def unlike_comment(self, user_id: str, comment_id: str) -> Dict[str, Any]:
        """Unlike a comment"""
        comment = self.comment_repo.get_comment_by_id(comment_id)
        if not comment:
            return {"success": False, "message": "Comment not found"}

        success = self.comment_repo.unlike_comment(user_id, comment_id)
        return {
            "success": success,
            "message": "Comment unliked" if success else "Not liked",
            "likes_count": max(0, comment["likes_count"] - (1 if success else 0)),
        }

    def _enrich_comment(self, comment: dict, viewer_id: Optional[str] = None) -> dict:
        """Add author information and user-specific data to comment"""
        author = user_repo.get_user_by_id(comment["author_id"])
        if author:
            comment["author"] = {
                "id": str(author["_id"]),
                "username": author["username"],
                "full_name": author.get("full_name"),
                "avatar_url": author.get("avatar_url"),
                "is_verified": author.get("is_verified", False),
            }
        else:
            comment["author"] = {
                "id": comment["author_id"],
                "username": "deleted_user",
                "full_name": "Deleted User",
                "avatar_url": None,
                "is_verified": False,
            }

        # Add user-specific fields
        if viewer_id:
            comment["is_liked"] = self.comment_repo.is_liked(viewer_id, comment["id"])
        else:
            comment["is_liked"] = False

        return comment
