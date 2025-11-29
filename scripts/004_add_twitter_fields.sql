-- Add Twitter verification tweet URL field to users table
-- Run this after the initial schema scripts

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS twitter_verification_tweet TEXT;

-- Add index for faster Twitter username lookups (anti-abuse)
CREATE INDEX IF NOT EXISTS idx_users_twitter_username 
ON users(twitter_username) 
WHERE twitter_username IS NOT NULL;

-- Create rate_limits table for persistent rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  limit_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, limit_type)
);

-- Create index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, limit_type, window_start);

-- Function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to rate_limits
CREATE POLICY "Service role access" ON rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);
