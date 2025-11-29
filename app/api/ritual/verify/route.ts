import { type NextRequest, NextResponse } from "next/server"
import { extractTweetId } from "@/lib/twitter/verification"
import { fetchTweetSyndication, verifyTweetContent } from "@/lib/twitter/syndication"
import { createClient } from "@/lib/supabase/server"
import { isValidEvmAddress, normalizeAddress } from "@/lib/anti-abuse/validators"
import { calculateLevel } from "@/lib/db/users"
import { POINTS_CONFIG, calculateStreakBonus } from "@/lib/points/calculator"
import { checkRateLimit } from "@/lib/anti-abuse/rate-limiter"
import { distributeReferralRewards } from "@/lib/referrals/system"
import { checkAndAwardAchievements } from "@/lib/achievements/checker"

export async function POST(request: NextRequest) {
  try {
    const { tweetUrl, walletAddress, predictionCode } = await request.json()

    // ✅ Валидация входных данных
    if (!tweetUrl || !walletAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidEvmAddress(walletAddress)) {
      return NextResponse.json({ success: false, error: "Invalid wallet address" }, { status: 400 })
    }

    // ✅ Rate limiting
    const rateLimit = checkRateLimit(walletAddress, "DAILY_RITUAL")
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        },
      )
    }

    console.log("[API] POST /api/ritual/verify", { walletAddress: walletAddress.slice(0, 10) + "..." })

    // Extract tweet ID
    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      return NextResponse.json({ success: false, error: "Could not extract tweet ID" }, { status: 400 })
    }

    // Fetch actual tweet content via Syndication API
    const tweet = await fetchTweetSyndication(tweetId)
    if (!tweet) {
      return NextResponse.json(
        { success: false, error: "Could not fetch tweet. Make sure it's public." },
        { status: 400 },
      )
    }

    // Verify tweet contains #KabbalahCode and wallet identifier
    const contentCheck = verifyTweetContent(tweet.text, walletAddress)
    if (!contentCheck.valid) {
      return NextResponse.json({ success: false, error: contentCheck.error }, { status: 400 })
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (error) {
      console.error("[API] Supabase client error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured. Please set up Supabase environment variables.",
        },
        { status: 500 },
      )
    }

    const normalized = normalizeAddress(walletAddress)

    // ✅ Get user with обработкой ошибок
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalized)
      .single()

    if (userError) {
      console.error("[API] Error fetching user:", userError)
      return NextResponse.json({ success: false, error: "Database error while fetching user" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if already completed today
    const today = new Date().toISOString().split("T")[0]
    if (user.last_ritual_date === today) {
      return NextResponse.json({ success: false, error: "Ritual already completed today" }, { status: 400 })
    }

    // Calculate streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const newStreak = user.last_ritual_date === yesterdayStr ? user.current_streak + 1 : 1
    const longestStreak = Math.max(newStreak, user.longest_streak)

    // Calculate points
    const basePoints = POINTS_CONFIG.DAILY_RITUAL
    const streakBonus = calculateStreakBonus(newStreak)
    const totalPoints = basePoints + streakBonus

    // ✅ Исправление race condition: атомарное обновление с обработкой ошибок
    const newTotalPoints = user.total_points + totalPoints
    const newLevel = calculateLevel(newTotalPoints)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: newTotalPoints,
        available_points: user.available_points + totalPoints,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_ritual_date: today,
        level: newLevel,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[API] Error updating user:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    // ✅ Record transaction с обработкой ошибок
    const { error: transactionError } = await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: totalPoints,
      type: "daily_ritual",
      description: `Daily ritual${streakBonus > 0 ? ` (+${streakBonus} streak bonus)` : ""}`,
    })

    if (transactionError) {
      console.error("[API] Error recording transaction:", transactionError)
      // Не откатываем, так как основная операция уже выполнена
    }

    // ✅ Распределение реферальных наград
    try {
      await distributeReferralRewards(user.id, totalPoints, "daily_ritual")
    } catch (error) {
      console.error("[API] Error distributing referral rewards:", error)
      // Не блокируем ответ, так как основная операция выполнена
    }

    // ✅ Проверка достижений
    try {
      await checkAndAwardAchievements(user.id, "rituals", { count: newStreak })
      if (newStreak >= 7) {
        await checkAndAwardAchievements(user.id, "streak", { days: 7 })
      }
      if (newStreak >= 30) {
        await checkAndAwardAchievements(user.id, "streak", { days: 30 })
      }
    } catch (error) {
      console.error("[API] Error checking achievements:", error)
    }

    return NextResponse.json({
      success: true,
      data: {
        points: totalPoints,
        basePoints,
        streakBonus,
        newStreak,
        newTotalPoints,
        newLevel,
      },
    })
  } catch (error) {
    console.error("[API] Error in POST /api/ritual/verify:", error)
    const errorMessage = error instanceof Error ? error.message : "Verification failed"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
