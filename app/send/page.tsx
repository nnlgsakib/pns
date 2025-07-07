"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service, enhancedWeb3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Wallet, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CONTRACTS } from "@/lib/constants"

interface RecipientInfo {
  username: string
  address: string
  isValid: boolean
  isLoading: boolean
}

export default function SendPage() {
  const router = useRouter()
  const { isConnected, address, userProfile } = useWeb3()
  const [currentStep, setCurrentStep] = useState(1)
  const [recipientUsername, setRecipientUsername] = useState("")
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [userBalance, setUserBalance] = useState("0")

  const [selectedToken, setSelectedToken] = useState<{ address: string; symbol: string; isNative: boolean }>({
    address: "0x0000000000000000000000000000000000000000",
    symbol: "PRIVIX",
    isNative: true,
  })
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    loadUserBalance()
  }, [isConnected, address])

  useEffect(() => {
    if (recipientUsername.length >= 3) {
      resolveRecipient(recipientUsername)
    } else {
      setRecipientInfo(null)
    }
  }, [recipientUsername])

  const loadUserBalance = async () => {
    if (!address) return

    try {
      const balance = await web3Service.getBalance(address)
      setUserBalance(balance)
    } catch (error) {
      console.error("Failed to load balance:", error)
    }
  }

  const resolveRecipient = async (username: string) => {
    setRecipientInfo((prev) =>
      prev
        ? { ...prev, isLoading: true }
        : {
            username,
            address: "",
            isValid: false,
            isLoading: true,
          },
    )

    try {
      const userInfo = await web3Service.getUserInfo(username)

      if (userInfo.address === "0x0000000000000000000000000000000000000000") {
        setRecipientInfo({
          username,
          address: "",
          isValid: false,
          isLoading: false,
        })
        return
      }

      setRecipientInfo({
        username,
        address: userInfo.address,
        isValid: true,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to resolve recipient:", error)
      setRecipientInfo({
        username,
        address: "",
        isValid: false,
        isLoading: false,
      })
    }
  }

  const handleSend = async () => {
    if (!recipientInfo?.isValid || !amount || !address) return

    setIsLoading(true)
    setError("")
    setCurrentStep(3)

    try {
      if (selectedToken.isNative) {
        const tx = await web3Service.sendETH(recipientUsername, amount)
        setTransactionHash(tx.hash)
        await tx.wait()
      } else {
        const { needsApproval } = await enhancedWeb3Service.checkTokenApproval(
          selectedToken.address,
          address,
          CONTRACTS.TRANSACTION_MANAGER,
          amount,
        )

        if (needsApproval) {
          setIsApproving(true)
          const approvalTx = await enhancedWeb3Service.approveToken(
            selectedToken.address,
            CONTRACTS.TRANSACTION_MANAGER,
            amount,
          )
          await approvalTx.wait()
          setIsApproving(false)
        }

        const { sendTx } = await enhancedWeb3Service.sendTokenWithApproval(
          recipientUsername,
          selectedToken.address,
          amount,
          false,
        )
        setTransactionHash(sendTx.hash)
        await sendTx.wait()
      }

      setCurrentStep(4)
      await loadUserBalance()

      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err: any) {
      console.error("Send error:", err)
      setError(err.message || "Failed to send transaction")
      setCurrentStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Unknown"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isAmountValid = () => {
    const numAmount = Number.parseFloat(amount)
    const numBalance = Number.parseFloat(userBalance)
    return numAmount > 0 && numAmount <= numBalance
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="recipient" className="text-white text-lg font-medium">
                Send To
              </Label>
              <p className="text-[#b0b0b0] text-sm mb-4">Enter the recipient's username (without .privix)</p>
              <div className="relative">
                <Input
                  id="recipient"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value.toLowerCase())}
                  placeholder="Enter username"
                  className="text-lg py-3 pr-20 bg-[#1a1a1a] border-[#2a2a2a] text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b0b0b0]">.privix</div>
              </div>

              {recipientUsername.length > 0 && (
                <div className="mt-4">
                  {recipientInfo?.isLoading ? (
                    <div className="flex items-center space-x-2 text-[#005eff]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Resolving username...</span>
                    </div>
                  ) : recipientInfo?.isValid ? (
                    <AnimatedCard className="p-4 bg-[#00ff88]/10 border-[#00ff88]/30">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-[#00ff88] text-white">
                            {recipientUsername[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{recipientUsername}.privix</p>
                          <p className="text-[#b0b0b0] text-sm">{formatAddress(recipientInfo.address)}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-[#00ff88] ml-auto" />
                      </div>
                    </AnimatedCard>
                  ) : (
                    <Alert className="bg-[#ff4444]/10 border-[#ff4444]/30">
                      <AlertCircle className="h-4 w-4 text-[#ff4444]" />
                      <AlertDescription className="text-[#ff4444]">Username not found or invalid</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {recipientInfo?.isValid && (
              <GradientButton onClick={() => setCurrentStep(2)} className="w-full" size="lg">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </GradientButton>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount" className="text-white text-lg font-medium">
                Amount
              </Label>
              <p className="text-[#b0b0b0] text-sm mb-4">Enter the amount of PRIVIX to send</p>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg py-3 pr-20 bg-[#1a1a1a] border-[#2a2a2a] text-white"
                  step="0.0001"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b0b0b0]">PRIVIX</div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-[#b0b0b0] text-sm">
                  Balance: {Number.parseFloat(userBalance).toFixed(4)} PRIVIX
                </span>
                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setAmount((Number.parseFloat(userBalance) * 0.95).toFixed(4))}
                >
                  Max
                </GradientButton>
              </div>

              {amount && !isAmountValid() && (
                <Alert className="mt-3 bg-[#ff4444]/10 border-[#ff4444]/30">
                  <AlertCircle className="h-4 w-4 text-[#ff4444]" />
                  <AlertDescription className="text-[#ff4444]">
                    {Number.parseFloat(amount) <= 0 ? "Amount must be greater than 0" : "Insufficient balance"}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {recipientInfo && amount && isAmountValid() && (
              <AnimatedCard className="p-4 bg-[#1a1a1a]">
                <h4 className="text-white font-medium mb-3">Transaction Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">To:</span>
                    <span className="text-white">{recipientInfo.username}.privix</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Amount:</span>
                    <span className="text-white">{amount} PRIVIX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Network Fee:</span>
                    <span className="text-white">~0.001 PRIVIX</span>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {error && (
              <Alert className="bg-[#ff4444]/10 border-[#ff4444]/30">
                <AlertCircle className="h-4 w-4 text-[#ff4444]" />
                <AlertDescription className="text-[#ff4444]">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <GradientButton variant="secondary" onClick={() => setCurrentStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </GradientButton>
              <GradientButton
                onClick={handleSend}
                disabled={!isAmountValid()}
                isLoading={isLoading || isApproving}
                className="flex-1"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </GradientButton>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 border-4 border-[#005eff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Sending Transaction</h3>
              <p className="text-[#b0b0b0] mb-4">Please confirm the transaction in your wallet</p>
              {transactionHash && (
                <p className="text-sm text-[#005eff]">Transaction: {transactionHash.slice(0, 10)}...</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Transaction Sent! 🎉</h3>
              <p className="text-[#b0b0b0] mb-4">Your PRIVIX has been successfully sent</p>
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <p className="text-white">
                  <span className="text-[#b0b0b0]">Sent:</span> {amount} PRIVIX
                </p>
                <p className="text-white">
                  <span className="text-[#b0b0b0]">To:</span> {recipientInfo?.username}.privix
                </p>
              </div>
            </div>
            <p className="text-sm text-[#b0b0b0]">Redirecting to dashboard...</p>
          </div>
        )

      default:
        return null
    }
  }

  if (!isConnected || !address) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-[#005eff] hover:text-[#3377ff] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Send Money</h1>
          <p className="text-lg text-[#b0b0b0]">Send PRIVIX using simple usernames</p>
        </div>

        <AnimatedCard className="mb-8 p-4 bg-gradient-to-r from-[#005eff]/10 to-[#0041cc]/10 border-[#005eff]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-[#005eff]" />
              <div>
                <p className="text-[#b0b0b0] text-sm">Your Balance</p>
                <p className="text-white text-xl font-bold">{Number.parseFloat(userBalance).toFixed(4)} PRIVIX</p>
              </div>
            </div>
            <Badge className="bg-[#00ff88]/20 text-[#00ff88]">Available</Badge>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-8">{renderStepContent()}</AnimatedCard>
      </div>
    </div>
  )
}
