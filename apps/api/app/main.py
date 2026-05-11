from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from app.core.config import settings
from app.database.database import create_indexes
from app.router import api_router  # Centralized router
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create media directory if it doesn't exist
    os.makedirs("media", exist_ok=True)
    create_indexes()
    logger.info(f"{settings.APP_NAME} API started 🚀")
    yield
    logger.info("API shutting down")


# Create media directory before app initialization
os.makedirs("media", exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production mein specific origins daalo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for media
app.mount("/media", StaticFiles(directory="media"), name="media")

# Include centralized API router
app.include_router(api_router, prefix="/api/v1")

# ── WebSocket must be registered directly on app (not via nested APIRouter) ──
from app.modules.messages.routes import websocket_endpoint
app.add_api_websocket_route("/api/v1/messages/ws/{token}", websocket_endpoint)


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} API running 🚀", "version": "1.0.0"}
