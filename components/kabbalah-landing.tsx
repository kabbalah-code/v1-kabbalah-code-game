"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HeroSection } from "./sections/hero-section"
import { ProblemSection } from "./sections/problem-section"
import { SolutionSection } from "./sections/solution-section"
import { JourneySection } from "./sections/journey-section"
import { RoadmapSection } from "./sections/roadmap-section"
import { FaqSection } from "./sections/faq-section"
import { CtaSection } from "./sections/cta-section"
import { Navigation } from "./ui/navigation"
import { WalletModal } from "./ui/wallet-modal"

export default function KabbalahLanding() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref") || undefined

  // Check for existing wallet connection
  useEffect(() => {
    const stored = localStorage.getItem("kabbalah_wallet")
    if (stored) {
      try {
        const { address } = JSON.parse(stored)
        setWalletAddress(address)
      } catch {
        localStorage.removeItem("kabbalah_wallet")
      }
    }
  }, [])

  const handleWalletSuccess = (address: string) => {
    setWalletAddress(address)
    setIsWalletModalOpen(false)
  }

  const handleDisconnect = () => {
    localStorage.removeItem("kabbalah_wallet")
    setWalletAddress(null)
  }

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      <Navigation
        walletAddress={walletAddress}
        onConnectClick={() => setIsWalletModalOpen(true)}
        onDisconnect={handleDisconnect}
      />

      <HeroSection onConnectClick={() => setIsWalletModalOpen(true)} />
      <ProblemSection />
      <SolutionSection />
      <JourneySection />
      <RoadmapSection />
      <FaqSection />
      <CtaSection onConnectClick={() => setIsWalletModalOpen(true)} />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={handleWalletSuccess}
        referralCode={referralCode}
      />
    </div>
  )
}
