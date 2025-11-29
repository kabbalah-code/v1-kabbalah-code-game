"use client"

import { ChevronDown, Users, Zap, Crown } from "lucide-react"
import { TreeOfLife } from "@/components/ui/tree-of-life"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  onConnectClick: () => void
}

export function HeroSection({ onConnectClick }: HeroSectionProps) {
  const [seekersCount, setSeekersCount] = useState(12345)

  // Animate counter on mount
  useEffect(() => {
    const target = 12345
    const duration = 2000
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setSeekersCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  const scrollToNext = () => {
    document.querySelector("#problem")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0500]" />

      {/* Tree of Life background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-lg h-[600px] relative">
          <TreeOfLife />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto pt-20">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-[#FF9500] glow-text block">KABBALAH</span>
          <span className="text-white block mt-2">CODE</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Daily mystical predictions powered by sacred Kabbalah numerology, your unique Web3 soul signature, and the
          eternal Tree of Life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={onConnectClick}
            className="group px-8 py-4 bg-[#FF9500] text-black font-bold text-lg uppercase tracking-wide hover:bg-[#FFB340] transition-all glow-primary"
          >
            <span className="flex items-center gap-2">
              Connect Wallet
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </button>

          <a
            href="https://t.me/KabbalahCodeBot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-[#FF9500] text-[#FF9500] font-bold text-lg uppercase tracking-wide hover:bg-[#FF9500]/10 transition-colors"
          >
            Open Telegram
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-white/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF9500]" />
            <span className="font-semibold tabular-nums">{seekersCount.toLocaleString()} Seekers</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF9500]" />
            <span className="font-semibold">Earn Points</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FF9500]" />
            <span className="font-semibold">Sacred NFTs</span>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#FF9500]/50 hover:text-[#FF9500] transition-colors animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  )
}
