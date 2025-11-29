import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByWallet, calculateLevel } from "@/lib/db/users"
import { WHEEL_REWARDS, spinWheel, POINTS_CONFIG } from "@/lib/points/calculator"
import { isValidEvmAddress } from "@/lib/anti-abuse/validators"
import { checkRateLimit } from "@/lib/anti-abuse/rate-limiter"
import { distributeReferralRewards } from "@/lib/referrals/system"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, useFree } = await request.json()

    // ✅ Валидация входных данных
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: "Wallet required" }, { status: 400 })
    }

    if (!isValidEvmAddress(walletAddress)) {
      return NextResponse.json({ success: false, error: "Invalid wallet address format" }, { status: 400 })
    }

    if (typeof useFree !== "boolean") {
      return NextResponse.json({ success: false, error: "useFree must be a boolean" }, { status: 400 })
    }

    // ✅ Rate limiting
    const rateLimit = checkRateLimit(walletAddress, "WHEEL_SPIN")
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
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        },
      )
    }

    console.log("[API] POST /api/points/spin", { walletAddress: walletAddress.slice(0, 10) + "...", useFree })

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

    // ✅ Обработка ошибок Supabase
    const user = await getUserByWallet(walletAddress)
    if (!user) {
      console.error("[API] User not found:", walletAddress)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if can spin
    if (useFree && user.free_spins <= 0) {
      return NextResponse.json({ success: false, error: "No free spins available" }, { status: 400 })
    }

    if (!useFree && user.available_points < POINTS_CONFIG.EXTRA_SPIN_COST) {
      return NextResponse.json({ success: false, error: "Not enough points" }, { status: 400 })
    }

    // Spin the wheel
    const reward = spinWheel()
    const rewardIndex = WHEEL_REWARDS.findIndex((r) => r.type === reward.type && r.value === reward.value)

    let pointsChange = 0
    let description = ""
    const updates: Record<string, unknown> = {
      free_spins: useFree ? user.free_spins - 1 : user.free_spins,
    }

    switch (reward.type) {
      case "points":
        pointsChange = reward.value
        description = `Wheel: +${reward.value} Points`
        break

      case "jackpot":
        pointsChange = reward.value
        description = `JACKPOT! +${reward.value} Points!`
        break

      case "multiplier":
        // x2 multiplier for next ritual (24h)
        updates.active_multiplier = reward.value
        updates.multiplier_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        description = `Wheel: x${reward.value} Multiplier (24h)`
        break

      case "boost":
        // +10% boost for 24h on all earned points
        updates.active_boost_percent = reward.value
        updates.boost_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        description = `Wheel: +${reward.value}% Boost (24h)`
        break
    }

    // Deduct cost if paid spin
    if (!useFree) {
      pointsChange -= POINTS_CONFIG.EXTRA_SPIN_COST
      description += " (-100 cost)"
    }

    // ✅ Исправление race condition: используем атомарное обновление
    const newTotal = user.total_points + Math.max(0, pointsChange)
    const newAvailable = user.available_points + pointsChange

    updates.total_points = newTotal
    updates.available_points = newAvailable
    updates.level = calculateLevel(newTotal)

    // ✅ Атомарное обновление с проверкой ошибок
    const { error: updateError } = await supabase.from("users").update(updates).eq("id", user.id)

    if (updateError) {
      console.error("[API] Error updating user points:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update user points" },
        { status: 500 },
      )
    }

    // ✅ Запись спина с обработкой ошибок
    const { error: spinError } = await supabase.from("wheel_spins").insert({
      user_id: user.id,
      reward_type: reward.type,
      reward_value: reward.value,
      is_free: useFree,
    })

    if (spinError) {
      console.error("[API] Error recording spin:", spinError)
      // Откатываем обновление очков
      await supabase
        .from("users")
        .update({
          total_points: user.total_points,
          available_points: user.available_points,
          free_spins: user.free_spins,
        })
        .eq("id", user.id)
      return NextResponse.json(
        { success: false, error: "Failed to record spin" },
        { status: 500 },
      )
    }

    // ✅ Запись транзакции с обработкой ошибок
    const { error: transactionError } = await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: pointsChange,
      type: "wheel_spin",
      description,
    })

    if (transactionError) {
      console.error("[API] Error recording transaction:", transactionError)
      // Не откатываем, так как основная операция уже выполнена
    }

    // ✅ Распределение реферальных наград (только если начислены очки)
    if (pointsChange > 0) {
      try {
        await distributeReferralRewards(user.id, pointsChange, "wheel_spin")
      } catch (error) {
        console.error("[API] Error distributing referral rewards:", error)
        // Не блокируем ответ, так как основная операция выполнена
      }
    }

    return NextResponse.json({
      success: true,
      reward,
      rewardIndex,
      pointsChange,
      newTotal,
      newAvailable,
      freeSpins: updates.free_spins,
      activeMultiplier: updates.active_multiplier || user.active_multiplier || 1,
      activeBoost: updates.active_boost_percent || user.active_boost_percent || 0,
    })
  } catch (error) {
    console.error("[API] Error in POST /api/points/spin:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to spin"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
