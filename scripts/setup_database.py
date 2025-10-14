#!/usr/bin/env python3
"""
MongoDB Database Setup Script for Pradha Main
Run this script to create database collections with proper validation and indexes
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def setup_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print(f"Setting up database: {os.environ['DB_NAME']}")
    
    # Users collection
    try:
        await db.create_collection("users", validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["id", "email", "name", "password_hash", "created_at"],
                "properties": {
                    "id": {"bsonType": "string"},
                    "email": {"bsonType": "string"},
                    "name": {"bsonType": "string"},
                    "phone": {"bsonType": ["string", "null"]},
                    "password_hash": {"bsonType": "string"},
                    "created_at": {"bsonType": "string"}
                }
            }
        })
        print("✓ Users collection created")
    except Exception as e:
        print(f"Users collection exists or error: {e}")
    
    # Products collection
    try:
        await db.create_collection("products", validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["id", "name", "category", "subcategory", "description", "price", "sizes", "colors", "images", "created_at"],
                "properties": {
                    "id": {"bsonType": "string"},
                    "name": {"bsonType": "string"},
                    "category": {"bsonType": "string", "enum": ["Women", "Men"]},
                    "subcategory": {"bsonType": "string", "enum": ["Lehenga", "Blouse", "Dresses", "Khadi", "Kurta", "T-Shirt"]},
                    "description": {"bsonType": "string"},
                    "price": {"bsonType": "double"},
                    "sizes": {"bsonType": "array", "items": {"bsonType": "string"}},
                    "colors": {"bsonType": "array", "items": {"bsonType": "string"}},
                    "images": {"bsonType": "array", "items": {"bsonType": "string"}},
                    "customizable": {"bsonType": "bool"},
                    "featured": {"bsonType": "bool"},
                    "new_arrival": {"bsonType": "bool"},
                    "created_at": {"bsonType": "string"}
                }
            }
        })
        print("✓ Products collection created")
    except Exception as e:
        print(f"Products collection exists or error: {e}")
    
    # Cart items collection
    try:
        await db.create_collection("cart_items", validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["id", "user_id", "product_id", "quantity", "size", "color", "created_at"],
                "properties": {
                    "id": {"bsonType": "string"},
                    "user_id": {"bsonType": "string"},
                    "product_id": {"bsonType": "string"},
                    "quantity": {"bsonType": "int"},
                    "size": {"bsonType": "string"},
                    "color": {"bsonType": "string"},
                    "customization_notes": {"bsonType": ["string", "null"]},
                    "created_at": {"bsonType": "string"}
                }
            }
        })
        print("✓ Cart items collection created")
    except Exception as e:
        print(f"Cart items collection exists or error: {e}")
    
    # Inquiries collection
    try:
        await db.create_collection("inquiries", validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["id", "name", "email", "message", "created_at"],
                "properties": {
                    "id": {"bsonType": "string"},
                    "name": {"bsonType": "string"},
                    "email": {"bsonType": "string"},
                    "phone": {"bsonType": ["string", "null"]},
                    "message": {"bsonType": "string"},
                    "product_id": {"bsonType": ["string", "null"]},
                    "created_at": {"bsonType": "string"}
                }
            }
        })
        print("✓ Inquiries collection created")
    except Exception as e:
        print(f"Inquiries collection exists or error: {e}")
    
    # Create indexes
    print("\nCreating indexes...")
    
    # Users indexes
    await db.users.create_index("id", unique=True)
    await db.users.create_index("email", unique=True)
    print("✓ Users indexes created")
    
    # Products indexes
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("subcategory")
    await db.products.create_index("featured")
    await db.products.create_index("new_arrival")
    print("✓ Products indexes created")
    
    # Cart items indexes
    await db.cart_items.create_index("id", unique=True)
    await db.cart_items.create_index("user_id")
    await db.cart_items.create_index("product_id")
    print("✓ Cart items indexes created")
    
    # Inquiries indexes
    await db.inquiries.create_index("id", unique=True)
    await db.inquiries.create_index([("created_at", -1)])
    print("✓ Inquiries indexes created")
    
    print("\n🎉 Database setup completed successfully!")
    print(f"Database: {os.environ['DB_NAME']}")
    print("Collections: users, products, cart_items, inquiries")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_database())