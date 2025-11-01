-- Fix demo users' password hashes (clean single-line bcrypt)
-- Use after 002_seed_demo_users.sql if login fails with 500 due to invalid hash

UPDATE users
SET password_hash = '$2b$10$abGbgeN5A/2Um4TMKfN6FeVEXwVzgqIRywAnRVui/PUiCcfSLy.DO'
WHERE email = 'admin@demo.local';

UPDATE users
SET password_hash = '$2b$10$xnyYwK/QOEq1pge3/BuWe.L5ivuzJDCwN5jURTM7JIdZcCfKqIEKa'
WHERE email = 'user@demo.local';
