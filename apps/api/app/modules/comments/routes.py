"""
Comment routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from .schema import (
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentResponse,
    CommentsListResponse,
)
from .service import CommentService
from ...core.dependencies import get_current_user
from ...database.database import db

router = APIRouter(prefix="/posts/{post_id}/comments", tags=["comments"])


def get_comment_service() -> CommentService:
    return CommentService(db)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: str,
    request: CreateCommentRequest,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Create a new comment on a post"""
    result = service.create_comment(
        post_id=post_id,
        author_id=str(current_user["_id"]),
        content=request.content,
        parent_comment_id=request.parent_comment_id,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.get("", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Get all comments for a post"""
    viewer_id = str(current_user["_id"])
    comments = service.get_post_comments(post_id, viewer_id)
    return comments


@router.put("/{comment_id}", response_model=dict)
async def update_comment(
    post_id: str,
    comment_id: str,
    request: UpdateCommentRequest,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Update a comment"""
    result = service.update_comment(comment_id, str(current_user["_id"]), request.content)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.delete("/{comment_id}", response_model=dict)
async def delete_comment(
    post_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Delete a comment"""
    result = service.delete_comment(comment_id, str(current_user["_id"]))

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.post("/{comment_id}/like", response_model=dict)
async def like_comment(
    post_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Like a comment"""
    result = service.like_comment(str(current_user["_id"]), comment_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.delete("/{comment_id}/like", response_model=dict)
async def unlike_comment(
    post_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
):
    """Unlike a comment"""
    result = service.unlike_comment(str(current_user["_id"]), comment_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result
