-- Add email verification fields to users
ALTER TABLE users
  ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN verification_code VARCHAR(12) NULL,
  ADD COLUMN verification_expires DATETIME NULL;

-- Optional index for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);