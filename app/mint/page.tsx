"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Wallet,
  Coins,
} from "lucide-react"
import Link from "next/link"

interface ValidationResult {
  isValid: boolean
  isAvailable: boolean
  message: string
  isLoading: boolean
}

export default function MintPage() {
  const router = useRouter()
  const { isConnected, address, userProfile, refreshProfile } = useWeb3()
  const [currentStep, setCurrentStep] = useState(1)
  const [username, setUsername] = useState("")
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    isAvailable: false,
    message: "",
    isLoading: false,
  })
  const [mintingPrice, setMintingPrice] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    if (userProfile?.username || userProfile?.hasMinted) {
      router.push("/dashboard")
      return
    }
  }, [isConnected, userProfile])

  // Real-time price updates as user types
  useEffect(() => {
    if (username.length >= 3 && username.length <= 8) {
      const getPriceForLength = async () => {
        try {
          const price = await web3Service.getMintingPrice(username.length)
          setMintingPrice(price)
        } catch (error) {
          console.error("Failed to get price:", error)
        }
      }
      getPriceForLength()
    } else {
      setMintingPrice("0")
    }
  }, [username.length])

  useEffect(() => {
    if (username.length >= 3) {
      validateUsername(username)
    } else {
      setValidation({
        isValid: false,
        isAvailable: false,
        message: username.length > 0 ? "Username must be at least 3 characters" : "",
        isLoading: false,
      })
    }
  }, [username])

  const validateUsername = async (usernameToCheck: string) => {
    setValidation((prev) => ({ ...prev, isLoading: true }))

    try {
      if (usernameToCheck.length < 3 || usernameToCheck.length > 8) {
        setValidation({
          isValid: false,
          isAvailable: false,
          message: "Username must be 3-8 characters long",
          isLoading: false,
        })
        return
      }

      if (!/^[a-z0-9]+$/.test(usernameToCheck)) {
        setValidation({
          isValid: false,
          isAvailable: false,
          message: "Username can only contain lowercase letters and numbers",
          isLoading: false,
        })
        return
      }

      const [isValid, isAvailable] = await Promise.all([
        web3Service.isValidUsername(usernameToCheck),
        web3Service.isUsernameTaken(usernameToCheck).then((taken) => !taken),
      ])

      if (!isValid) {
        setValidation({
          isValid: false,
          isAvailable: false,
          message: "Username format is invalid",
          isLoading: false,
        })
        return
      }

      if (!isAvailable) {
        setValidation({
          isValid: false,
          isAvailable: false,
          message: "Username is already taken",
          isLoading: false,
        })
        return
      }

      setValidation({
        isValid: true,
        isAvailable: true,
        message: "Username is available!",
        isLoading: false,
      })
    } catch (err) {
      console.error("Validation error:", err)
      setValidation({
        isValid: false,
        isAvailable: false,
        message: "Unable to validate username. Please check your connection.",
        isLoading: false,
      })
    }
  }

  const handleMint = async () => {
    if (!validation.isValid || !validation.isAvailable) return

    setIsLoading(true)
    setError("")
    setCurrentStep(3)

    try {
      const tx = await web3Service.mintUsername(username)
      setTransactionHash(tx.hash)

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      setCurrentStep(4)
      await refreshProfile()

      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err: any) {
      console.error("Minting error:", err)
      let errorMessage = "Failed to mint username"

      if (err.message.includes("User already minted")) {
        errorMessage = "You have already minted a username"
      } else if (err.message.includes("Username already taken")) {
        errorMessage = "Username is already taken"
      } else if (err.message.includes("Insufficient")) {
        errorMessage = "Insufficient PRIVIX to mint username"
      } else if (err.message.includes("rejected")) {
        errorMessage = "Transaction was rejected"
      }

      setError(errorMessage)
      setCurrentStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepProgress = () => {
    return (currentStep / 4) * 100
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-white text-lg font-medium mb-2 block">
                Choose Your Username
              </Label>
              <p className="text-[#b0b0b0] text-sm mb-4">3-8 characters, lowercase letters and numbers only</p>

              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Enter username"
                  className="text-lg py-4 pr-24 bg-[#1a1a1a]/50 border-[#2a2a2a] text-white rounded-xl focus:border-[#005eff] focus:ring-2 focus:ring-[#005eff]/20"
                  maxLength={8}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#b0b0b0] font-medium">
                  .privix
                </div>
              </div>

              {/* Real-time price display */}
              {username.length >= 3 && username.length <= 8 && (
                <div className="mt-3 flex items-center justify-between p-3 bg-[#005eff]/10 border border-[#005eff]/20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-[#005eff]" />
                    <span className="text-sm text-[#005eff] font-medium">Price for {username.length} characters:</span>
                  </div>
                  <span className="text-lg font-bold text-[#005eff]">
                    {Number.parseFloat(mintingPrice).toFixed(0)} PRIVIX
                  </span>
                </div>
              )}

              {/* Validation Status */}
              {username.length > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  {validation.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#005eff]" />
                  ) : validation.isValid && validation.isAvailable ? (
                    <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#ff4444]" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      validation.isValid && validation.isAvailable ? "text-[#00ff88]" : "text-[#ff4444]"
                    }`}
                  >
                    {validation.message}
                  </span>
                </div>
              )}
            </div>

            {validation.isValid && validation.isAvailable && (
              <GradientButton
                onClick={() => setCurrentStep(2)}
                className="w-full"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Continue
              </GradientButton>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Confirm Your Purchase</h3>
              <p className="text-[#b0b0b0]">Review the details before minting your NFT username</p>
            </div>

            {/* NFT Preview */}
            <AnimatedCard
              className="p-6 lg:p-8 bg-gradient-to-br from-[#005eff]/20 to-[#0041cc]/20 border-[#005eff]/30"
              glow
            >
              <div className="text-center">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-[#005eff] to-[#0041cc] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                </div>
                <h4 className="text-xl lg:text-2xl font-bold text-white mb-2">{username}.privix</h4>
                <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30 rounded-full px-3 py-1">
                  Available
                </Badge>
              </div>
            </AnimatedCard>

            {/* Pricing Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]/50">
                <span className="text-[#b0b0b0]">Username Length</span>
                <span className="text-white font-medium">{username.length} characters</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]/50">
                <span className="text-[#b0b0b0]">Minting Price</span>
                <span className="text-white font-bold text-lg">
                  {Number.parseFloat(mintingPrice).toFixed(0)} PRIVIX
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]/50">
                <span className="text-[#b0b0b0]">Network Fee</span>
                <span className="text-white">~0.001 PRIVIX</span>
              </div>
              <div className="border-t border-[#2a2a2a]/50 pt-3">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#005eff]/10 to-[#0041cc]/10 rounded-xl border border-[#005eff]/20">
                  <span className="text-white font-bold text-lg">Total Cost</span>
                  <span className="text-[#005eff] font-bold text-xl">
                    {Number.parseFloat(mintingPrice).toFixed(0)} PRIVIX
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="bg-[#ff4444]/10 border-[#ff4444]/30 rounded-xl">
                <AlertCircle className="h-4 w-4 text-[#ff4444]" />
                <AlertDescription className="text-[#ff4444]">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <GradientButton
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
                size="lg"
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </GradientButton>
              <GradientButton
                onClick={handleMint}
                isLoading={isLoading}
                className="flex-1"
                size="lg"
                icon={<Wallet className="w-5 h-5" />}
              >
                Mint NFT
              </GradientButton>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-[#005eff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Minting Your NFT</h3>
              <p className="text-[#b0b0b0] mb-4">Please confirm the transaction in your wallet</p>
              {transactionHash && (
                <AnimatedCard className="p-4 bg-[#1a1a1a]/50">
                  <p className="text-sm text-[#005eff] mb-2 font-medium">Transaction Hash:</p>
                  <p className="text-xs text-[#b0b0b0] break-all font-mono">{transactionHash}</p>
                </AnimatedCard>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-[#00ff88] to-[#00cc66] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Congratulations! 🎉</h3>
              <p className="text-[#b0b0b0] mb-4">Your username NFT has been successfully minted</p>
              <AnimatedCard className="p-6 bg-gradient-to-r from-[#005eff]/10 to-[#0041cc]/10 border-[#005eff]/20" glow>
                <p className="text-[#005eff] font-bold text-xl lg:text-2xl">{username}.privix</p>
                <p className="text-[#b0b0b0] text-sm mt-1">is now yours forever!</p>
              </AnimatedCard>
            </div>
            <p className="text-sm text-[#b0b0b0]">Redirecting to dashboard...</p>
          </div>
        )

      default:
        return null
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 lg:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#005eff] hover:text-[#3377ff] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">Mint Your Username</h1>
          <p className="text-lg lg:text-xl text-[#b0b0b0]">Create your unique digital identity on Privix Chain</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <Progress value={getStepProgress()} className="w-full h-3 mb-4 rounded-full" />
          <div className="grid grid-cols-4 gap-2 text-xs lg:text-sm text-[#b0b0b0]">
            <span className={cn("text-center", currentStep >= 1 && "text-[#005eff] font-medium")}>Choose</span>
            <span className={cn("text-center", currentStep >= 2 && "text-[#005eff] font-medium")}>Confirm</span>
            <span className={cn("text-center", currentStep >= 3 && "text-[#005eff] font-medium")}>Minting</span>
            <span className={cn("text-center", currentStep >= 4 && "text-[#00ff88] font-medium")}>Complete</span>
          </div>
        </div>

        {/* Main Content */}
        <AnimatedCard className="p-6 lg:p-8" variant="glass">
          {renderStepContent()}
        </AnimatedCard>

        {/* Pricing Reference */}
        {currentStep === 1 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Pricing Guide</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { chars: "3", price: "1000" },
                { chars: "4", price: "700" },
                { chars: "5", price: "600" },
                { chars: "6-8", price: "100" },
              ].map((tier) => (
                <div key={tier.chars} className="text-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]/50">
                  <div className="text-[#005eff] font-bold text-lg">{tier.chars} chars</div>
                  <div className="text-white text-sm">{tier.price} PRIVIX</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
