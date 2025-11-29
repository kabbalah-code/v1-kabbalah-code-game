-- Admin Tasks table - для хранения заданий, публикуемых из админки

CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'twitter_follow',
    'twitter_like',
    'twitter_retweet',
    'telegram_join',
    'telegram_chat',
    'discord_join',
    'custom'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points >= 0),
  active BOOLEAN DEFAULT true,
  verification_type TEXT CHECK (verification_type IN ('twitter', 'telegram', 'discord', 'manual')),
  verification_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_tasks DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_admin_tasks_active ON public.admin_tasks(active);
CREATE INDEX idx_admin_tasks_type ON public.admin_tasks(type);

-- Seed initial tasks
INSERT INTO public.admin_tasks (task_id, type, title, description, points, active, verification_type) VALUES
('follow_twitter', 'twitter_follow', 'Follow @KabbalahCode', 'Follow and verify with a tweet', 100, true, 'twitter'),
('like_pinned', 'twitter_like', 'Like Pinned Tweet', 'Like and verify with a quote tweet', 25, true, 'twitter'),
('retweet_pinned', 'twitter_retweet', 'Retweet Announcement', 'Retweet with comment to verify', 75, true, 'twitter'),
('join_telegram', 'telegram_join', 'Join Telegram Channel', 'Connect Telegram in Profile to verify', 50, true, 'telegram'),
('join_telegram_chat', 'telegram_chat', 'Join Telegram Chat', 'Connect Telegram in Profile to verify', 50, true, 'telegram')
ON CONFLICT (task_id) DO NOTHING;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_admin_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_tasks_updated_at();


