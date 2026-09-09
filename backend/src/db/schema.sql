-- RC Battleground E-Commerce Platform — PostgreSQL Schema

DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS membership_purchases CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS reviews_ratings CASCADE;
DROP TABLE IF EXISTS reward_points_transactions CASCADE;
DROP TABLE IF EXISTS reward_settings CASCADE;
DROP TABLE IF EXISTS user_memberships CASCADE;
DROP TABLE IF EXISTS membership_plans CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin')),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings (exchange rate, email config)
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(60) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products (dual currency: NPR + USD)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    price_npr NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price_npr >= 0),
    price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price_usd >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    seller_name VARCHAR(120) DEFAULT 'RC Battleground Official',
    is_featured BOOLEAN DEFAULT false,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membership Plans
CREATE TABLE membership_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    price_npr NUMERIC(12, 2) NOT NULL CHECK (price_npr >= 0),
    price_usd NUMERIC(12, 2) NOT NULL CHECK (price_usd >= 0),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    point_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    perks TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Active User Memberships
CREATE TABLE user_memberships (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES membership_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(80) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membership Purchase History
CREATE TABLE membership_purchases (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES membership_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(80) NOT NULL,
    amount_npr NUMERIC(12, 2) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_ref VARCHAR(100),
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reward Settings
CREATE TABLE reward_settings (
    id SERIAL PRIMARY KEY,
    points_per_dollar_spent NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    dollars_per_point_redeemed NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reward Points Transactions
CREATE TABLE reward_points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed')),
    points INT NOT NULL CHECK (points > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews & Ratings
CREATE TABLE reviews_ratings (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(40) UNIQUE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    total_amount_npr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    points_redeemed INT NOT NULL DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    unit_price_npr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- Payment Transactions
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    membership_purchase_id INT REFERENCES membership_purchases(id) ON DELETE SET NULL,
    gateway VARCHAR(50) NOT NULL CHECK (gateway IN ('esewa', 'khalti', 'mobile_banking', 'debit_card', 'credit_card')),
    amount_npr NUMERIC(12, 2) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_ref VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    recipient VARCHAR(200) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(150) NOT NULL,
    track_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    entry_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    entry_fee_npr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    entry_fee_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    max_participants INT NOT NULL DEFAULT 30,
    registered_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Site Content (slider, about, contact)
CREATE TABLE site_content (
    key VARCHAR(60) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
