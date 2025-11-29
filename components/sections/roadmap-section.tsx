"use client"

import { AnimatedSection } from "@/components/ui/animated-section"

export function RoadmapSection() {
  const phases = [
    {
      phase: "Genesis",
      title: "Q1 2025",
      items: ["Telegram Portal", "First 10K Seekers", "Initiate NFTs"],
      active: true,
    },
    { phase: "Expansion", title: "Q2 2025", items: ["Archetype System", "Sacred Rituals", "Mobile Temple"] },
    { phase: "Evolution", title: "Q3 2025", items: ["DAO Council", "$KCODE Token", "Oracle API"] },
    { phase: "Ascension", title: "Q4 2025", items: ["AI Prophecy", "Metaverse Gate", "1M Souls"] },
  ]

  return (
    <AnimatedSection id="roadmap" className="py-24 md:py-32 px-4 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-white">The Prophetic </span>
            <span className="text-[#FF9500]">Timeline</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={`p-6 md:p-8 bg-[#0a0a0a] border transition-all duration-300 hover:-translate-y-1 ${
                phase.active
                  ? "border-[#FF9500] shadow-[0_0_30px_rgba(255,149,0,0.2)]"
                  : "border-[#FF9500]/20 hover:border-[#FF9500]/50"
              }`}
            >
              <div
                className={`text-xs font-bold mb-3 uppercase tracking-wider ${phase.active ? "text-[#FF9500]" : "text-[#FF9500]/60"}`}
              >
                {phase.phase}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 font-serif">{phase.title}</h3>
              <ul className="space-y-3">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-3 text-white/50">
                    <div className={`w-1.5 h-1.5 rounded-full ${phase.active ? "bg-[#FF9500]" : "bg-[#FF9500]/40"}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
