// Input validation and sanitization for anti-abuse

// EVM address validation
export function isValidEvmAddress(address: string): boolean {
  if (!address) return false
  // Must start with 0x and be 42 chars (0x + 40 hex)
  const regex = /^0x[a-fA-F0-9]{40}$/
  return regex.test(address)
}

// Normalize EVM address
export function normalizeAddress(address: string): string {
  return address.toLowerCase().trim()
}

// Twitter URL validation
export function isValidTwitterUrl(url: string): boolean {
  if (!url) return false
  const patterns = [
    /^https?:\/\/(www\.)?(twitter|x)\.com\/\w+\/status\/\d+/,
    /^https?:\/\/mobile\.(twitter|x)\.com\/\w+\/status\/\d+/,
  ]
  return patterns.some((p) => p.test(url))
}

// Twitter username validation
export function isValidTwitterUsername(username: string): boolean {
  if (!username) return false
  // 1-15 alphanumeric + underscore, no consecutive underscores
  const regex = /^[a-zA-Z0-9_]{1,15}$/
  return regex.test(username) && !username.includes("__")
}

// Referral code validation
export function isValidReferralCode(code: string): boolean {
  if (!code) return false
  // 8 uppercase alphanumeric chars
  const regex = /^[A-Z0-9]{8}$/
  return regex.test(code)
}

// Verification code validation (KC-XXXXXX format)
export function isValidVerificationCode(code: string): boolean {
  if (!code) return false
  const regex = /^KC-[A-Z0-9]{6}$/
  return regex.test(code.toUpperCase())
}

// Sanitize string input
export function sanitizeString(input: string, maxLength = 500): string {
  if (!input) return ""
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "") // Remove potential HTML
}

// Check for suspicious patterns
export function detectSuspiciousActivity(data: {
  walletAddress: string
  ip?: string
  userAgent?: string
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check for known bot user agents
  const botPatterns = [/bot/i, /crawler/i, /spider/i, /curl/i, /wget/i, /python/i, /httpx/i]
  if (data.userAgent && botPatterns.some((p) => p.test(data.userAgent!))) {
    reasons.push("Bot-like user agent")
  }

  // Check for suspicious address patterns (all zeros, etc)
  if (data.walletAddress) {
    const addr = data.walletAddress.toLowerCase()
    if (/^0x0+$/.test(addr) || /^0xf+$/i.test(addr)) {
      reasons.push("Suspicious wallet address pattern")
    }
  }

  return { suspicious: reasons.length > 0, reasons }
}

// Generate secure random code
export function generateSecureCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // No confusing chars (0/O, 1/I)
  let result = ""
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}
