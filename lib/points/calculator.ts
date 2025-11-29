// Points calculation and rewards system

export const POINTS_CONFIG = {
  // Daily rewards
  DAILY_RITUAL: 50,
  WHEEL_SPIN_MIN: 10,
  WHEEL_SPIN_MAX: 150,

  // Streak bonuses
  STREAK_7_DAYS: 50,
  STREAK_14_DAYS: 100,
  STREAK_30_DAYS: 200,

  // One-time tasks
  JOIN_TELEGRAM_GROUP: 50,
  JOIN_TELEGRAM_CHAT: 50,
  FOLLOW_TWITTER: 100,
  LIKE_TWEET: 25,
  RETWEET_TWEET: 75,

  // Referral percentages
  REFERRAL_L1_PERCENT: 15,
  REFERRAL_L2_PERCENT: 7,
  REFERRAL_L3_PERCENT: 3,

  // Wheel spin cost
  EXTRA_SPIN_COST: 100,
}

export const WHEEL_REWARDS = [
  { type: "points", value: 10, label: "10 Points", probability: 0.25, color: "#333" },
  { type: "points", value: 25, label: "25 Points", probability: 0.25, color: "#444" },
  { type: "multiplier", value: 2, label: "x2 Next", probability: 0.15, color: "#FF9500" },
  { type: "points", value: 50, label: "50 Points", probability: 0.15, color: "#555" },
  { type: "points", value: 75, label: "75 Points", probability: 0.1, color: "#666" },
  { type: "points", value: 150, label: "150 Points", probability: 0.05, color: "#FFB340" },
  { type: "boost", value: 10, label: "+10% 24h", probability: 0.04, color: "#FF6B00" },
  { type: "jackpot", value: 500, label: "500 Points!", probability: 0.01, color: "#FFD700" },
]

export function spinWheel(): (typeof WHEEL_REWARDS)[number] {
  const random = Math.random()
  let cumulative = 0

  for (const reward of WHEEL_REWARDS) {
    cumulative += reward.probability
    if (random <= cumulative) {
      return reward
    }
  }

  return WHEEL_REWARDS[0]
}

export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return POINTS_CONFIG.STREAK_30_DAYS
  if (streak >= 14) return POINTS_CONFIG.STREAK_14_DAYS
  if (streak >= 7) return POINTS_CONFIG.STREAK_7_DAYS
  return 0
}

export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1
  if (totalPoints < 250) return 2
  if (totalPoints < 500) return 3
  if (totalPoints < 1000) return 4
  if (totalPoints < 2000) return 5
  const level = Math.floor((totalPoints - 1000) / 1000) + 5
  return Math.min(level, 75)
}

export function getNextLevelPoints(currentLevel: number): number {
  const nextLevel = currentLevel + 1
  return getPointsForLevel(nextLevel)
}

export function calculateReferralReward(earnedPoints: number, level: 1 | 2 | 3): number {
  const percentages = {
    1: POINTS_CONFIG.REFERRAL_L1_PERCENT,
    2: POINTS_CONFIG.REFERRAL_L2_PERCENT,
    3: POINTS_CONFIG.REFERRAL_L3_PERCENT,
  }

  return Math.floor(earnedPoints * (percentages[level] / 100))
}

export function getPointsForLevel(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 250
  if (level === 4) return 500
  if (level === 5) return 1000
  return 1000 + (level - 5) * 1000
}
