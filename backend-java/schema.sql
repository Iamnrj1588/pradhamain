-- PostgreSQL Database Schema for Pradha Main E-commerce

-- Create database (run this separately)
-- CREATE DATABASE pradha_db;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    customizable BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product sizes (one-to-many relationship)
CREATE TABLE product_sizes (
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL,
    PRIMARY KEY (product_id, size)
);

-- Product colors (one-to-many relationship)
CREATE TABLE product_colors (
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50) NOT NULL,
    PRIMARY KEY (product_id, color)
);

-- Product images (one-to-many relationship)
CREATE TABLE product_images (
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, image_url)
);

-- Cart items table
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, size, color)
);

-- Inquiries table
CREATE TABLE inquiries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id),
    quantity INTEGER NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_inquiries_created ON inquiries(created_at);

-- Sample data
INSERT INTO products (id, name, category, subcategory, description, price, featured) VALUES
('prod-1', 'Traditional Silk Saree', 'Women', 'Sarees', 'Beautiful handwoven silk saree with intricate patterns', 2500.00, true),
('prod-2', 'Cotton Kurta Set', 'Men', 'Kurtas', 'Comfortable cotton kurta with matching pajama', 1200.00, false),
('prod-3', 'Designer Lehenga', 'Women', 'Lehengas', 'Elegant designer lehenga for special occasions', 8500.00, true);

INSERT INTO product_sizes (product_id, size) VALUES
('prod-1', 'S'), ('prod-1', 'M'), ('prod-1', 'L'),
('prod-2', 'M'), ('prod-2', 'L'), ('prod-2', 'XL'),
('prod-3', 'S'), ('prod-3', 'M'), ('prod-3', 'L');

INSERT INTO product_colors (product_id, color) VALUES
('prod-1', 'Red'), ('prod-1', 'Blue'), ('prod-1', 'Gold'),
('prod-2', 'White'), ('prod-2', 'Cream'), ('prod-2', 'Light Blue'),
('prod-3', 'Pink'), ('prod-3', 'Purple'), ('prod-3', 'Maroon');

-- Sample admin user (password: admin123)
INSERT INTO users (id, email, name, password_hash, role) VALUES
('admin-1', 'admin@pradha.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');