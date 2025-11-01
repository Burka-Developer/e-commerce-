-- -----------------------------------------------------
-- E-commerce App Combined Hostinger SQL
-- -----------------------------------------------------
-- This single-file bundle contains:
--  1) The Hostinger-ready schema (tables, indexes)
--  2) Optional demo seed inserts (demo admin + demo user)
--  3) Optional fix statements for demo password hashes
--
-- Usage: Import this file in Hostinger phpMyAdmin (Import -> Choose file -> Go).
-- Caution: Do NOT import demo seeds into a production database unless you
-- intend to have the demo accounts. Remove the seed section if not needed.
-- -----------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- Schema (from hostinger_schema.sql)
-- =========================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_users_email (email),
  UNIQUE KEY unique_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NULL,
  category_id INT NULL,
  brand VARCHAR(120),
  images JSON NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  stock_quantity INT NOT NULL DEFAULT 0,
  badge VARCHAR(60),
  features JSON NULL,
  specifications JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL,
  KEY idx_products_category_id (category_id),
  KEY idx_products_in_stock (in_stock),
  KEY idx_products_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupons / Discounts
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(60) NOT NULL,
  description VARCHAR(255),
  type ENUM('percentage','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) NULL,
  max_discount DECIMAL(10,2) NULL,
  usage_limit INT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  expires_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_coupons_code (code),
  KEY idx_coupons_is_active (is_active),
  KEY idx_coupons_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping JSON NOT NULL,
  payment_method VARCHAR(120) NOT NULL,
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  coupon_code VARCHAR(60) NULL,
  discount DECIMAL(10,2) NULL,
  tracking VARCHAR(120) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (status),
  KEY idx_orders_payment_status (payment_status),
  KEY idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  image VARCHAR(255) NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL,
  KEY idx_order_items_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  provider VARCHAR(60) NOT NULL,
  transaction_reference VARCHAR(120) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  status ENUM('initiated','authorized','captured','failed','refunded') NOT NULL DEFAULT 'initiated',
  customer_email VARCHAR(190),
  customer_phone VARCHAR(30),
  raw_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_transaction_reference (transaction_reference),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  KEY idx_payments_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- Optional demo seeds (from 002_seed_demo_users.sql)
-- =========================

-- Seed demo admin and user
-- Import this after the schema has been applied and the `users` table exists.

INSERT INTO users (name, email, phone, password_hash, role)
SELECT 'Demo Admin', 'admin@demo.local', '+1234567890', '$2b$10$abGbgeN5A/2Um4TMKfN6FeVEXwVzgqIRywAnRVui/PUiCcfSLy.DO', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.local');

INSERT INTO users (name, email, phone, password_hash, role)
SELECT 'Demo User', 'user@demo.local', '+1234567891', '$2b$10$xnyYwK/QOEq1pge3/BuWe.L5ivuzJDCwN5jURTM7JIdZcCfKqIEKa', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@demo.local');

-- =========================
-- Optional fix statements (from 003_fix_demo_passwords.sql)
-- Use if demo users fail to authenticate due to hash formatting issues.
-- =========================

UPDATE users
SET password_hash = '$2b$10$abGbgeN5A/2Um4TMKfN6FeVEXwVzgqIRywAnRVui/PUiCcfSLy.DO'
WHERE email = 'admin@demo.local';

UPDATE users
SET password_hash = '$2b$10$xnyYwK/QOEq1pge3/BuWe.L5ivuzJDCwN5jURTM7JIdZcCfKqIEKa'
WHERE email = 'user@demo.local';

-- End of combined Hostinger SQL bundle
