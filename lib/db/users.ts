import { createClient } from "@/lib/supabase/server"

export interface DbUser {
  id: string
  wallet_address: string
  twitter_username: string | null
  twitter_verified_at: string | null
  telegram_username: string | null
  discord_username: string | null
  wallet_number: number
  level: number
  total_points: number
  available_points: number
  current_streak: number
  longest_streak: number
  last_ritual_date: string | null
  free_spins: number
  referral_code: string
  referred_by_code: string | null
  created_at: string
}

// Calculate wallet number from address
export function calculateWalletNumber(address: string): number {
  const hex = address.slice(2).toLowerCase()
  let sum = 0
  for (const char of hex) {
    sum += Number.parseInt(char, 16)
  }
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum
      .toString()
      .split("")
      .reduce((a, b) => a + Number.parseInt(b), 0)
  }
  return sum || 9
}

export async function getOrCreateUser(walletAddress: string): Promise<DbUser | null> {
  const supabase = await createClient()
  const normalizedAddress = walletAddress.toLowerCase()

  // ✅ Обработка ошибок Supabase
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", normalizedAddress)
    .maybeSingle()

  if (selectError) {
    console.error("[v0] Error fetching user:", selectError)
    throw new Error(`Database error while fetching user: ${selectError.message}`)
  }

  if (existingUser) {
    return existingUser as DbUser
  }

  const referralCode = `KC${normalizedAddress.slice(2, 8).toUpperCase()}`

  // Create new user
  const walletNumber = calculateWalletNumber(walletAddress)
  // ✅ Обработка ошибок при создании пользователя
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      wallet_address: normalizedAddress,
      wallet_number: walletNumber,
      total_points: 100, // Welcome bonus
      available_points: 100,
      free_spins: 1,
      referral_code: referralCode,
    })
    .select()
    .single()

  if (insertError) {
    console.error("[v0] Error creating user:", insertError)
    throw new Error(`Database error while creating user: ${insertError.message}`)
  }

  if (!newUser) {
    throw new Error("Failed to create user: no data returned")
  }

  // ✅ Record welcome bonus transaction с обработкой ошибок
  const { error: transactionError } = await supabase.from("points_transactions").insert({
    user_id: newUser.id,
    amount: 100,
    type: "welcome_bonus",
    description: "Welcome to Kabbalah Code!",
  })

  if (transactionError) {
    console.error("[v0] Error recording welcome bonus transaction:", transactionError)
    // Не откатываем создание пользователя, так как это не критично
  }

  return newUser as DbUser
}

export async function getUserByWallet(walletAddress: string): Promise<DbUser | null> {
  const supabase = await createClient()
  
  // ✅ Обработка ошибок Supabase
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching user by wallet:", error)
    throw new Error(`Database error while fetching user: ${error.message}`)
  }

  return data as DbUser | null
}

export async function updateUserPoints(
  userId: string,
  pointsDelta: number,
  type: string,
  description?: string,
): Promise<boolean> {
  const supabase = await createClient()

  // ✅ Get current user с обработкой ошибок
  const { data: user, error: selectError } = await supabase
    .from("users")
    .select("total_points, available_points")
    .eq("id", userId)
    .single()

  if (selectError) {
    console.error("[v0] Error fetching user for points update:", selectError)
    return false
  }

  if (!user) {
    console.error("[v0] User not found for points update:", userId)
    return false
  }

  // ✅ Update points с обработкой ошибок
  const newTotal = Math.max(0, user.total_points + pointsDelta)
  const newAvailable = Math.max(0, user.available_points + pointsDelta)

  const { error: updateError } = await supabase
    .from("users")
    .update({
      total_points: newTotal,
      available_points: newAvailable,
      level: calculateLevel(newTotal),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("[v0] Error updating user points:", updateError)
    return false
  }

  // ✅ Record transaction с обработкой ошибок
  const { error: transactionError } = await supabase.from("points_transactions").insert({
    user_id: userId,
    amount: pointsDelta,
    type,
    description,
  })

  if (transactionError) {
    console.error("[v0] Error recording points transaction:", transactionError)
    // Не возвращаем false, так как основная операция уже выполнена
  }

  return true
}

export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1
  if (totalPoints < 250) return 2
  if (totalPoints < 500) return 3
  if (totalPoints < 1000) return 4
  if (totalPoints < 2000) return 5
  // After level 5: each level needs 1000 more points
  const level = Math.floor((totalPoints - 1000) / 1000) + 5
  return Math.min(level, 75)
}

export function getPointsForLevel(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 250
  if (level === 4) return 500
  if (level === 5) return 1000
  return 1000 + (level - 5) * 1000
}
