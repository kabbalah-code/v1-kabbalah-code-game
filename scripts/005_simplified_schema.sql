-- SIMPLIFIED SCHEMA: No auth.users dependency, wallet-based auth
-- Run this script first - it creates all tables from scratch

-- Drop existing tables if any (for clean start)
DROP TABLE IF EXISTS public.tasks_completion CASCADE;
DROP TABLE IF EXISTS public.wheel_spins CASCADE;
DROP TABLE IF EXISTS public.daily_rituals CASCADE;
DROP TABLE IF EXISTS public.points_transactions CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table (wallet-based, no Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  twitter_username TEXT,
  twitter_verified_at TIMESTAMPTZ,
  twitter_verification_tweet TEXT,
  telegram_username TEXT,
  telegram_verified_at TIMESTAMPTZ,
  discord_username TEXT,
  discord_verified_at TIMESTAMPTZ,
  wallet_number INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  total_points BIGINT DEFAULT 0,
  available_points BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_ritual_date DATE,
  free_spins INTEGER DEFAULT 1,
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for simplicity (wallet auth)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_users_wallet ON public.users(wallet_address);
CREATE INDEX idx_users_referral ON public.users(referral_code);
CREATE INDEX idx_users_points ON public.users(total_points DESC);

-- Points transactions
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points_transactions DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_points_user ON public.points_transactions(user_id);
CREATE INDEX idx_points_created ON public.points_transactions(created_at DESC);

-- Daily rituals
CREATE TABLE public.daily_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prediction_text TEXT NOT NULL,
  prediction_data JSONB,
  tweet_url TEXT,
  tweet_verified BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  ritual_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ritual_date)
);

ALTER TABLE public.daily_rituals DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rituals_user_date ON public.daily_rituals(user_id, ritual_date);

-- Wheel spins
CREATE TABLE public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT TRUE,
  spin_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wheel_spins DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_spins_user_date ON public.wheel_spins(user_id, spin_date);

-- Tasks completion tracking
CREATE TABLE public.tasks_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_type)
);

ALTER TABLE public.tasks_completion DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tasks_user ON public.tasks_completion(user_id);

-- Referrals tracking
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code on insert
CREATE OR REPLACE FUNCTION set_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_defaults
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_defaults();
