"use client"

import { AnimatedSection } from "@/components/ui/animated-section"
import { Calculator, BookOpen, Users, Hexagon, Calendar, TrendingUp } from "lucide-react"

export function SolutionSection() {
  const features = [
    {
      icon: <Calculator className="w-10 h-10" />,
      title: "Soul Numerology",
      desc: "EVM wallet + Twitter = your unique cosmic signature",
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "Ancient Texts",
      desc: "Sefer Yetzirah, Zohar, and ARI teachings",
    },
    { icon: <Users className="w-10 h-10" />, title: "Sacred Circle", desc: "Join 10,000+ seekers of hidden knowledge" },
    { icon: <Hexagon className="w-10 h-10" />, title: "Mystical NFTs", desc: "On-chain proof of spiritual mastery" },
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "Daily Rituals",
      desc: "Guidance across 12 sacred life domains",
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: "Ascension Path",
      desc: "Unlock deeper mysteries at each level",
    },
  ]

  return (
    <AnimatedSection id="solution" className="py-24 md:py-32 px-4 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-white">Your Sacred </span>
            <span className="text-[#FF9500]">Oracle Awaits</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 bg-[#0a0a0a] border border-[#FF9500]/20 hover:border-[#FF9500] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-[#FF9500] mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-serif">{feature.title}</h3>
              <p className="text-white/50">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
