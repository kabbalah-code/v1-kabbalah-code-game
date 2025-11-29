-- Kabbalah Code Database Schema
-- Part 3: Tree of Life Progress & Achievements

-- Sephirot (Tree of Life nodes) - static reference
CREATE TABLE IF NOT EXISTS public.sephirot (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  name_hebrew TEXT NOT NULL,
  description TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  unlock_cost INTEGER NOT NULL,
  unlock_reward INTEGER NOT NULL,
  bonus_description TEXT NOT NULL,
  bonus_value JSONB NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL
);

-- Seed Sephirot data (with explicit IDs)
INSERT INTO public.sephirot (id, name, name_hebrew, description, required_level, unlock_cost, unlock_reward, bonus_description, bonus_value, position_x, position_y) VALUES
(1, 'Malkuth', 'מלכות', 'The Kingdom - Foundation of your journey', 1, 0, 100, 'Access to basic predictions', '{"daily_bonus": 0}', 0.5, 0.95),
(2, 'Yesod', 'יסוד', 'The Foundation - Dreams and intuition', 5, 500, 200, '+5 Points per daily ritual', '{"daily_bonus": 5}', 0.5, 0.8),
(3, 'Hod', 'הוד', 'Splendor - Logic and communication', 10, 1000, 300, '+10% bonus to daily rituals', '{"daily_ritual_bonus": 0.1}', 0.3, 0.65),
(4, 'Netzach', 'נצח', 'Victory - Emotions and creativity', 15, 2000, 400, '+1 free wheel spin per week', '{"weekly_free_spins": 1}', 0.7, 0.65),
(5, 'Tiphereth', 'תפארת', 'Beauty - Harmony and balance', 20, 3500, 500, '+10% to all point rewards', '{"points_multiplier": 1.1}', 0.5, 0.5),
(6, 'Gevurah', 'גבורה', 'Strength - Discipline and justice', 30, 5000, 750, '+15% referral bonus', '{"referral_multiplier": 1.15}', 0.3, 0.35),
(7, 'Chesed', 'חסד', 'Loving-kindness - Compassion', 40, 8000, 1000, 'Double streak bonuses', '{"streak_multiplier": 2}', 0.7, 0.35),
(8, 'Binah', 'בינה', 'Understanding - Deep insight', 50, 15000, 2000, 'Unlock archetype predictions', '{"unlock_archetypes": true}', 0.3, 0.2),
(9, 'Chokmah', 'חכמה', 'Wisdom - Divine inspiration', 60, 30000, 5000, 'Access to spiritual concepts', '{"unlock_spiritual": true}', 0.7, 0.2),
(10, 'Kether', 'כתר', 'Crown - Unity with the divine', 75, 100000, 10000, '+25% all rewards, Master NFT', '{"points_multiplier": 1.25, "master_nft": true}', 0.5, 0.05)
ON CONFLICT (name) DO NOTHING;

-- User's unlocked Sephirot
CREATE TABLE IF NOT EXISTS public.user_sephirot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sephira_id INTEGER NOT NULL REFERENCES public.sephirot(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sephira_id)
);

ALTER TABLE public.user_sephirot DISABLE ROW LEVEL SECURITY;

-- Achievements definition
CREATE TABLE IF NOT EXISTS public.achievements (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_reward INTEGER NOT NULL,
  criteria JSONB NOT NULL
);

-- Seed achievements (with explicit IDs)
INSERT INTO public.achievements (id, code, name, description, icon, points_reward, criteria) VALUES
(1, 'first_step', 'First Step', 'Complete onboarding', 'footprints', 100, '{"type": "onboarding"}'),
(2, 'week_warrior', 'Week Warrior', '7-day ritual streak', 'flame', 200, '{"type": "streak", "days": 7}'),
(3, 'month_master', 'Month Master', '30-day ritual streak', 'crown', 1000, '{"type": "streak", "days": 30}'),
(4, 'social_butterfly', 'Social Butterfly', 'Connect Twitter account', 'twitter', 150, '{"type": "twitter_connect"}'),
(5, 'recruiter', 'Recruiter', 'Invite 5 friends', 'users', 300, '{"type": "referrals", "count": 5}'),
(6, 'network_builder', 'Network Builder', 'Invite 25 friends', 'network', 1500, '{"type": "referrals", "count": 25}'),
(7, 'ritual_master', 'Ritual Master', 'Complete 100 daily rituals', 'calendar', 500, '{"type": "rituals", "count": 100}'),
(8, 'points_collector', 'Points Collector', 'Earn 10,000 total points', 'coins', 1000, '{"type": "points", "amount": 10000}'),
(9, 'tree_climber', 'Tree Climber', 'Unlock 5 Sephirot', 'tree', 500, '{"type": "sephirot", "count": 5}'),
(10, 'enlightened', 'Enlightened', 'Reach Kether (level 75)', 'sparkles', 5000, '{"type": "level", "level": 75}')
ON CONFLICT (code) DO NOTHING;

-- User's achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;

-- Onboarding tasks tracking
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'join_telegram_group',
    'join_telegram_chat',
    'follow_twitter',
    'like_tweet',
    'retweet_tweet'
  )),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER NOT NULL,
  UNIQUE(user_id, task_type)
);

ALTER TABLE public.onboarding_tasks DISABLE ROW LEVEL SECURITY;
