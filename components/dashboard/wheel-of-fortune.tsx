"use client"

import { useState, useEffect } from "react"
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
  const [showHint, setShowHint] = useState(false)
  const [floatingSymbols, setFloatingSymbols] = useState<Array<{id: number, symbol: string, top: number, left: number, size: number, opacity: number}>>([])
  const [energies, setEnergies] = useState<Array<{id: number, x: number, y: number, size: number}>>([])

  const canBuySpin = availablePoints >= POINTS_CONFIG.EXTRA_SPIN_COST
  const hasActiveBoosters = activeMultiplier > 1 || activeBoost > 0

  // Mystical symbol set
  const mysticalSymbolSet = ['✦', '✧', '★', '☆', '✺', '✹', '✷', '✶', '※', '⁂', '⚡', '朏', '⚝', '焜', '♽', '☽', '☾', '☌', '☍', '♔', '♕', '♖', '♗', '♘', '♙']
  
  // Initialize floating symbols
  useEffect(() => {
    const symbols = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      symbol: mysticalSymbolSet[Math.floor(Math.random() * mysticalSymbolSet.length)],
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.8 + 0.2
    }))
    setFloatingSymbols(symbols)
    
    const energyPoints = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4
    }))
    setEnergies(energyPoints)
  }, [])

  const handleSpin = async (useFree: boolean) => {
    if (isSpinning) return
    if (useFree && freeSpinsAvailable <= 0) return
    if (!useFree && !canBuySpin) return

    setIsSpinning(true)
    setResult(null)
    setShowHint(false)

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

      // Add more energy effects during spin
      const energyBurst = Array.from({ length: 20 }, (_, i) => ({
        id: i + 100,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 6
      }))
      setEnergies(prev => [...prev, ...energyBurst])

      setTimeout(() => {
        setResult(data.reward)
        setIsSpinning(false)
        onSpinComplete(data.reward, data.pointsChange, data.freeSpins)
        
        // Clean up energy effects after result
        setTimeout(() => {
          setEnergies(prev => prev.filter(e => e.id < 100))
        }, 2000)
      }, 4000)
    } catch (error) {
      console.error("[Mystical Wheel] Spin error:", error)
      setIsSpinning(false)
    }
  }

  return (
    <div className="p-6 border border-purple-500/30 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-xl font-bold text-white font-serif">Wheel of Fortune</h2>
        <div className="flex items-center gap-2 text-purple-300 text-sm">
          <Gift className="w-4 h-4 text-purple-400" />
          <span>
            {freeSpinsAvailable} free spin{freeSpinsAvailable !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {hasActiveBoosters && (
        <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 flex items-center gap-4 text-sm rounded-lg relative z-10">
          {activeMultiplier > 1 && (
            <div className="flex items-center gap-1 text-purple-300">
              <Zap size={16} />
              <span>x{activeMultiplier} Active</span>
            </div>
          )}
          {activeBoost > 0 && (
            <div className="flex items-center gap-1 text-purple-300">
              <TrendingUp size={16} />
              <span>+{activeBoost}% Boost</span>
            </div>
          )}
        </div>
      )}

      {/* Mystical Animation Container */}
      <div className="relative w-64 h-64 mx-auto mb-6 rounded-full border-2 border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 flex items-center justify-center overflow-hidden">
        {/* Background mystical effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,_92,_246,_0.2)_0%,_transparent_70%)] animate-pulse" 
             style={{ animationDuration: '4s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(168,_85,_247,_0.3)_0%,_transparent_50%)] animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(192,_132,_252,_0.3)_0%,_transparent_50%)] animate-pulse" 
             style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        
        {/* Floating mystical symbols */}
        {floatingSymbols.map((symbol) => (
          <div 
            key={symbol.id}
            className="absolute text-purple-400 animate-float"
            style={{
              top: `${symbol.top}%`,
              left: `${symbol.left}%`,
              fontSize: `${symbol.size}px`,
              opacity: symbol.opacity,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            {symbol.symbol}
          </div>
        ))}
        
        {/* Energy points during spin */}
        {isSpinning && energies.map((energy) => (
          <div 
            key={energy.id}
            className="absolute rounded-full bg-purple-400 animate-ping"
            style={{
              top: `${energy.y}%`,
              left: `${energy.x}%`,
              width: `${energy.size}px`,
              height: `${energy.size}px`,
              opacity: 0.7,
              animationDuration: '1.5s'
            }}
          />
        ))}
        
        

        {/* Center button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 bg-black/50 border-2 border-purple-500 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/20">
            {isSpinning ? (
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-400 animate-bounce" />
            )}
          </div>
        </div>
      </div>

      {/* Mystical Hint */}
      <div 
        className="text-center mb-4 cursor-pointer transition-all duration-300 relative z-10"
        onClick={() => setShowHint(!showHint)}
      >
        <p className="text-purple-400 text-xs flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          What can you win? 
          <span className="text-[10px]">(click)</span>
        </p>
        {showHint && (
          <div className="mt-2 p-3 bg-purple-900/40 border border-purple-500/30 rounded-lg text-xs text-purple-200 backdrop-blur-sm">
            <p className="font-bold mb-1">Possible rewards:</p>
            <p>• 10-150 Points</p>
            <p>• x2 multiplier for next ritual</p>
            <p>• +10% boost for 24 hours</p>
            <p>• Jackpot 500 Points!</p>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && !isSpinning && (
        <div className="text-center mb-6 p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg backdrop-blur-sm relative z-10">
          <p className="text-purple-300 text-sm mb-1">You won:</p>
          <p className="text-[#FF9500] text-2xl font-bold">{result.label}</p>
          {result.type === "multiplier" && (
            <p className="text-purple-300 text-sm mt-1">Your next ritual rewards are doubled!</p>
          )}
          {result.type === "boost" && (
            <p className="text-purple-300 text-sm mt-1">+10% on all points for 24 hours!</p>
          )}
        </div>
      )}

      {/* Spin buttons */}
      <div className="space-y-3 relative z-10">
        {freeSpinsAvailable > 0 && (
          <button
            onClick={() => handleSpin(true)}
            disabled={isSpinning}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold uppercase tracking-wide hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 rounded-lg"
          >
            {isSpinning ? "Spinning..." : "Free Spin"}
          </button>
        )}

        {freeSpinsAvailable === 0 && (
          <button
            onClick={() => handleSpin(false)}
            disabled={isSpinning || !canBuySpin}
            className="w-full py-4 border border-purple-500 text-purple-300 font-bold uppercase tracking-wide hover:bg-purple-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {isSpinning ? "Spinning..." : `Spin (${POINTS_CONFIG.EXTRA_SPIN_COST} Points)`}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-15px) rotate(10deg); opacity: 0.8; }
          100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
