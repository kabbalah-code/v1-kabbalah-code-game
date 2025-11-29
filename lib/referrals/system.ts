// Referral System - 3 levels: 5%, 3%, 1%
import { createClient } from "@/lib/supabase/server"

export const REFERRAL_PERCENTAGES = {
  1: 0.05, // 5%
  2: 0.03, // 3%
  3: 0.01, // 1%
} as const

export type ReferralLevel = 1 | 2 | 3

interface ReferralChain {
  referrerId: string
  level: ReferralLevel
}

/**
 * Get referral chain for a user (up to 3 levels)
 */
export async function getReferralChain(userId: string): Promise<ReferralChain[]> {
  const supabase = await createClient()
  const chain: ReferralChain[] = []

  // Get direct referrer (level 1)
  const { data: level1, error: error1 } = await supabase
    .from("referrals")
    .select("referrer_id")
    .eq("referred_id", userId)
    .eq("level", 1)
    .maybeSingle()

  if (error1) {
    console.error("[Referrals] Error fetching level 1:", error1)
    return chain
  }

  if (level1) {
    chain.push({ referrerId: level1.referrer_id, level: 1 })

    // Get level 2 referrer
    const { data: level2, error: error2 } = await supabase
      .from("referrals")
      .select("referrer_id")
      .eq("referred_id", level1.referrer_id)
      .eq("level", 1)
      .maybeSingle()

    if (!error2 && level2) {
      chain.push({ referrerId: level2.referrer_id, level: 2 })

      // Get level 3 referrer
      const { data: level3, error: error3 } = await supabase
        .from("referrals")
        .select("referrer_id")
        .eq("referred_id", level2.referrer_id)
        .eq("level", 1)
        .maybeSingle()

      if (!error3 && level3) {
        chain.push({ referrerId: level3.referrer_id, level: 3 })
      }
    }
  }

  return chain
}

/**
 * Distribute referral rewards when a user earns points
 */
export async function distributeReferralRewards(
  userId: string,
  earnedPoints: number,
  transactionType: string,
): Promise<void> {
  if (earnedPoints <= 0) return

  const chain = await getReferralChain(userId)

  if (chain.length === 0) return

  const supabase = await createClient()

  for (const { referrerId, level } of chain) {
    const percentage = REFERRAL_PERCENTAGES[level]
    const reward = Math.floor(earnedPoints * percentage)

    if (reward <= 0) continue

    try {
      // Get referrer's current points
      const { data: referrer, error: referrerError } = await supabase
        .from("users")
        .select("total_points, available_points")
        .eq("id", referrerId)
        .single()

      if (referrerError || !referrer) {
        console.error(`[Referrals] Error fetching referrer ${referrerId}:`, referrerError)
        continue
      }

      // Update referrer's points
      const { error: updateError } = await supabase
        .from("users")
        .update({
          total_points: referrer.total_points + reward,
          available_points: referrer.available_points + reward,
        })
        .eq("id", referrerId)

      if (updateError) {
        console.error(`[Referrals] Error updating referrer ${referrerId}:`, updateError)
        continue
      }

      // Record referral transaction
      const { error: transactionError } = await supabase.from("points_transactions").insert({
        user_id: referrerId,
        amount: reward,
        type: "referral_reward",
        description: `Referral reward (L${level}): ${reward} points from ${transactionType}`,
        metadata: {
          referred_user_id: userId,
          level,
          original_amount: earnedPoints,
          percentage,
        },
      })

      if (transactionError) {
        console.error(`[Referrals] Error recording transaction for ${referrerId}:`, transactionError)
      }

      console.log(
        `[Referrals] Distributed ${reward} points to referrer ${referrerId} (L${level}) from ${earnedPoints} points`,
      )
    } catch (error) {
      console.error(`[Referrals] Error processing referral for ${referrerId}:`, error)
    }
  }
}

/**
 * Create referral relationships when a new user signs up with a referral code
 */
export async function createReferralRelationships(
  newUserId: string,
  referralCode: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Find referrer by code
  const { data: referrer, error: referrerError } = await supabase
    .from("users")
    .select("id, referred_by_code")
    .eq("referral_code", referralCode.toUpperCase())
    .single()

  if (referrerError || !referrer) {
    return { success: false, error: "Invalid referral code" }
  }

  // Prevent self-referral
  if (referrer.id === newUserId) {
    return { success: false, error: "Cannot refer yourself" }
  }

  // Create level 1 referral
  const { error: level1Error } = await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    level: 1,
  })

  if (level1Error) {
    console.error("[Referrals] Error creating level 1 referral:", level1Error)
    return { success: false, error: "Failed to create referral relationship" }
  }

  // Get level 2 referrer (if exists)
  if (referrer.referred_by_code) {
    const { data: level2Referrer, error: level2Error } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", referrer.referred_by_code)
      .single()

    if (!level2Error && level2Referrer) {
      // Create level 2 referral
      await supabase.from("referrals").insert({
        referrer_id: level2Referrer.id,
        referred_id: newUserId,
        level: 2,
      })

      // Get level 3 referrer (if exists)
      const { data: level2User } = await supabase
        .from("users")
        .select("referred_by_code")
        .eq("id", level2Referrer.id)
        .single()

      if (level2User?.referred_by_code) {
        const { data: level3Referrer } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", level2User.referred_by_code)
          .single()

        if (level3Referrer) {
          // Create level 3 referral
          await supabase.from("referrals").insert({
            referrer_id: level3Referrer.id,
            referred_id: newUserId,
            level: 3,
          })
        }
      }
    }
  }

  // Update user's referred_by_code
  await supabase.from("users").update({ referred_by_code: referralCode.toUpperCase() }).eq("id", newUserId)

  return { success: true }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<{
  level1Count: number
  level2Count: number
  level3Count: number
  totalEarned: number
}> {
  const supabase = await createClient()

  // Count referrals by level
  const [level1Result, level2Result, level3Result, earningsResult] = await Promise.all([
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId).eq("level", 1),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId).eq("level", 2),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId).eq("level", 3),
    supabase
      .from("points_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "referral_reward"),
  ])

  const totalEarned =
    earningsResult.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

  return {
    level1Count: level1Result.count || 0,
    level2Count: level2Result.count || 0,
    level3Count: level3Result.count || 0,
    totalEarned,
  }
}


