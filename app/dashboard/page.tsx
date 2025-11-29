"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatAddress } from "@/lib/web3/ethereum"
import { User, Flame, Sparkles, LogOut, ListTodo, Gift, LayoutDashboard, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { DailyRitual } from "@/components/dashboard/daily-ritual"
import { WheelOfFortune } from "@/components/dashboard/wheel-of-fortune"
import { TreeProgress } from "@/components/dashboard/tree-progress"
import { TwitterVerification } from "@/components/dashboard/twitter-verification"
import { TasksSection } from "@/components/dashboard/tasks-section"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { TelegramConnect } from "@/components/dashboard/telegram-connect"

interface WalletData {
  address: string
  walletNumber: number
  connectedAt: number
}

interface UserData {
  id: string
  wallet_address: string
  wallet_number: number
  twitter_username: string | null
  telegram_username: string | null
  discord_username: string | null
  level: number
  total_points: number
  available_points: number
  current_streak: number
  longest_streak: number
  last_ritual_date: string | null
  free_spins: number
  referral_code: string
  created_at: string
  active_multiplier?: number
  multiplier_expires_at?: string | null
  active_boost_percent?: number
  boost_expires_at?: string | null
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

type Tab = "dashboard" | "tasks" | "rewards" | "profile"

function DashboardContent() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasChecked = useRef(false)

  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      const data = await res.json()

      if (data.success && data.user) {
        setUserData(data.user)

        const txRes = await fetch(`/api/user/transactions?wallet=${walletAddress}`)
        const txData = await txRes.json()
        if (txData.success) {
          setTransactions(txData.transactions || [])
        }

        const tasksRes = await fetch(`/api/user/tasks?wallet=${walletAddress}`)
        const tasksData = await tasksRes.json()
        if (tasksData.success) {
          setCompletedTasks(tasksData.completedTasks || [])
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load user data:", error)
    }
  }, [])

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true

    const stored = localStorage.getItem("kabbalah_wallet")
    if (!stored) {
      router.push("/")
      return
    }

    try {
      const data = JSON.parse(stored) as WalletData
      if (!data.address || !data.walletNumber || !data.connectedAt) {
        localStorage.removeItem("kabbalah_wallet")
        router.push("/")
        return
      }

      const maxAge = 30 * 24 * 60 * 60 * 1000
      if (Date.now() - data.connectedAt > maxAge) {
        localStorage.removeItem("kabbalah_wallet")
        router.push("/")
        return
      }

      setWallet(data)
      loadUserData(data.address).finally(() => setIsLoading(false))
    } catch {
      localStorage.removeItem("kabbalah_wallet")
      router.push("/")
    }
  }, [router, loadUserData])

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [searchParams])

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem("kabbalah_wallet")
    router.push("/")
  }, [router])

  const handleRitualComplete = useCallback(async () => {
    if (!wallet) return
    await loadUserData(wallet.address)
  }, [wallet, loadUserData])

  const handleWheelSpin = useCallback(async () => {
    if (!wallet) return
    await loadUserData(wallet.address)
  }, [wallet, loadUserData])

  const handleTwitterVerified = useCallback(async () => {
    if (!wallet) return
    await loadUserData(wallet.address)
  }, [wallet, loadUserData])

  const handleTaskComplete = useCallback(
    async (taskId: string) => {
      setCompletedTasks((prev) => [...prev, taskId])
      if (wallet) await loadUserData(wallet.address)
    },
    [wallet, loadUserData],
  )

  const handleTelegramConnected = useCallback(
    async (username: string) => {
      setShowTelegramModal(false)
      if (wallet) await loadUserData(wallet.address)
    },
    [wallet, loadUserData],
  )

  if (isLoading || !wallet) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#FF9500] font-serif">Loading your destiny...</p>
        </div>
      </div>
    )
  }

  const displayData = userData || {
    wallet_address: wallet.address,
    wallet_number: wallet.walletNumber,
    twitter_username: null,
    telegram_username: null,
    discord_username: null,
    level: 1,
    total_points: 100,
    available_points: 100,
    current_streak: 0,
    longest_streak: 0,
    last_ritual_date: null,
    free_spins: 1,
    referral_code: wallet.address.slice(2, 10).toUpperCase(),
    created_at: new Date().toISOString(),
    active_multiplier: 1,
    active_boost_percent: 0,
  }

  const hasCompletedToday = displayData.last_ritual_date === new Date().toISOString().split("T")[0]

  // Check if boosters are still active
  const now = Date.now()
  const multiplierActive =
    displayData.multiplier_expires_at && new Date(displayData.multiplier_expires_at).getTime() > now
  const boostActive = displayData.boost_expires_at && new Date(displayData.boost_expires_at).getTime() > now
  const activeMultiplier = multiplierActive ? displayData.active_multiplier || 1 : 1
  const activeBoost = boostActive ? displayData.active_boost_percent || 0 : 0

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "tasks" as Tab, label: "Tasks", icon: <ListTodo size={18} /> },
    { id: "rewards" as Tab, label: "Rewards", icon: <Gift size={18} /> },
    { id: "profile" as Tab, label: "Profile", icon: <User size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#FF9500]/20 sticky top-0 bg-black/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#FF9500] font-bold text-xl tracking-wider">KABBALAH</span>
            <span className="text-white font-bold text-xl tracking-wider">CODE</span>
          </Link>

          <div className="flex items-center gap-4">
            {(activeMultiplier > 1 || activeBoost > 0) && (
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#FF9500]/5 border border-[#FF9500]/20">
                {activeMultiplier > 1 && (
                  <span className="flex items-center gap-1 text-[#FF9500] text-xs">
                    <Zap size={12} /> x{activeMultiplier}
                  </span>
                )}
                {activeBoost > 0 && (
                  <span className="flex items-center gap-1 text-[#FFB340] text-xs">
                    <TrendingUp size={12} /> +{activeBoost}%
                  </span>
                )}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FF9500]/10 border border-[#FF9500]/30">
              <Sparkles className="w-4 h-4 text-[#FF9500]" />
              <span className="text-[#FF9500] font-bold tabular-nums">{displayData.total_points.toLocaleString()}</span>
            </div>
            <span className="text-white/50 text-sm font-mono hidden md:block">{formatAddress(wallet.address)}</span>
            <button onClick={handleDisconnect} className="p-2 text-white/50 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[#FF9500]/10 bg-black/50 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-[#FF9500] border-[#FF9500]"
                    : "text-white/50 border-transparent hover:text-white/70"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Welcome Banner */}
            <div className="mb-8 p-6 border border-[#FF9500]/30 bg-gradient-to-r from-[#FF9500]/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 bg-[#FF9500] flex items-center justify-center text-black font-bold text-2xl flex-shrink-0">
                  {displayData.wallet_number}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white tracking-wide">
                    Welcome, Seeker
                    {displayData.twitter_username && (
                      <span className="text-[#FF9500] text-lg ml-2">@{displayData.twitter_username}</span>
                    )}
                  </h1>
                  <p className="text-white/50">
                    Destiny Number: <span className="text-[#FF9500]">{displayData.wallet_number}</span>
                    {" • "}Level <span className="text-[#FF9500]">{displayData.level}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-[#FF9500]/20 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#FF9500]" />
                  <span className="text-white/50 text-xs uppercase">Points</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {displayData.total_points.toLocaleString()}
                </p>
              </div>
              <div className="p-4 border border-[#FF9500]/20 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-[#FF9500]" />
                  <span className="text-white/50 text-xs uppercase">Streak</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{displayData.current_streak} days</p>
                {/* Streak mini-progress */}
                <div className="mt-2">
                  <div className="h-1 bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#FF9500]"
                      style={{ width: `${((displayData.current_streak % 7) / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-white/30 text-[10px] mt-1">{7 - (displayData.current_streak % 7)} to +50 bonus</p>
                </div>
              </div>
              <div className="p-4 border border-[#FF9500]/20 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#FF9500]" />
                  <span className="text-white/50 text-xs uppercase">Level</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{displayData.level}</p>
              </div>
              <div className="p-4 border border-[#FF9500]/20 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-[#FF9500]" />
                  <span className="text-white/50 text-xs uppercase">Spins</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{displayData.free_spins}</p>
                <p className="text-white/30 text-[10px] mt-1">+1 daily with ritual</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <DailyRitual
                walletAddress={wallet.address}
                walletNumber={displayData.wallet_number}
                currentStreak={displayData.current_streak}
                hasCompletedToday={hasCompletedToday}
                twitterConnected={!!displayData.twitter_username}
                onComplete={handleRitualComplete}
              />

              {!displayData.twitter_username ? (
                <TwitterVerification walletAddress={wallet.address} onVerified={handleTwitterVerified} />
              ) : (
                <TreeProgress totalPoints={displayData.total_points} unlockedSephirot={[1]} />
              )}
            </div>
          </>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <TasksSection
            walletAddress={wallet.address}
            twitterConnected={!!displayData.twitter_username}
            completedTasks={completedTasks}
            onTaskComplete={handleTaskComplete}
          />
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <WheelOfFortune
            walletAddress={wallet.address}
            freeSpinsAvailable={displayData.free_spins}
            availablePoints={displayData.available_points}
            activeMultiplier={activeMultiplier}
            activeBoost={activeBoost}
            onSpinComplete={handleWheelSpin}
          />
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileTab
            user={displayData as UserData}
            transactions={transactions}
            referralCount={0}
            onConnectTwitter={() => setActiveTab("dashboard")}
            onConnectTelegram={() => setShowTelegramModal(true)}
          />
        )}
      </main>

      {/* Telegram Connect Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <TelegramConnect walletAddress={wallet.address} onConnected={handleTelegramConnected} />
            <button
              onClick={() => setShowTelegramModal(false)}
              className="w-full mt-4 py-2 text-white/50 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
