"use client"

import type React from "react"
import { useState } from "react"
import { Check, ExternalLink, Twitter, Send, Users, Heart, Repeat, Loader2, AlertCircle, Link2 } from "lucide-react"

interface Task {
  id: string
  type: string
  title: string
  description: string
  points: number
  icon: React.ReactNode
  link?: string
  completed: boolean
  requiresVerification: boolean
  verificationHint?: string
}

interface TasksSectionProps {
  walletAddress: string
  twitterConnected: boolean
  completedTasks: string[]
  onTaskComplete: (taskId: string, points: number) => void
}

export function TasksSection({ walletAddress, twitterConnected, completedTasks, onTaskComplete }: TasksSectionProps) {
  const [loadingTask, setLoadingTask] = useState<string | null>(null)
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null)
  const [verifyUrl, setVerifyUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const walletId = walletAddress.slice(2, 8).toLowerCase()

  const tasks: Task[] = [
    {
      id: "follow_twitter",
      type: "twitter_follow",
      title: "Follow @KabbalahCode",
      description: "Follow and verify with a tweet",
      points: 100,
      icon: <Twitter size={20} />,
      link: "https://twitter.com/intent/follow?screen_name=KabbalahCode",
      completed: completedTasks.includes("follow_twitter"),
      requiresVerification: true,
      verificationHint: `Tweet: "Following @KabbalahCode #KabbalahCode ${walletId}"`,
    },
    {
      id: "like_pinned",
      type: "twitter_like",
      title: "Like Pinned Tweet",
      description: "Like and verify with a quote tweet",
      points: 25,
      icon: <Heart size={20} />,
      link: "https://twitter.com/KabbalahCode",
      completed: completedTasks.includes("like_pinned"),
      requiresVerification: true,
      verificationHint: `Quote tweet with #KabbalahCode ${walletId}`,
    },
    {
      id: "retweet_pinned",
      type: "twitter_retweet",
      title: "Retweet Announcement",
      description: "Retweet with comment to verify",
      points: 75,
      icon: <Repeat size={20} />,
      link: "https://twitter.com/KabbalahCode",
      completed: completedTasks.includes("retweet_pinned"),
      requiresVerification: true,
      verificationHint: `Retweet with: #KabbalahCode ${walletId}`,
    },
    {
      id: "join_telegram",
      type: "telegram_join",
      title: "Join Telegram Channel",
      description: "Connect Telegram in Profile to verify",
      points: 50,
      icon: <Send size={20} />,
      link: "https://t.me/KabbalahCode",
      completed: completedTasks.includes("join_telegram"),
      requiresVerification: false, // Verified via Telegram bot connection
    },
    {
      id: "join_telegram_chat",
      type: "telegram_chat",
      title: "Join Telegram Chat",
      description: "Connect Telegram in Profile to verify",
      points: 50,
      icon: <Users size={20} />,
      link: "https://t.me/KabbalahCodeChat",
      completed: completedTasks.includes("join_telegram_chat"),
      requiresVerification: false,
    },
  ]

  const handleVerifyTask = async (task: Task) => {
    if (!verifyUrl.trim()) {
      setError("Please enter your tweet URL")
      return
    }

    setLoadingTask(task.id)
    setError(null)

    try {
      const res = await fetch("/api/tasks/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          taskId: task.id,
          taskType: task.type,
          tweetUrl: verifyUrl,
        }),
      })

      const data = await res.json()

      if (data.success) {
        onTaskComplete(task.id, task.points)
        setVerifyingTask(null)
        setVerifyUrl("")
      } else {
        setError(data.error || "Verification failed. Make sure your tweet contains #KabbalahCode and your wallet ID.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setLoadingTask(null)
    }
  }

  const handleTaskClick = (task: Task) => {
    if (task.completed || loadingTask) return

    // Open link
    if (task.link) {
      window.open(task.link, "_blank")
    }

    // If requires verification, show input
    if (task.requiresVerification) {
      setVerifyingTask(task.id)
      setError(null)
    }
  }

  const totalEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0)
  const totalPossible = tasks.reduce((sum, t) => sum + t.points, 0)

  return (
    <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white font-serif">Social Tasks</h2>
        <span className="text-white/50 text-sm">
          {totalEarned}/{totalPossible} pts
        </span>
      </div>

      {!twitterConnected && (
        <div className="mb-4 p-3 bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          Verify Twitter first in Dashboard tab
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id}>
            <button
              onClick={() => handleTaskClick(task)}
              disabled={
                task.completed || loadingTask === task.id || (!twitterConnected && task.type.startsWith("twitter"))
              }
              className={`w-full p-4 border flex items-center gap-4 transition-all ${
                task.completed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-[#FF9500]/20 hover:border-[#FF9500]/50 hover:bg-[#FF9500]/5"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center ${task.completed ? "text-green-500" : "text-[#FF9500]"}`}
              >
                {loadingTask === task.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : task.completed ? (
                  <Check size={20} />
                ) : (
                  task.icon
                )}
              </div>

              <div className="flex-1 text-left">
                <p className={`font-medium ${task.completed ? "text-green-400" : "text-white"}`}>{task.title}</p>
                <p className="text-white/40 text-sm">{task.description}</p>
              </div>

              <div className="text-right">
                <span className={`font-bold ${task.completed ? "text-green-400" : "text-[#FF9500]"}`}>
                  {task.completed ? "Done" : `+${task.points}`}
                </span>
              </div>

              {!task.completed && <ExternalLink size={16} className="text-white/30" />}
            </button>

            {/* Verification input */}
            {verifyingTask === task.id && !task.completed && (
              <div className="mt-2 p-4 bg-black/50 border border-[#FF9500]/20 space-y-3">
                <p className="text-white/50 text-sm">{task.verificationHint}</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Paste your tweet URL here"
                      value={verifyUrl}
                      onChange={(e) => setVerifyUrl(e.target.value)}
                      className="w-full bg-black border border-[#FF9500]/30 pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#FF9500]"
                    />
                  </div>
                  <button
                    onClick={() => handleVerifyTask(task)}
                    disabled={loadingTask === task.id}
                    className="px-4 py-2 bg-[#FF9500] text-black font-bold text-sm hover:bg-[#FFB340] disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={() => {
                    setVerifyingTask(null)
                    setError(null)
                    setVerifyUrl("")
                  }}
                  className="text-white/50 text-sm hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
