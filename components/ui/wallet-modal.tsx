"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Wallet, ExternalLink, Loader2, CheckCircle, AlertCircle, Smartphone, Globe } from "lucide-react"
import {
  isMetaMaskInstalled,
  isPreviewEnvironment,
  connectMetaMask,
  signMessage,
  createSiweMessage,
  generateNonce,
  formatAddress,
  calculateWalletNumber,
  isValidEvmAddress,
} from "@/lib/web3/ethereum"
import { useRouter } from "next/navigation"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (address: string) => void
  referralCode?: string
}

type ConnectionState = "idle" | "connecting" | "signing" | "creating" | "success" | "error" | "manual"

export function WalletModal({ isOpen, onClose, onSuccess, referralCode }: WalletModalProps) {
  const [state, setState] = useState<ConnectionState>("idle")
  const [error, setError] = useState("")
  const [address, setAddress] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHasMetaMask(isMetaMaskInstalled())
    setIsPreview(isPreviewEnvironment())
  }, [])

  const resetState = useCallback(() => {
    setState("idle")
    setError("")
    setAddress("")
    setManualAddress("")
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetState()
    }
  }, [isOpen, resetState])

  const handleMetaMaskConnect = async () => {
    if (!hasMetaMask) {
      if (isPreview) {
        // In preview, offer manual entry
        setState("manual")
        return
      }
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    try {
      setState("connecting")
      setError("")

      const { address: walletAddress, chainId } = await connectMetaMask()
      setAddress(walletAddress)

      setState("signing")
      const nonce = generateNonce()
      const message = createSiweMessage(walletAddress, nonce, chainId)
      const signature = await signMessage(walletAddress, message)

      setState("creating")

      const walletNumber = calculateWalletNumber(walletAddress)

      localStorage.setItem(
        "kabbalah_wallet",
        JSON.stringify({
          address: walletAddress,
          walletNumber,
          signature: signature.slice(0, 20),
          connectedAt: Date.now(),
        }),
      )

      setState("success")

      setTimeout(() => {
        onSuccess(walletAddress)
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setState("error")
      const message = err instanceof Error ? err.message : "Connection failed"
      if (message === "METAMASK_NOT_INSTALLED") {
        setError("MetaMask not detected. Please install it or enter address manually.")
        setState("manual")
      } else {
        setError(message)
      }
    }
  }

  const handleManualConnect = () => {
    if (!isValidEvmAddress(manualAddress)) {
      setError("Invalid EVM address. Must start with 0x followed by 40 hex characters.")
      return
    }

    setState("creating")
    setError("")
    setAddress(manualAddress)

    const walletNumber = calculateWalletNumber(manualAddress)

    localStorage.setItem(
      "kabbalah_wallet",
      JSON.stringify({
        address: manualAddress,
        walletNumber,
        signature: "demo-mode",
        connectedAt: Date.now(),
      }),
    )

    setState("success")

    setTimeout(() => {
      onSuccess(manualAddress)
      router.push("/dashboard")
    }, 1000)
  }

  const openWalletConnect = () => {
    window.open("https://t.me/KabbalahCodeBot", "_blank")
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-black border border-[#FF9500]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#FF9500]/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <h2 className="text-[#FF9500] font-bold text-2xl tracking-wider font-serif">KABBALAH</h2>
            <h3 className="text-white font-bold text-xl tracking-wider font-serif">CODE</h3>
            <p className="text-white/50 text-sm mt-2">Connect your wallet to begin</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {state === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Connected Successfully</p>
              <p className="text-white/50 text-sm mt-2">{formatAddress(address)}</p>
              <p className="text-[#FF9500] text-sm mt-4">Redirecting to dashboard...</p>
            </div>
          ) : state === "error" ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Connection Failed</p>
              <p className="text-red-400 text-sm mt-2">{error}</p>
              <button
                onClick={resetState}
                className="mt-6 px-6 py-2 bg-[#FF9500] text-black font-bold text-sm uppercase hover:bg-[#FFB340] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : state === "manual" ? (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <Globe className="w-12 h-12 text-[#FF9500] mx-auto mb-3" />
                <p className="text-white font-medium">Enter Wallet Address</p>
                <p className="text-white/50 text-xs mt-1">
                  {isPreview ? "Preview mode - enter your EVM address" : "MetaMask not detected"}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => {
                    setManualAddress(e.target.value)
                    setError("")
                  }}
                  placeholder="0x..."
                  className="w-full p-4 bg-[#0a0a0a] border border-[#FF9500]/30 focus:border-[#FF9500] text-white font-mono text-sm outline-none"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleManualConnect}
                  disabled={!manualAddress}
                  className="w-full py-3 bg-[#FF9500] text-black font-bold uppercase tracking-wider hover:bg-[#FFB340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
                <button
                  onClick={resetState}
                  className="w-full py-2 text-white/50 hover:text-white text-sm transition-colors"
                >
                  Back to options
                </button>
              </div>
            </div>
          ) : (
            <>
              {isPreview && (
                <div className="p-3 bg-[#FF9500]/10 border border-[#FF9500]/30 text-center mb-2">
                  <p className="text-[#FF9500] text-xs">
                    Preview Mode - Use manual entry or open in new tab with MetaMask
                  </p>
                </div>
              )}

              {/* MetaMask Button */}
              <button
                onClick={handleMetaMaskConnect}
                disabled={state !== "idle"}
                className="w-full p-4 border border-[#FF9500]/30 hover:border-[#FF9500] bg-[#0a0a0a] hover:bg-[#111] transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 bg-[#FF9500]/10 flex items-center justify-center">
                  {state === "connecting" || state === "signing" || state === "creating" ? (
                    <Loader2 className="w-6 h-6 text-[#FF9500] animate-spin" />
                  ) : (
                    <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
                      <path d="M32.9582 1L19.8241 11.0817L22.2457 5.22837L32.9582 1Z" fill="#E17726" />
                      <path d="M7.04175 1L20.0567 11.1742L17.7541 5.22837L7.04175 1Z" fill="#E27625" />
                      <path
                        d="M28.2292 28.2083L24.7708 33.5417L32.3125 35.6042L34.4583 28.3333L28.2292 28.2083Z"
                        fill="#E27625"
                      />
                      <path
                        d="M5.55835 28.3333L7.68751 35.6042L15.2292 33.5417L11.7708 28.2083L5.55835 28.3333Z"
                        fill="#E27625"
                      />
                      <path
                        d="M14.6875 17.5L12.6042 20.625L20.0625 20.9583L19.7917 12.9167L14.6875 17.5Z"
                        fill="#E27625"
                      />
                      <path
                        d="M25.3125 17.5L20.1458 12.8333L20.0625 20.9583L27.5 20.625L25.3125 17.5Z"
                        fill="#E27625"
                      />
                      <path d="M15.2292 33.5417L19.5833 31.4167L15.8125 28.375L15.2292 33.5417Z" fill="#E27625" />
                      <path d="M20.4167 31.4167L24.7708 33.5417L24.1875 28.375L20.4167 31.4167Z" fill="#E27625" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{hasMetaMask ? "MetaMask" : "Install MetaMask"}</p>
                  <p className="text-white/50 text-sm">
                    {state === "connecting" && "Connecting..."}
                    {state === "signing" && "Sign the message..."}
                    {state === "creating" && "Creating account..."}
                    {state === "idle" &&
                      (hasMetaMask ? "Connect with browser extension" : "Open MetaMask download page")}
                  </p>
                </div>
              </button>

              {/* Manual Entry Button */}
              <button
                onClick={() => setState("manual")}
                disabled={state !== "idle"}
                className="w-full p-4 border border-[#FF9500]/30 hover:border-[#FF9500] bg-[#0a0a0a] hover:bg-[#111] transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-[#FF9500]/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#FF9500]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Enter Address</p>
                  <p className="text-white/50 text-sm">Input your EVM wallet address</p>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs uppercase">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Telegram Alternative */}
              <a
                href="https://t.me/KabbalahCodeBot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10 transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-wide"
              >
                <Smartphone size={18} />
                Open Telegram Bot
                <ExternalLink size={16} />
              </a>

              {referralCode && (
                <p className="text-center text-white/40 text-xs">
                  Referral code: <span className="text-[#FF9500]">{referralCode}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
