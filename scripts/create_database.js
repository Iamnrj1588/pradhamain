// MongoDB Database Setup Script
// Run this in MongoDB shell or MongoDB Compass

// Switch to your database (replace 'pradhamain' with your DB_NAME from .env)
use pradhamain;

// Create collections with validation schemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "email", "name", "password_hash", "created_at"],
      properties: {
        id: { bsonType: "string" },
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        phone: { bsonType: ["string", "null"] },
        password_hash: { bsonType: "string" },
        created_at: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "category", "subcategory", "description", "price", "sizes", "colors", "images", "created_at"],
      properties: {
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        category: { bsonType: "string", enum: ["Women", "Men"] },
        subcategory: { bsonType: "string", enum: ["Lehenga", "Blouse", "Dresses", "Khadi", "Kurta", "T-Shirt"] },
        description: { bsonType: "string" },
        price: { bsonType: "double" },
        sizes: { bsonType: "array", items: { bsonType: "string" } },
        colors: { bsonType: "array", items: { bsonType: "string" } },
        images: { bsonType: "array", items: { bsonType: "string" } },
        customizable: { bsonType: "bool" },
        featured: { bsonType: "bool" },
        new_arrival: { bsonType: "bool" },
        created_at: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("cart_items", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "user_id", "product_id", "quantity", "size", "color", "created_at"],
      properties: {
        id: { bsonType: "string" },
        user_id: { bsonType: "string" },
        product_id: { bsonType: "string" },
        quantity: { bsonType: "int" },
        size: { bsonType: "string" },
        color: { bsonType: "string" },
        customization_notes: { bsonType: ["string", "null"] },
        created_at: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("inquiries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "email", "message", "created_at"],
      properties: {
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: ["string", "null"] },
        message: { bsonType: "string" },
        product_id: { bsonType: ["string", "null"] },
        created_at: { bsonType: "string" }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.products.createIndex({ "id": 1 }, { unique: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "subcategory": 1 });
db.products.createIndex({ "featured": 1 });
db.products.createIndex({ "new_arrival": 1 });

db.cart_items.createIndex({ "id": 1 }, { unique: true });
db.cart_items.createIndex({ "user_id": 1 });
db.cart_items.createIndex({ "product_id": 1 });

db.inquiries.createIndex({ "id": 1 }, { unique: true });
db.inquiries.createIndex({ "created_at": -1 });

print("Database setup completed successfully!");
print("Collections created: users, products, cart_items, inquiries");
print("Indexes created for optimal performance");