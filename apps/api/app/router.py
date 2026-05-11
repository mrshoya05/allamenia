"""
Central router file - Import and combine all module routers
Usage: from app.router import api_router
"""

from fastapi import APIRouter
from app.modules.users.routes import router as user_router
from app.modules.follows.routes import router as follow_router
from app.modules.posts.routes import router as posts_router
from app.modules.blocks.routes import router as blocks_router
from app.modules.notifications.routes import router as notifications_router
from app.modules.comments.routes import router as comments_router

# Create main API router
api_router = APIRouter()

# Include all module routers
api_router.include_router(user_router, tags=["users"])
api_router.include_router(follow_router, tags=["follows"])
api_router.include_router(posts_router, tags=["posts"])
api_router.include_router(comments_router, tags=["comments"])
api_router.include_router(blocks_router, tags=["blocks"])
api_router.include_router(notifications_router, tags=["notifications"])

