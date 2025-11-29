import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByWallet, calculateLevel } from "@/lib/db/users"
import { POINTS_CONFIG } from "@/lib/points/calculator"
import { distributeReferralRewards } from "@/lib/referrals/system"
import { isValidEvmAddress } from "@/lib/anti-abuse/validators"
import { checkRateLimit } from "@/lib/anti-abuse/rate-limiter"

const TASK_POINTS: Record<string, number> = {
  follow_twitter: POINTS_CONFIG.FOLLOW_TWITTER,
  like_pinned: POINTS_CONFIG.LIKE_TWEET,
  retweet_pinned: POINTS_CONFIG.RETWEET_TWEET,
  join_telegram: POINTS_CONFIG.JOIN_TELEGRAM_GROUP,
  join_telegram_chat: POINTS_CONFIG.JOIN_TELEGRAM_CHAT,
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, taskId, taskType } = await request.json()

    // ✅ Валидация входных данных
    if (!walletAddress || !taskId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidEvmAddress(walletAddress)) {
      return NextResponse.json({ success: false, error: "Invalid wallet address format" }, { status: 400 })
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

    console.log("[API] POST /api/tasks/complete", { walletAddress: walletAddress.slice(0, 10) + "...", taskId })

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

    // ✅ Check if task already completed с обработкой ошибок
    const { data: existing, error: checkError } = await supabase
      .from("tasks_completion")
      .select("id")
      .eq("user_id", user.id)
      .eq("task_type", taskId)
      .maybeSingle()

    if (checkError) {
      console.error("[API] Error checking existing task:", checkError)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ success: false, error: "Task already completed" }, { status: 400 })
    }

    const points = TASK_POINTS[taskId] || 0

    if (points <= 0) {
      return NextResponse.json({ success: false, error: "Invalid task or task has no points" }, { status: 400 })
    }

    // ✅ Record task completion с обработкой ошибок
    const { error: taskError } = await supabase.from("tasks_completion").insert({
      user_id: user.id,
      task_type: taskId,
      points_earned: points,
    })

    if (taskError) {
      console.error("[API] Error recording task completion:", taskError)
      return NextResponse.json({ success: false, error: "Failed to record task completion" }, { status: 500 })
    }

    // ✅ Update user points с обработкой ошибок
    const newTotal = user.total_points + points
    const newAvailable = user.available_points + points
    const newLevel = calculateLevel(newTotal)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: newTotal,
        available_points: newAvailable,
        level: newLevel,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[API] Error updating user points:", updateError)
      // Откатываем запись задачи
      await supabase.from("tasks_completion").delete().eq("user_id", user.id).eq("task_type", taskId)
      return NextResponse.json({ success: false, error: "Failed to update user points" }, { status: 500 })
    }

    // ✅ Record transaction
    const { error: transactionError } = await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: points,
      type: "task_completion",
      description: `Completed: ${taskId}`,
      metadata: {
        task_id: taskId,
        task_type: taskType,
      },
    })

    if (transactionError) {
      console.error("[API] Error recording transaction:", transactionError)
      // Не откатываем, так как основная операция выполнена
    }

    // ✅ Распределение реферальных наград
    if (points > 0) {
      try {
        await distributeReferralRewards(user.id, points, "task_completion")
      } catch (error) {
        console.error("[API] Error distributing referral rewards:", error)
      }
    }

    return NextResponse.json({ success: true, points, newTotal, newAvailable, newLevel })
  } catch (error) {
    console.error("[API] Error in POST /api/tasks/complete:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to complete task"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
