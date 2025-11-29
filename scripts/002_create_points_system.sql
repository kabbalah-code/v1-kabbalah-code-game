-- Kabbalah Code Database Schema
-- Part 2: Points and Rewards System

-- Points transactions log
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'daily_ritual',
    'streak_bonus',
    'wheel_spin',
    'referral_l1',
    'referral_l2', 
    'referral_l3',
    'onboarding_task',
    'achievement',
    'sephira_unlock',
    'numerology_game',
    'collective_ritual',
    'spent_sephira',
    'spent_spin'
  )),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_select_own" ON public.points_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "points_insert_system" ON public.points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_points_user_id ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_created_at ON public.points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_type ON public.points_transactions(type);

-- Daily rituals tracking
CREATE TABLE IF NOT EXISTS public.daily_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prediction_code TEXT UNIQUE NOT NULL,
  prediction_text TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  tweet_url TEXT,
  verified_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ritual_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.daily_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rituals_select_own" ON public.daily_rituals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "rituals_insert_own" ON public.daily_rituals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rituals_update_own" ON public.daily_rituals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rituals_user_date ON public.daily_rituals(user_id, ritual_date);
CREATE INDEX IF NOT EXISTS idx_rituals_code ON public.daily_rituals(prediction_code);

-- Wheel spins history
CREATE TABLE IF NOT EXISTS public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  spin_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spins_select_own" ON public.wheel_spins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "spins_insert_own" ON public.wheel_spins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_spins_user_date ON public.wheel_spins(user_id, spin_date);

-- Referral relationships (for tracking 3-level pyramid)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
