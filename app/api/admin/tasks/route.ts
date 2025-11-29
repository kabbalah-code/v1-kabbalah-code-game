import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidEvmAddress } from "@/lib/anti-abuse/validators"
import { isAdmin } from "@/lib/admin/auth"

// GET - список всех заданий
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet")

    if (!wallet || !isValidEvmAddress(wallet)) {
      return NextResponse.json({ success: false, error: "Valid wallet address required" }, { status: 400 })
    }

    if (!isAdmin(wallet)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const supabase = await createClient()

    // Get all tasks from admin_tasks table (will be created)
    // For now, return hardcoded tasks structure
    const tasks = [
      {
        id: "follow_twitter",
        type: "twitter_follow",
        title: "Follow @KabbalahCode",
        description: "Follow and verify with a tweet",
        points: 100,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "like_pinned",
        type: "twitter_like",
        title: "Like Pinned Tweet",
        description: "Like and verify with a quote tweet",
        points: 25,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "retweet_pinned",
        type: "twitter_retweet",
        title: "Retweet Announcement",
        description: "Retweet with comment to verify",
        points: 75,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "join_telegram",
        type: "telegram_join",
        title: "Join Telegram Channel",
        description: "Connect Telegram in Profile to verify",
        points: 50,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "join_telegram_chat",
        type: "telegram_chat",
        title: "Join Telegram Chat",
        description: "Connect Telegram in Profile to verify",
        points: 50,
        active: true,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error("[API] Error in GET /api/admin/tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST - создать/обновить задание
export async function POST(request: NextRequest) {
  try {
    const { wallet, task } = await request.json()

    if (!wallet || !isValidEvmAddress(wallet)) {
      return NextResponse.json({ success: false, error: "Valid wallet address required" }, { status: 400 })
    }

    if (!isAdmin(wallet)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    if (!task || !task.id || !task.title || !task.points) {
      return NextResponse.json({ success: false, error: "Invalid task data" }, { status: 400 })
    }

    const supabase = await createClient()

    // TODO: Save to admin_tasks table
    // For now, just return success
    console.log("[Admin] Task created/updated:", task)

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error("[API] Error in POST /api/admin/tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to save task" }, { status: 500 })
  }
}

// DELETE - удалить задание
export async function DELETE(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet")
    const taskId = request.nextUrl.searchParams.get("taskId")

    if (!wallet || !isValidEvmAddress(wallet)) {
      return NextResponse.json({ success: false, error: "Valid wallet address required" }, { status: 400 })
    }

    if (!isAdmin(wallet)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID required" }, { status: 400 })
    }

    // TODO: Delete from admin_tasks table
    console.log("[Admin] Task deleted:", taskId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error in DELETE /api/admin/tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 })
  }
}


