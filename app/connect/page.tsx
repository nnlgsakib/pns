"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Wallet, ArrowLeft } from "lucide-react"
import Link from "next/link"

const walletProviders = [
  {
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask wallet",
    connector: "metamask",
    installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
  },
]

export default function ConnectPage() {
  const router = useRouter()
  const { connectWallet, isLoading, error, isConnected } = useWeb3()
  const [connectionStep, setConnectionStep] = useState(0)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleWalletConnect = async (walletName: string) => {
    setSelectedWallet(walletName)
    setConnectionStep(1)

    try {
      await connectWallet()
      setConnectionStep(2)

      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setConnectionStep(0)
      setSelectedWallet(null)
    }
  }

  if (isConnected) {
    router.push("/dashboard")
    return null
  }

  const getProgressValue = () => {
    switch (connectionStep) {
      case 0:
        return 0
      case 1:
        return 50
      case 2:
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-[#005eff] hover:text-[#3377ff] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Connect Your Wallet</h1>
          <p className="text-lg text-[#b0b0b0] mb-6">Choose your preferred wallet to get started with Privix</p>

          {/* Progress Indicator */}
          <div className="mb-8">
            <Progress value={getProgressValue()} className="w-full h-2 mb-4" />
            <div className="flex justify-between text-sm text-[#b0b0b0]">
              <span className={connectionStep >= 0 ? "text-[#005eff]" : ""}>Select Wallet</span>
              <span className={connectionStep >= 1 ? "text-[#005eff]" : ""}>Connecting</span>
              <span className={connectionStep >= 2 ? "text-[#00ff88]" : ""}>Connected</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStep === 1 && (
          <Alert className="mb-6 bg-[#005eff]/10 border-[#005eff]/30">
            <Wallet className="h-4 w-4 text-[#005eff]" />
            <AlertDescription className="text-[#005eff]">
              Connecting to {selectedWallet}... Please check your wallet for connection request.
            </AlertDescription>
          </Alert>
        )}

        {connectionStep === 2 && (
          <Alert className="mb-6 bg-[#00ff88]/10 border-[#00ff88]/30">
            <CheckCircle className="h-4 w-4 text-[#00ff88]" />
            <AlertDescription className="text-[#00ff88]">
              Successfully connected! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-[#ff4444]/10 border-[#ff4444]/30">
            <AlertCircle className="h-4 w-4 text-[#ff4444]" />
            <AlertDescription className="text-[#ff4444]">{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Providers */}
        <div className="grid grid-cols-1 gap-4 mb-8 max-w-md mx-auto">
          {walletProviders.map((provider) => (
            <AnimatedCard
              key={provider.name}
              className={`p-6 cursor-pointer transition-all duration-300 ${
                selectedWallet === provider.name && isLoading
                  ? "border-[#005eff] bg-[#005eff]/5"
                  : "hover:border-[#005eff]/50"
              } ${!provider.installed ? "opacity-50" : ""}`}
              onClick={() => provider.installed && !isLoading && handleWalletConnect(provider.name)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{provider.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{provider.name}</h3>
                  <p className="text-sm text-[#b0b0b0]">{provider.description}</p>
                  {!provider.installed && <p className="text-xs text-[#ff4444] mt-1">Not installed</p>}
                </div>
                {selectedWallet === provider.name && isLoading && (
                  <div className="w-6 h-6 border-2 border-[#005eff] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Help Section */}
        <AnimatedCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-[#b0b0b0] mb-4">New to Web3 wallets? Install MetaMask to get started.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GradientButton
              variant="secondary"
              size="sm"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
            >
              Install MetaMask
            </GradientButton>
            <GradientButton
              variant="secondary"
              size="sm"
              onClick={() => window.open("https://docs.metamask.io/", "_blank")}
            >
              MetaMask Guide
            </GradientButton>
          </div>
        </AnimatedCard>

        {/* Network Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-[#b0b0b0] bg-[#1a1a1a] px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
            <span>Privix Chain Testnet</span>
          </div>
        </div>
      </div>
    </div>
  )
}
