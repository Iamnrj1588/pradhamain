import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

mongo_url = "mongodb://localhost:27017"
db_name = "test_database"

# Sample product data
products = [
    # Women's Collection
    {
        "id": str(uuid.uuid4()),
        "name": "Royal Red Bridal Lehenga",
        "category": "Women",
        "subcategory": "Lehenga",
        "description": "Exquisite bridal lehenga with intricate embroidery and beadwork. Perfect for weddings and special occasions.",
        "price": 15999,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Red", "Maroon", "Gold", "Pink"],
        "images": [
            "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBsZWhlbmdhfGVufDB8fHx8MTc2MDAyMjkwOHww&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1724856604403-60304b28906c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBsZWhlbmdhfGVufDB8fHx8MTc2MDAyMjkwOHww&ixlib=rb-4.1.0&q=85"
        ],
        "customizable": True,
        "featured": True,
        "new_arrival": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Designer Embroidered Lehenga",
        "category": "Women",
        "subcategory": "Lehenga",
        "description": "Beautiful designer lehenga with detailed embroidery work. Can be customized as per your requirements.",
        "price": 12499,
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Red", "Gold", "Green", "Blue"],
        "images": [
            "https://images.unsplash.com/photo-1724856604254-f7cf4e9c8f72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBsZWhlbmdhfGVufDB8fHx8MTc2MDAyMjkwOHww&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1724856605022-106d6dd6e842?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxJbmRpYW4lMjBsZWhlbmdhfGVufDB8fHx8MTc2MDAyMjkwOHww&ixlib=rb-4.1.0&q=85"
        ],
        "customizable": True,
        "featured": False,
        "new_arrival": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Elegant Designer Saree",
        "category": "Women",
        "subcategory": "Dresses",
        "description": "Premium quality saree with modern design and comfortable fabric. Perfect for any occasion.",
        "price": 3999,
        "sizes": ["Free Size"],
        "colors": ["Blue", "Green", "Red", "Black", "White"],
        "images": [
            "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzYXJlZXxlbnwwfHx8fDE3NjAwMjI5MjZ8MA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBzYXJlZXxlbnwwfHx8fDE3NjAwMjI5MjZ8MA&ixlib=rb-4.1.0&q=85"
        ],
        "customizable": True,
        "featured": True,
        "new_arrival": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Custom Designer Blouse",
        "category": "Women",
        "subcategory": "Blouse",
        "description": "Tailored blouse designed as per your specifications. Choose your fabric, design, and fitting.",
        "price": 1499,
        "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
        "colors": ["Red", "Black", "White", "Gold", "Silver", "Pink"],
        "images": [
            "https://images.unsplash.com/photo-1724856604403-60304b28906c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBsZWhlbmdhfGVufDB8fHx8MTc2MDAyMjkwOHww&ixlib=rb-4.1.0&q=85"
        ],
        "customizable": True,
        "featured": False,
        "new_arrival": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Traditional Ethnic Dress",
        "category": "Women",
        "subcategory": "Dresses",
        "description": "Beautiful one-piece ethnic dress with traditional designs. Available for customization.",
        "price": 2999,
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Maroon", "Blue", "Green", "Pink", "Yellow"],
        "images": [
            "https://images.unsplash.com/photo-1756483510837-e79455e52188?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGZhc2hpb258ZW58MHx8fHwxNzYwMDIyODcxfDA&ixlib=rb-4.1.0&q=85"
        ],
        "customizable": True,
        "featured": True,
        "new_arrival": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Men's Collection
    {
        "id": str(uuid.uuid4()),
        "name": "Premium Yellow Kurta",
        "category": "Men",
        "subcategory": "Kurta",
        "description": "Elegant yellow kurta with comfortable fit. Perfect for festivals and celebrations.",
        "price": 1999,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Yellow", "White", "Blue", "Green", "Maroon"],
        "images": [
            "https://images.unsplash.com/photo-1701365676249-9d7ab5022dec",
            "https://images.pexels.com/photos/8489776/pexels-photo-8489776.jpeg"
        ],
        "customizable": True,
        "featured": True,
        "new_arrival": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Classic White Ethnic Kurta",
        "category": "Men",
        "subcategory": "Khadi",
        "description": "Premium khadi kurta with traditional design. Comfortable and stylish for all occasions.",
        "price": 2499,
        "sizes": ["M", "L", "XL", "XXL"],
        "colors": ["White", "Cream", "Beige", "Light Blue"],
        "images": [
            "https://images.unsplash.com/photo-1658066830454-619ebe6312a8"
        ],
        "customizable": True,
        "featured": True,
        "new_arrival": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Designer Kurta Set",
        "category": "Men",
        "subcategory": "Kurta",
        "description": "Complete kurta set with detailed craftsmanship. Perfect for weddings and special events.",
        "price": 3499,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Yellow", "White", "Maroon", "Navy Blue"],
        "images": [
            "https://images.pexels.com/photos/8489776/pexels-photo-8489776.jpeg",
            "https://images.unsplash.com/photo-1657029674341-3212a82d0bd3"
        ],
        "customizable": True,
        "featured": False,
        "new_arrival": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Traditional Khadi Wear",
        "category": "Men",
        "subcategory": "Khadi",
        "description": "Pure khadi fabric outfit with eco-friendly and breathable material.",
        "price": 1799,
        "sizes": ["M", "L", "XL", "XXL"],
        "colors": ["White", "Cream", "Brown", "Green"],
        "images": [
            "https://images.unsplash.com/photo-1658066830454-619ebe6312a8"
        ],
        "customizable": True,
        "featured": False,
        "new_arrival": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Modern Printed T-Shirt",
        "category": "Men",
        "subcategory": "T-Shirt",
        "description": "Stylish printed t-shirt with modern designs. Comfortable casual wear.",
        "price": 799,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Black", "White", "Navy", "Grey", "Red"],
        "images": [
            "https://images.unsplash.com/photo-1701365676249-9d7ab5022dec"
        ],
        "customizable": False,
        "featured": False,
        "new_arrival": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_database():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Clear existing products
        print("Clearing existing products...")
        await db.products.delete_many({})
        
        # Insert new products
        print("Inserting sample products...")
        result = await db.products.insert_many(products)
        print(f"Successfully inserted {len(result.inserted_ids)} products!")
        
        # Display summary
        women_count = len([p for p in products if p['category'] == 'Women'])
        men_count = len([p for p in products if p['category'] == 'Men'])
        featured_count = len([p for p in products if p['featured']])
        new_arrival_count = len([p for p in products if p['new_arrival']])
        
        print(f"\nSummary:")
        print(f"- Women's Products: {women_count}")
        print(f"- Men's Products: {men_count}")
        print(f"- Featured Products: {featured_count}")
        print(f"- New Arrivals: {new_arrival_count}")
        
    finally:
        client.close()
        print("\nDatabase seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
