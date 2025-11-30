// Twitter Syndication API - gets actual tweet content without OAuth

export interface SyndicationTweet {
  id_str: string
  text: string
  user: {
    screen_name: string
    name: string
    profile_image_url_https: string
  }
  created_at: string
}

// Fetch tweet via Syndication API (returns actual text)
export async function fetchTweetSyndication(tweetId: string): Promise<SyndicationTweet | null> {
  try {
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KabbalahCode/1.0)",
      },
    })

    if (!res.ok) return null

    const data = await res.json()

    // Syndication API returns tweet data directly
    return {
      id_str: data.id_str || tweetId,
      text: data.text || "",
      user: {
        screen_name: data.user?.screen_name || "",
        name: data.user?.name || "",
        profile_image_url_https: data.user?.profile_image_url_https || "",
      },
      created_at: data.created_at || "",
    }
  } catch (error) {
    console.error("[v0] Syndication fetch error:", error)
    return null
  }
}

export function verifyTweetContent(text: string, predictionMessage: string): { valid: boolean; error?: string } {
  const normalizedText = text.toLowerCase()

  // Tweet должен содержать #kabbalahcode
  if (!normalizedText.includes("#kabbalahcode")) {
    return { valid: false, error: "Твит должен содержать хештег #KabbalahCode" }
  }

  // Твит должен содержать фразу предсказания (обязательно в нижнем регистре)
  if (!normalizedText.includes(predictionMessage.toLowerCase().slice(0, 35))) {
    return { valid: false, error: "Твит должен содержать фразу предсказания" }
  }

  return { valid: true }
}

export async function verifyTweetViaSyndication(
  tweetUrl: string,
  walletId: string,
): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    // Extract tweet ID from URL
    // Formats: twitter.com/user/status/123, x.com/user/status/123
    const match = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
    if (!match) {
      return { valid: false, error: "Invalid tweet URL" }
    }

    const tweetId = match[1]
    const tweet = await fetchTweetSyndication(tweetId)

    if (!tweet) {
      return { valid: false, error: "Could not fetch tweet. Make sure the tweet is public." }
    }

    const text = tweet.text.toLowerCase()

    // Check for hashtag
    if (!text.includes("#kabbalahcode")) {
      return { valid: false, error: "Tweet must include #KabbalahCode hashtag" }
    }

    // Check for wallet identifier
    if (!text.includes(walletId.toLowerCase())) {
      return { valid: false, error: `Tweet must include your wallet ID: ${walletId}` }
    }

    return {
      valid: true,
      username: tweet.user.screen_name,
    }
  } catch (error) {
    console.error("[v0] Tweet verification error:", error)
    return { valid: false, error: "Verification failed. Please try again." }
  }
}
