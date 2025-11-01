-- Seed demo admin and user
-- Import this after 001_init.sql has been applied and the `users` table exists.
-- Run (PowerShell example):
--   mysql -h localhost -P 3306 -u root -p ecommerce_db < .\scripts\sql\002_seed_demo_users.sql

INSERT INTO users (name, email, phone, password_hash, role)
SELECT 'Demo Admin', 'admin@demo.local', '+1234567890', '$2b$10$abGbgeN5A/2Um4TMKfN6FeVEXwVzgqIRywAnRVui/PUiCcfSLy.DO', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.local');

INSERT INTO users (name, email, phone, password_hash, role)
SELECT 'Demo User', 'user@demo.local', '+1234567891', '$2b$10$xnyYwK/QOEq1pge3/BuWe.L5ivuzJDCwN5jURTM7JIdZcCfKqIEKa', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@demo.local');
