"use client"

import { useState } from "react"
import { AnimatedSection } from "@/components/ui/animated-section"
import { ChevronDown } from "lucide-react"

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "What makes this sacred?",
      a: "Authentic Kabbalah numerology merged with your Web3 identity creates your unique soul signature.",
    },
    {
      q: "Is this divination?",
      a: "No - this is ancient spiritual technology, not fortune-telling. Based on 3000 years of tradition.",
    },
    {
      q: "How is privacy protected?",
      a: "Only public wallet addresses are used. We never access private keys or personal data.",
    },
    {
      q: "Which chain holds the truth?",
      a: "Base blockchain for minimal costs (~$0.01 per NFT). Cross-chain expansion planned.",
    },
    { q: "Must I know the ways of crypto?", a: "No. Begin with Twitter alone. Web3 features unlock deeper mysteries." },
  ]

  return (
    <AnimatedSection id="faq" className="py-24 md:py-32 px-4 bg-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-[#FF9500]">Mysteries </span>
            <span className="text-white">Revealed</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border transition-all duration-300 ${
                openIndex === i
                  ? "border-[#FF9500] bg-[#0a0a0a]"
                  : "border-[#FF9500]/20 bg-transparent hover:border-[#FF9500]/40"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center gap-4"
                aria-expanded={openIndex === i}
              >
                <h3 className="text-lg md:text-xl font-bold text-white font-serif">{faq.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-[#FF9500] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-6 pb-6 text-white/60">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
