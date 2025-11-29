"use client"

import { AnimatedSection } from "@/components/ui/animated-section"

export function JourneySection() {
  const steps = [
    { num: "01", title: "Bind Your Soul", desc: "Connect wallet & Twitter for divine calculation" },
    { num: "02", title: "Receive Prophecy", desc: "Daily visions from the Tree of Life" },
    { num: "03", title: "Share the Word", desc: "Spread wisdom on X with sacred codes" },
    { num: "04", title: "Ascend Higher", desc: "Unlock Archetypes, Domains, and Secrets" },
    { num: "05", title: "Claim Glory", desc: "Mint eternal proof of your journey" },
  ]

  return (
    <AnimatedSection id="journey" className="py-24 md:py-32 px-4 bg-black">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-[#FF9500]">The Path of </span>
            <span className="text-white">Illumination</span>
          </h2>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-stretch gap-4 md:gap-8 group">
              <div className="flex-shrink-0 w-16 md:w-20 h-16 md:h-20 bg-[#FF9500] flex items-center justify-center text-black font-bold text-xl md:text-2xl font-serif group-hover:scale-105 transition-transform">
                {step.num}
              </div>
              <div className="flex-1 p-6 md:p-8 bg-[#0a0a0a] border border-[#FF9500]/20 group-hover:border-[#FF9500]/50 transition-colors">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-serif">{step.title}</h3>
                <p className="text-white/50">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
