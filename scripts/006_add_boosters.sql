-- Add boosters system for wheel rewards
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_multiplier DECIMAL DEFAULT 1.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS multiplier_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_boost_percent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;

-- Index for checking active boosts
CREATE INDEX IF NOT EXISTS idx_users_boost_expires ON users(boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_multiplier_expires ON users(multiplier_expires_at);
