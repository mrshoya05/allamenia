"""
Posts routes - API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File, Form
from typing import Annotated, Optional, List
from .service import PostService
from ...utils.file_upload import save_file

from .schema import (
    CreatePostRequest,
    UpdatePostRequest,
    CreateRepostRequest,
    PostResponse,
    FeedResponse,
    LikeResponse,
    RepostResponse,
    BookmarkResponse,
)
from ...core.dependencies import get_current_user
from ...database.database import db

router = APIRouter(prefix="/posts", tags=["posts"])


def get_post_service() -> PostService:
    return PostService(db)


# ─── Posts CRUD ───────────────────────────────────────────────────────────────

@router.post("/upload-media")
async def upload_media(
    file: UploadFile = File(...),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    """Upload a media file and return the URL"""
    try:
        file_path = await save_file(file, "posts")
        # Convert local path to URL
        file_url = f"http://localhost:8000/{file_path}"
        return {
            "url": file_url,
            "type": file.content_type.split("/")[0] if file.content_type else "image",
            "mime_type": file.content_type,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(
    request: CreatePostRequest,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    service = get_post_service()

    # Convert media attachments to dict format
    media_list = [media.dict() for media in request.media] if request.media else []
    
    # Debug logging
    print(f"Creating post - Content: {request.content[:50]}...")
    print(f"Media count: {len(media_list)}")
    print(f"Media data: {media_list}")

    result = service.create_post(
        author_id=str(current_user["_id"]),
        content=request.content,
        media=media_list,
        link_preview=request.link_preview.dict() if request.link_preview else None,
        visibility=request.visibility,
        reply_to_post_id=request.reply_to_post_id,
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to create post"))
    
    # Fetch and return the full post object
    post = service.get_post(result["post_id"], str(current_user["_id"]))
    if not post:
        raise HTTPException(status_code=500, detail="Post created but failed to retrieve")
    
    return post
    
    return post


@router.get("", response_model=FeedResponse)
async def get_feed(
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get personalized feed"""
    service = get_post_service()
    return service.get_feed(str(current_user["_id"]), page, limit)


@router.get("/trending", response_model=list)
async def get_trending(
    hours: int = Query(24, ge=1, le=168),
    limit: int = Query(20, ge=1, le=100),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    """Get trending posts"""
    service = get_post_service()
    viewer_id = str(current_user["_id"]) if current_user else None
    return service.get_trending_posts(hours, limit, viewer_id)


@router.get("/bookmarks", response_model=FeedResponse)
async def get_bookmarks(
    current_user: Annotated[dict, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get bookmarked posts"""
    service = get_post_service()
    return service.get_bookmarks(str(current_user["_id"]), page, limit)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    """Get a single post"""
    service = get_post_service()
    viewer_id = str(current_user["_id"]) if current_user else None
    post = service.get_post(post_id, viewer_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


@router.put("/{post_id}", response_model=dict)
async def update_post(
    post_id: str,
    data: UpdatePostRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Update post content"""
    service = get_post_service()
    result = service.update_post(post_id, str(current_user["_id"]), data.content)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.delete("/{post_id}", response_model=dict)
async def delete_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a post"""
    service = get_post_service()
    result = service.delete_post(post_id, str(current_user["_id"]))

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.get("/{post_id}/replies", response_model=FeedResponse)
async def get_replies(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get replies/comments to a post"""
    service = get_post_service()
    viewer_id = str(current_user["_id"]) if current_user else None
    return service.get_replies(post_id, viewer_id, page, limit)


# ─── Interactions ─────────────────────────────────────────────────────────────

@router.post("/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Like a post"""
    service = get_post_service()
    result = service.like_post(str(current_user["_id"]), post_id)
    return result


@router.delete("/{post_id}/like", response_model=LikeResponse)
async def unlike_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Unlike a post"""
    service = get_post_service()
    result = service.unlike_post(str(current_user["_id"]), post_id)
    return result


@router.post("/{post_id}/repost", response_model=RepostResponse)
async def repost(
    post_id: str,
    data: CreateRepostRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Repost a post"""
    service = get_post_service()
    result = service.repost(str(current_user["_id"]), post_id, data.content)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.delete("/{post_id}/repost", response_model=RepostResponse)
async def unrepost(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Remove repost"""
    service = get_post_service()
    result = service.unrepost(str(current_user["_id"]), post_id)
    return result


@router.post("/{post_id}/bookmark", response_model=BookmarkResponse)
async def bookmark_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Bookmark a post"""
    service = get_post_service()
    result = service.bookmark_post(str(current_user["_id"]), post_id)
    return result


@router.delete("/{post_id}/bookmark", response_model=BookmarkResponse)
async def unbookmark_post(
    post_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Remove bookmark"""
    service = get_post_service()
    result = service.unbookmark_post(str(current_user["_id"]), post_id)
    return result


@router.post("/{post_id}/view", response_model=dict)
async def track_view(
    post_id: str,
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    """Track post view"""
    service = get_post_service()
    viewer_id = str(current_user["_id"]) if current_user else None
    ip_address = request.client.host if request.client else None

    success = service.track_view(post_id, viewer_id, ip_address)
    return {"success": success}


# ─── User Posts ───────────────────────────────────────────────────────────────

@router.get("/user/{username}", response_model=FeedResponse)
async def get_user_posts(
    username: str,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get posts by a specific user"""
    service = get_post_service()
    viewer_id = str(current_user["_id"]) if current_user else None
    return service.get_user_posts(username, viewer_id, page, limit)
