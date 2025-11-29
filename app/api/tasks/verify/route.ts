import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByWallet, calculateLevel } from "@/lib/db/users"
import { verifyTweetViaSyndication, fetchTweetSyndication } from "@/lib/twitter/syndication"
import { extractTweetId } from "@/lib/twitter/verification"
import { POINTS_CONFIG } from "@/lib/points/calculator"
import { isValidEvmAddress, isValidTwitterUrl } from "@/lib/anti-abuse/validators"
import { checkRateLimit } from "@/lib/anti-abuse/rate-limiter"
import { distributeReferralRewards } from "@/lib/referrals/system"

const TASK_POINTS: Record<string, number> = {
  follow_twitter: POINTS_CONFIG.FOLLOW_TWITTER,
  like_pinned: POINTS_CONFIG.LIKE_TWEET,
  retweet_pinned: POINTS_CONFIG.RETWEET_TWEET,
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, taskId, taskType, tweetUrl } = await request.json()

    // ✅ Валидация входных данных
    if (!walletAddress || !taskId || !tweetUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidEvmAddress(walletAddress)) {
      return NextResponse.json({ success: false, error: "Invalid wallet address format" }, { status: 400 })
    }

    if (!isValidTwitterUrl(tweetUrl)) {
      return NextResponse.json({ success: false, error: "Invalid Twitter/X URL format" }, { status: 400 })
    }

    // ✅ Rate limiting
    const rateLimit = checkRateLimit(walletAddress, "API_GENERAL")
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
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        },
      )
    }

    console.log("[API] POST /api/tasks/verify", { walletAddress: walletAddress.slice(0, 10) + "...", taskId })

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

    const user = await getUserByWallet(walletAddress)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // ✅ Check if already completed
    const { data: existingTask, error: checkError } = await supabase
      .from("tasks_completion")
      .select("id")
      .eq("user_id", user.id)
      .eq("task_type", taskId)
      .maybeSingle()

    if (checkError) {
      console.error("[API] Error checking existing task:", checkError)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (existingTask) {
      return NextResponse.json({ success: false, error: "Task already completed" }, { status: 400 })
    }

    // ✅ Verify tweet via Syndication API (бесплатный парсинг)
    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      return NextResponse.json({ success: false, error: "Could not extract tweet ID from URL" }, { status: 400 })
    }

    const tweet = await fetchTweetSyndication(tweetId)
    if (!tweet) {
      return NextResponse.json(
        { success: false, error: "Could not fetch tweet. Make sure it exists and is public." },
        { status: 400 },
      )
    }

    const walletId = walletAddress.slice(2, 8).toLowerCase()
    const text = tweet.text.toLowerCase()

    // Проверка наличия хештега и идентификатора кошелька
    if (!text.includes("#kabbalahcode")) {
      return NextResponse.json(
        { success: false, error: "Tweet must include #KabbalahCode hashtag" },
        { status: 400 },
      )
    }

    if (!text.includes(walletId)) {
      return NextResponse.json(
        { success: false, error: `Tweet must include your wallet identifier: ${walletId}` },
        { status: 400 },
      )
    }

    // ✅ Check if this tweet was already used
    const { data: usedTweet, error: usedError } = await supabase
      .from("tasks_completion")
      .select("id")
      .eq("task_data->>tweetUrl", tweetUrl)
      .maybeSingle()

    if (usedError) {
      console.error("[API] Error checking used tweet:", usedError)
    }

    if (usedTweet) {
      return NextResponse.json({ success: false, error: "This tweet was already used for verification" }, { status: 400 })
    }

    // ✅ Award points
    const points = TASK_POINTS[taskId] || 50
    const newTotal = user.total_points + points
    const newAvailable = user.available_points + points
    const newLevel = calculateLevel(newTotal)

    // ✅ Update user с обработкой ошибок
    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: newTotal,
        available_points: newAvailable,
        level: newLevel,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[API] Error updating user:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update user points" }, { status: 500 })
    }

    // ✅ Record task completion
    const { error: taskError } = await supabase.from("tasks_completion").insert({
      user_id: user.id,
      task_type: taskId,
      task_data: { tweetUrl, tweetId, username: tweet.user.screen_name },
      points_earned: points,
    })

    if (taskError) {
      console.error("[API] Error recording task completion:", taskError)
      // Откатываем обновление очков
      await supabase
        .from("users")
        .update({
          total_points: user.total_points,
          available_points: user.available_points,
        })
        .eq("id", user.id)
      return NextResponse.json({ success: false, error: "Failed to record task completion" }, { status: 500 })
    }

    // ✅ Record points transaction
    const { error: transactionError } = await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: points,
      type: "task_completion",
      description: `Task: ${taskId.replace(/_/g, " ")}`,
      metadata: {
        task_id: taskId,
        task_type: taskType,
        tweet_url: tweetUrl,
      },
    })

    if (transactionError) {
      console.error("[API] Error recording transaction:", transactionError)
    }

    // ✅ Распределение реферальных наград
    if (points > 0) {
      try {
        await distributeReferralRewards(user.id, points, "task_completion")
      } catch (error) {
        console.error("[API] Error distributing referral rewards:", error)
      }
    }

    return NextResponse.json({
      success: true,
      points,
      newTotal,
      newAvailable,
      newLevel,
      username: tweet.user.screen_name,
    })
  } catch (error) {
    console.error("[API] Error in POST /api/tasks/verify:", error)
    const errorMessage = error instanceof Error ? error.message : "Verification failed"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
