"use server"

import { createClient } from "@/lib/supabase/server"
import { verifyMessage } from "ethers"
import { isValidEvmAddress } from "@/lib/anti-abuse/validators"

interface AuthResult {
  success: boolean
  error?: string
  userId?: string
  isNewUser?: boolean
}

// Verify signature and create/update user
export async function authenticateWithWallet(
  address: string,
  signature: string,
  message: string,
  referralCode?: string,
): Promise<AuthResult> {
  try {
    // ✅ Валидация входных данных
    if (!address || !signature || !message) {
      return { success: false, error: "Missing required fields" }
    }

    if (!isValidEvmAddress(address)) {
      return { success: false, error: "Invalid wallet address format" }
    }

    // ✅ КРИТИЧНО: Проверка криптографической подписи
    let recoveredAddress: string
    try {
      recoveredAddress = verifyMessage(message, signature)
    } catch (error) {
      console.error("[v0] Signature verification error:", error)
      return { success: false, error: "Invalid signature format" }
    }

    // ✅ Проверка, что восстановленный адрес совпадает с переданным
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      console.error("[v0] Signature mismatch:", {
        provided: address.toLowerCase(),
        recovered: recoveredAddress.toLowerCase(),
      })
      return { success: false, error: "Signature does not match wallet address" }
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", address.toLowerCase())
      .maybeSingle()

    if (selectError) {
      console.error("[v0] Error fetching user:", selectError)
      return { success: false, error: "Database error while fetching user" }
    }

    if (existingUser) {
      // User exists, sign them in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${address.toLowerCase()}@wallet.kabbalahcode.app`,
        password: signature.slice(0, 72), // Use part of signature as password
      })

      if (signInError) {
        // Try to update password and sign in again
        return { success: true, userId: existingUser.id, isNewUser: false }
      }

      return { success: true, userId: existingUser.id, isNewUser: false }
    }

    // New user - create account
    const email = `${address.toLowerCase()}@wallet.kabbalahcode.app`
    const password = signature.slice(0, 72)

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          (typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard"),
        data: {
          wallet_address: address.toLowerCase(),
        },
      },
    })

    if (signUpError) {
      return { success: false, error: signUpError.message }
    }

    return {
      success: true,
      userId: authData.user?.id,
      isNewUser: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    }
  }
}

// Create user profile after auth
export async function createUserProfile(
  userId: string,
  walletAddress: string,
  walletNumber: number,
  referralCode?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Find referrer if referral code provided
    let referrerId: string | null = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single()

      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      wallet_address: walletAddress.toLowerCase(),
      wallet_number: walletNumber,
      referred_by: referrerId,
    })

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // If referred, create referral relationship
    if (referrerId) {
      await supabase.from("referrals").insert({
        referrer_id: referrerId,
        referred_id: userId,
        level: 1,
      })

      // Create L2 referral if referrer was also referred
      const { data: l2Referrer } = await supabase.from("users").select("referred_by").eq("id", referrerId).single()

      if (l2Referrer?.referred_by) {
        await supabase.from("referrals").insert({
          referrer_id: l2Referrer.referred_by,
          referred_id: userId,
          level: 2,
        })

        // Create L3 referral
        const { data: l3Referrer } = await supabase
          .from("users")
          .select("referred_by")
          .eq("id", l2Referrer.referred_by)
          .single()

        if (l3Referrer?.referred_by) {
          await supabase.from("referrals").insert({
            referrer_id: l3Referrer.referred_by,
            referred_id: userId,
            level: 3,
          })
        }
      }
    }

    // Unlock first sephira (Malkuth)
    const { data: malkuth } = await supabase.from("sephirot").select("id").eq("name", "Malkuth").single()

    if (malkuth) {
      await supabase.from("user_sephirot").insert({
        user_id: userId,
        sephira_id: malkuth.id,
      })
    }

    // Award first step achievement
    const { data: firstStep } = await supabase
      .from("achievements")
      .select("id, points_reward")
      .eq("code", "first_step")
      .single()

    if (firstStep) {
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: firstStep.id,
      })

      // Add points
      await supabase.from("points_transactions").insert({
        user_id: userId,
        amount: firstStep.points_reward,
        type: "achievement",
        description: "First Step achievement",
      })

      // Update user points
      await supabase
        .from("users")
        .update({
          total_points: firstStep.points_reward,
          available_points: firstStep.points_reward,
        })
        .eq("id", userId)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create profile",
    }
  }
}
