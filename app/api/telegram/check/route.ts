import { type NextRequest, NextResponse } from "next/server"
import { getUserByWallet } from "@/lib/db/users"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet required" }, { status: 400 })
    }

    const user = await getUserByWallet(walletAddress)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if telegram is connected
    if (user.telegram_username) {
      return NextResponse.json({
        connected: true,
        username: user.telegram_username,
      })
    }

    // In production, this would check against a pending_telegram_connections table
    // that gets populated when user sends verification code to the bot
    // For now, return not connected
    return NextResponse.json({ connected: false })
  } catch (error) {
    console.error("[v0] Telegram check error:", error)
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
}
