"use client"

import { useState } from "react"
import { generatePrediction, generateShareText, type Prediction } from "@/lib/predictions/generator"
import { POINTS_CONFIG, calculateStreakBonus } from "@/lib/points/calculator"
import { Sparkles, Share2, CheckCircle, ExternalLink, Copy, Check, AlertCircle, Loader2 } from "lucide-react"

interface DailyRitualProps {
  walletAddress: string
  walletNumber: number
  currentStreak: number
  hasCompletedToday: boolean
  twitterConnected: boolean
  onComplete: (points: number, newStreak: number) => void
}

export function DailyRitual({
  walletAddress,
  walletNumber,
  currentStreak,
  hasCompletedToday,
  twitterConnected,
  onComplete,
}: DailyRitualProps) {
  const [step, setStep] = useState<"idle" | "prophecy" | "share" | "verify" | "complete">(
    hasCompletedToday ? "complete" : "idle",
  )
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [tweetUrl, setTweetUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const walletShort = walletAddress.slice(2, 8).toLowerCase()

  const startRitual = () => {
    const newPrediction = generatePrediction(walletAddress, walletNumber)
    setPrediction(newPrediction)
    setStep("prophecy")
  }

  const shareToTwitter = () => {
    if (!prediction) return

    const shareText = `${prediction.message}\n#KabbalahCode`
    const text = encodeURIComponent(shareText)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`
    window.open(twitterUrl, "_blank", "width=550,height=420")
    setStep("share")
  }

  const copyPrediction = () => {
    if (!prediction) return
    const shareText = `${prediction.message}\n#KabbalahCode`
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyTweet = async () => {
    if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) {
      setError("Please enter a valid Twitter/X URL")
      return
    }

    setStep("verify")
    setError("")

    try {
      const response = await fetch("/api/ritual/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetUrl,
          walletAddress,
          predictionCode: prediction?.code,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStep("complete")
        onComplete(data.data.points, data.data.newStreak)
      } else {
        setError(data.error || "Verification failed")
        setStep("share")
      }
    } catch {
      setError("Network error. Please try again.")
      setStep("share")
    }
  }

  if (step === "complete" || hasCompletedToday) {
    return (
      <div className="p-6 border border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-white font-serif">Ritual Complete</h2>
        </div>
        <p className="text-white/50">Your daily prophecy has been shared. Return tomorrow for your next revelation.</p>
        {prediction && (
          <div className="mt-4 p-4 bg-black/50 border border-[#FF9500]/20">
            <p className="text-white/70 italic">&ldquo;{prediction.message}&rdquo;</p>
            <p className="text-[#FF9500] text-sm mt-2">{prediction.code}</p>
          </div>
        )}
      </div>
    )
  }

  if (step === "idle") {
    return (
      <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-serif">Daily Ritual</h2>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs uppercase font-bold">Available</span>
        </div>
        <p className="text-white/50 mb-4">
          Receive your daily prophecy from the Tree of Life and share it on X to earn points.
        </p>
        <div className="flex items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF9500]" />
            <span className="text-white/70">+{POINTS_CONFIG.DAILY_RITUAL} Points</span>
          </div>
          {currentStreak >= 6 && (
            <div className="flex items-center gap-2">
              <span className="text-green-400">+{calculateStreakBonus(currentStreak + 1)} Streak Bonus</span>
            </div>
          )}
        </div>
        <button
          onClick={startRitual}
          className="w-full py-4 bg-[#FF9500] text-black font-bold uppercase tracking-wide hover:bg-[#FFB340] transition-colors"
        >
          Begin Ritual
        </button>
      </div>
    )
  }

  if (step === "prophecy") {
    return (
      <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-white font-serif mb-6">Ваше пророчество</h2>

        {prediction && (
          <>
            <div className="p-6 bg-black border border-[#FF9500]/50 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FF9500] text-sm uppercase tracking-wide">{prediction.sephira.name}</span>
                <span className="text-white/30">•</span>
                <span className="text-white/50 text-sm">{prediction.domain.name}</span>
              </div>
              <p className="text-white text-lg leading-relaxed mb-4">&ldquo;{prediction.message}&rdquo;</p>
              <div className="flex items-center justify-between">
                <button onClick={copyPrediction} className="p-2 text-white/50 hover:text-white transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={shareToTwitter}
              className="w-full py-4 bg-[#FF9500] text-black font-bold uppercase tracking-wide hover:bg-[#FFB340] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Поделиться в X (Twitter)
            </button>
          </>
        )}
      </div>
    )
  }

  if (step === "share") {
    return (
      <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-white font-serif mb-6">Проверьте твит</h2>

        <p className="text-white/50 mb-4">Вставьте ссылку на ваш твит для проверки и получения баллов. Твит должен содержать текст вашего предсказания и хештег <span className="text-[#FF9500]">#KabbalahCode</span>.</p>

        <div className="space-y-4">
          <input
            type="url"
            value={tweetUrl}
            onChange={(e) => {
              setTweetUrl(e.target.value)
              setError("")
            }}
            placeholder="https://twitter.com/..."
            className="w-full bg-transparent border border-[#FF9500]/30 px-4 py-3 text-white focus:border-[#FF9500] focus:outline-none"
          />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={verifyTweet}
            disabled={!tweetUrl}
            className="w-full py-4 bg-[#FF9500] text-black font-bold uppercase tracking-wide hover:bg-[#FFB340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Проверить твит
          </button>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-[#FF9500] animate-spin mb-4" />
          <p className="text-white/70">Verifying your tweet...</p>
        </div>
      </div>
    )
  }

  return null
}
