// Rate limiting and anti-abuse protection

interface RateLimitEntry {
  count: number
  windowStart: number
}

// In-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configurations
export const RATE_LIMITS = {
  TWITTER_VERIFY: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  DAILY_RITUAL: { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
  WHEEL_SPIN: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  REFERRAL_CHECK: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

export function checkRateLimit(
  identifier: string,
  type: RateLimitType,
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[type]
  const key = `${type}:${identifier}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  // No entry or window expired - allow and create new entry
  if (!entry || now - entry.windowStart >= config.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  // Within window - check count
  if (entry.count >= config.maxRequests) {
    const resetIn = config.windowMs - (now - entry.windowStart)
    return { allowed: false, remaining: 0, resetIn }
  }

  // Increment and allow
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: config.windowMs - (now - entry.windowStart),
  }
}

// Cleanup old entries periodically
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      // Find the longest window
      const maxWindow = Math.max(...Object.values(RATE_LIMITS).map((r) => r.windowMs))
      if (now - entry.windowStart > maxWindow) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000,
) // Every 5 minutes
