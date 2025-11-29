"use client"

import { AnimatedSection } from "@/components/ui/animated-section"
import { Crown, ExternalLink } from "lucide-react"

interface CtaSectionProps {
  onConnectClick: () => void
}

export function CtaSection({ onConnectClick }: CtaSectionProps) {
  return (
    <AnimatedSection className="py-24 md:py-32 px-4 bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <div className="border border-[#FF9500]/30 bg-gradient-to-br from-[#0a0500] to-[#050505] p-8 md:p-16 text-center relative">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#FF9500]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#FF9500]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#FF9500]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#FF9500]" />

          <div className="text-[#FF9500] mx-auto mb-8">
            <Crown className="w-16 h-16 md:w-20 md:h-20 mx-auto" />
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[#FF9500]">Your Destiny </span>
            <span className="text-white">Is Written</span>
          </h2>

          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Join 12,345 seekers who have discovered their true path
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onConnectClick}
              className="px-10 py-5 bg-[#FF9500] text-black font-bold text-lg uppercase tracking-wide hover:bg-[#FFB340] transition-all glow-primary"
            >
              Enter the Temple
            </button>

            <a
              href="https://t.me/KabbalahCodeBot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 border border-[#FF9500] text-[#FF9500] font-bold text-lg uppercase tracking-wide hover:bg-[#FF9500]/10 transition-colors flex items-center justify-center gap-2"
            >
              Telegram Bot
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        <footer className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[#FF9500] font-bold text-lg font-serif">KABBALAH</span>
            <span className="text-white font-bold text-lg font-serif">CODE</span>
          </div>
          <p className="text-white/30 text-sm">&copy; 2025 Kabbalah Code. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-white/30 text-sm">
            <a href="#" className="hover:text-[#FF9500] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#FF9500] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#FF9500] transition-colors">
              Docs
            </a>
          </div>
        </footer>
      </div>
    </AnimatedSection>
  )
}
