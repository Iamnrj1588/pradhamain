import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def test_database():
    try:
        # Connect to MongoDB
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
        
        print(f"Testing connection to: {mongo_url}")
        print(f"Database: {os.environ['DB_NAME']}")
        
        # Test connection
        await client.admin.command('ping')
        print("[OK] MongoDB connection successful")
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"[OK] Collections found: {collections}")
        
        # Check each required collection
        required = ['users', 'products', 'cart_items', 'inquiries']
        for collection in required:
            if collection in collections:
                count = await db[collection].count_documents({})
                print(f"[OK] {collection}: {count} documents")
            else:
                print(f"[MISSING] {collection}: NOT FOUND")
        
        client.close()
        
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    asyncio.run(test_database())