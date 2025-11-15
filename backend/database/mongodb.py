"""
MongoDB Database Connection Module
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging

logger = logging.getLogger(__name__)

# MongoDB connection
client: AsyncIOMotorClient = None
db = None


def get_mongodb_client():
    """Get MongoDB connection string from environment variables."""
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        # Fallback to individual connection parameters
        host = os.getenv("MONGODB_HOST", "localhost")
        port = int(os.getenv("MONGODB_PORT", 27017))
        username = os.getenv("MONGODB_USERNAME")
        password = os.getenv("MONGODB_PASSWORD")
        database = os.getenv("MONGODB_DATABASE", "portfolio")
        
        if username and password:
            mongodb_uri = f"mongodb://{username}:{password}@{host}:{port}/{database}?authSource=admin"
        else:
            mongodb_uri = f"mongodb://{host}:{port}/{database}"
    print(f"MONGODB_URI: {mongodb_uri}")
    return mongodb_uri


async def connect_to_mongodb():
    """Connect to MongoDB database."""
    global client, db
    
    try:
        mongodb_uri = get_mongodb_client()
        database_name = os.getenv("MONGODB_DATABASE", "portfolio")
        
        client = AsyncIOMotorClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        # Test connection
        await client.admin.command('ping')
        db = client[database_name]
        
        logger.info(f"✅ Connected to MongoDB: {database_name}")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error connecting to MongoDB: {e}")
        return False


async def close_mongodb_connection():
    """Close MongoDB connection."""
    global client, db
    
    if client:
        client.close()
        logger.info("🔒 MongoDB connection closed.")
        client = None
        db = None


def get_database():
    """Get database instance."""
    if db is None:
        raise RuntimeError("MongoDB database not connected. Call connect_to_mongodb() first.")
    return db


def get_blogs_collection():
    """Get blogs collection from database."""
    database = get_database()
    return database.blogs

