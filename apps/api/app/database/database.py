from pymongo import MongoClient, ASCENDING
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

client = MongoClient(settings.MONGO_URI)
db = client["allamenia"]


def create_indexes():
    db["users"].create_index([("email", ASCENDING)], unique=True)
    db["users"].create_index([("username", ASCENDING)], unique=True)
    db["posts"].create_index([("user_id", ASCENDING)])
    db["comments"].create_index([("post_id", ASCENDING)])
    db["likes"].create_index([("user_id", ASCENDING), ("target_id", ASCENDING)])
    logger.info("MongoDB indexes created ✅")
