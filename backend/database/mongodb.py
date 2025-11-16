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
    
    # Check if connecting to MongoDB Atlas (requires SSL)
    is_atlas = ".mongodb.net" in mongodb_uri or "mongodb+srv://" in mongodb_uri
    
    # Add SSL parameters if connecting to Atlas and not already in URI
    if is_atlas and "tls=" not in mongodb_uri and "ssl=" not in mongodb_uri:
        # If using mongodb:// (not mongodb+srv), add SSL parameters
        if mongodb_uri.startswith("mongodb://"):
            separator = "&" if "?" in mongodb_uri else "?"
            mongodb_uri = f"{mongodb_uri}{separator}tls=true&tlsAllowInvalidCertificates=false"
        # mongodb+srv:// automatically uses SSL, so no changes needed
    
    print(f"MONGODB_URI: {mongodb_uri[:50]}...")  # Don't print full URI with credentials
    return mongodb_uri


async def connect_to_mongodb():
    """Connect to MongoDB database."""
    global client, db
    
    try:
        mongodb_uri = get_mongodb_client()
        database_name = os.getenv("MONGODB_DATABASE", "portfolio")
        
        # Check if connecting to MongoDB Atlas
        is_atlas = ".mongodb.net" in mongodb_uri or "mongodb+srv://" in mongodb_uri
        
        # Connection options
        connection_options = {
            "serverSelectionTimeoutMS": 30000,  # 30 seconds for SSL handshake
            "connectTimeoutMS": 30000,  # 30 seconds
            "socketTimeoutMS": 30000,  # 30 seconds
            "retryWrites": True,
            "retryReads": True,
        }
        
        # Add SSL/TLS options for Atlas connections using mongodb:// (not mongodb+srv)
        # mongodb+srv:// automatically handles SSL, so we only need to configure for mongodb://
        if is_atlas and mongodb_uri.startswith("mongodb://"):
            connection_options.update({
                "tls": True,
                "tlsAllowInvalidCertificates": False,
                "tlsInsecure": False,
            })
        
        client = AsyncIOMotorClient(
            mongodb_uri,
            **connection_options
        )
        
        # Test connection with longer timeout
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


def get_projects_collection():
    """Get projects collection from database."""
    database = get_database()
    return database.projects
