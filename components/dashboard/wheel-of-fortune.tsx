"use client"

import { useState } from "react"
import { WHEEL_REWARDS, POINTS_CONFIG } from "@/lib/points/calculator"
import { Gift, Sparkles, Loader2, Zap, TrendingUp } from "lucide-react"

interface WheelOfFortuneProps {
  walletAddress: string
  freeSpinsAvailable: number
  availablePoints: number
  activeMultiplier?: number
  activeBoost?: number
  onSpinComplete: (reward: (typeof WHEEL_REWARDS)[number], pointsChange: number, newFreeSpins: number) => void
}

export function WheelOfFortune({
  walletAddress,
  freeSpinsAvailable,
  availablePoints,
  activeMultiplier = 1,
  activeBoost = 0,
  onSpinComplete,
}: WheelOfFortuneProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<(typeof WHEEL_REWARDS)[number] | null>(null)
  const [rotation, setRotation] = useState(0)

  const canBuySpin = availablePoints >= POINTS_CONFIG.EXTRA_SPIN_COST
  const hasActiveBoosters = activeMultiplier > 1 || activeBoost > 0

  const segmentCount = WHEEL_REWARDS.length
  const segmentAngle = 360 / segmentCount

  const handleSpin = async (useFree: boolean) => {
    if (isSpinning) return
    if (useFree && freeSpinsAvailable <= 0) return
    if (!useFree && !canBuySpin) return

    setIsSpinning(true)
    setResult(null)

    try {
      const res = await fetch("/api/points/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, useFree }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      const rewardIndex = data.rewardIndex

      // Segment 0 is at 3 o'clock position by default
      // We need to rotate so the winning segment lands at 12 o'clock (top, where pointer is)
      // Segment center angle from 3 o'clock = segmentIndex * segmentAngle + segmentAngle/2
      // To bring to top (270 deg from 3 o'clock), we need: 270 - (segmentIndex * segmentAngle + segmentAngle/2)
      const segmentCenterFromThreeOclock = rewardIndex * segmentAngle + segmentAngle / 2
      const targetAngleFromStart = 270 - segmentCenterFromThreeOclock

      // Normalize to 0-360
      const normalizedTarget = ((targetAngleFromStart % 360) + 360) % 360

      // Add 5-7 full spins for visual effect
      const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360
      const totalRotation = fullSpins + normalizedTarget

      // Add to current rotation (so it always spins forward)
      setRotation((prev) => prev + totalRotation)

      setTimeout(() => {
        setResult(data.reward)
        setIsSpinning(false)
        onSpinComplete(data.reward, data.pointsChange, data.freeSpins)
      }, 4000)
    } catch (error) {
      console.error("[v0] Spin error:", error)
      setIsSpinning(false)
    }
  }

  return (
    <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white font-serif">Wheel of Fortune</h2>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Gift className="w-4 h-4 text-[#FF9500]" />
          <span>
            {freeSpinsAvailable} free spin{freeSpinsAvailable !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {hasActiveBoosters && (
        <div className="mb-4 p-3 bg-[#FF9500]/10 border border-[#FF9500]/30 flex items-center gap-4 text-sm">
          {activeMultiplier > 1 && (
            <div className="flex items-center gap-1 text-[#FF9500]">
              <Zap size={16} />
              <span>x{activeMultiplier} Active</span>
            </div>
          )}
          {activeBoost > 0 && (
            <div className="flex items-center gap-1 text-[#FFB340]">
              <TrendingUp size={16} />
              <span>+{activeBoost}% Boost</span>
            </div>
          )}
        </div>
      )}

      {/* Wheel */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        {/* Pointer at TOP */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF9500]" />
        </div>

        {/* Wheel SVG */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transition-transform duration-[4000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {WHEEL_REWARDS.map((reward, i) => {
            const startAngle = i * segmentAngle
            const endAngle = (i + 1) * segmentAngle
            const startRad = (startAngle - 90) * (Math.PI / 180)
            const endRad = (endAngle - 90) * (Math.PI / 180)

            const x1 = 100 + 95 * Math.cos(startRad)
            const y1 = 100 + 95 * Math.sin(startRad)
            const x2 = 100 + 95 * Math.cos(endRad)
            const y2 = 100 + 95 * Math.sin(endRad)

            const largeArc = segmentAngle > 180 ? 1 : 0
            const path = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`

            // Text at segment center
            const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
            const textX = 100 + 60 * Math.cos(midAngle)
            const textY = 100 + 60 * Math.sin(midAngle)
            const textRotation = (startAngle + endAngle) / 2

            return (
              <g key={i}>
                <path d={path} fill={reward.color} stroke="#000" strokeWidth="2" />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                >
                  {reward.label}
                </text>
              </g>
            )
          })}
          <circle cx="100" cy="100" r="98" fill="none" stroke="#FF9500" strokeWidth="3" />
        </svg>

        {/* Center button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-black border-4 border-[#FF9500] rounded-full flex items-center justify-center">
            {isSpinning ? (
              <Loader2 className="w-5 h-5 text-[#FF9500] animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#FF9500]" />
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && !isSpinning && (
        <div className="text-center mb-6 p-4 bg-[#FF9500]/10 border border-[#FF9500]/30">
          <p className="text-white/50 text-sm mb-1">You won:</p>
          <p className="text-[#FF9500] text-2xl font-bold">{result.label}</p>
          {result.type === "multiplier" && (
            <p className="text-white/50 text-sm mt-1">Your next ritual rewards are doubled!</p>
          )}
          {result.type === "boost" && <p className="text-white/50 text-sm mt-1">+10% on all points for 24 hours!</p>}
        </div>
      )}

      {/* Spin buttons */}
      <div className="space-y-3">
        {freeSpinsAvailable > 0 && (
          <button
            onClick={() => handleSpin(true)}
            disabled={isSpinning}
            className="w-full py-4 bg-[#FF9500] text-black font-bold uppercase tracking-wide hover:bg-[#FFB340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "Spinning..." : "Free Spin"}
          </button>
        )}

        {freeSpinsAvailable === 0 && (
          <button
            onClick={() => handleSpin(false)}
            disabled={isSpinning || !canBuySpin}
            className="w-full py-4 border border-[#FF9500] text-[#FF9500] font-bold uppercase tracking-wide hover:bg-[#FF9500]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "Spinning..." : `Spin (${POINTS_CONFIG.EXTRA_SPIN_COST} Points)`}
          </button>
        )}
      </div>
    </div>
  )
}
