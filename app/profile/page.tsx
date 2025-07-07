"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  User,
  Wallet,
  Copy,
  CheckCircle,
  ExternalLink,
  Shield,
  Calendar,
  Hash,
  Coins,
  ImageIcon,
  Settings,
  RefreshCw,
} from "lucide-react"
import { PRIVIX_CHAIN } from "@/lib/config"

interface ProfileStats {
  totalTransactions: number
  totalSent: string
  totalReceived: string
  nftCount: number
  memberSince: Date | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { isConnected, address, userProfile, refreshProfile, disconnect } = useWeb3()
  const [stats, setStats] = useState<ProfileStats>({
    totalTransactions: 0,
    totalSent: "0",
    totalReceived: "0",
    nftCount: 0,
    memberSince: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    loadProfileData()
  }, [isConnected, address])

  const loadProfileData = async () => {
    if (!address) return

    setIsLoading(true)

    try {
      // Get recent transactions to calculate stats
      const transactions = await web3Service.getRecentTransactions(address, 100)

      let totalSent = 0
      let totalReceived = 0

      transactions.forEach((tx) => {
        const amount = Number.parseFloat(tx.amount)
        if (tx.from.toLowerCase() === address.toLowerCase()) {
          totalSent += amount
        } else {
          totalReceived += amount
        }
      })

      setStats({
        totalTransactions: transactions.length,
        totalSent: totalSent.toFixed(4),
        totalReceived: totalReceived.toFixed(4),
        nftCount: userProfile?.nftCount || 0,
        memberSince: userProfile?.memberSince || null,
      })
    } catch (error) {
      console.error("Failed to load profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshProfile(), loadProfileData()])
    setIsRefreshing(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const openInExplorer = () => {
    const explorerUrl = `${PRIVIX_CHAIN.blockExplorer}/address/${address}`
    window.open(explorerUrl, "_blank")
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#005eff] hover:text-[#3377ff] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">Profile</h1>
              <p className="text-lg lg:text-xl text-[#b0b0b0]">Manage your account and view your activity</p>
            </div>

            <GradientButton
              onClick={handleRefresh}
              isLoading={isRefreshing}
              variant="secondary"
              size="lg"
              icon={<RefreshCw className="w-5 h-5" />}
            >
              Refresh
            </GradientButton>
          </div>
        </div>

        {/* Profile Card */}
        <AnimatedCard
          className="mb-8 p-6 lg:p-8 bg-gradient-to-r from-[#005eff]/10 to-[#0041cc]/10 border-[#005eff]/20"
          glow
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 lg:w-24 lg:h-24">
                <AvatarFallback className="bg-gradient-to-r from-[#005eff] to-[#0041cc] text-white text-2xl lg:text-3xl">
                  {userProfile?.username ? userProfile.username[0].toUpperCase() : address?.[2].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  {userProfile?.username ? `${userProfile.username}.privix` : "No Username"}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  {userProfile?.hasMinted && (
                    <Badge className="bg-[#005eff]/20 text-[#005eff] border-[#005eff]/30">
                      <Shield className="w-3 h-3 mr-1" />
                      NFT Owner
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="flex-1 lg:text-right">
              <div className="text-3xl lg:text-4xl font-bold text-white">
                {Number.parseFloat(userProfile?.balance || "0").toFixed(4)}
              </div>
              <div className="text-[#b0b0b0] text-lg">PRIVIX</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Wallet Information */}
          <AnimatedCard className="p-6" variant="glass">
            <div className="flex items-center space-x-3 mb-6">
              <Wallet className="w-6 h-6 text-[#005eff]" />
              <h3 className="text-xl font-bold text-white">Wallet Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-[#b0b0b0] text-sm">Wallet Address</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={address || ""}
                    readOnly
                    className="bg-[#1a1a1a]/50 border-[#2a2a2a] text-white font-mono text-sm"
                  />
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(address!)}
                    icon={copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copiedAddress ? "Copied" : "Copy"}
                  </GradientButton>
                </div>
              </div>

              <div>
                <Label className="text-[#b0b0b0] text-sm">Network</Label>
                <div className="flex items-center justify-between mt-1 p-3 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                  <span className="text-white">{PRIVIX_CHAIN.name}</span>
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                </div>
              </div>

              <GradientButton
                variant="secondary"
                className="w-full"
                onClick={openInExplorer}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                View on Explorer
              </GradientButton>
            </div>
          </AnimatedCard>

          {/* Account Stats */}
          <AnimatedCard className="p-6" variant="glass">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-[#005eff]" />
              <h3 className="text-xl font-bold text-white">Account Details</h3>
            </div>

            <div className="space-y-4">
              {userProfile?.username && (
                <div className="flex items-center justify-between p-3 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-[#b0b0b0]" />
                    <span className="text-[#b0b0b0]">Username</span>
                  </div>
                  <span className="text-white font-medium">{userProfile.username}.privix</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#b0b0b0]" />
                  <span className="text-[#b0b0b0]">NFTs Owned</span>
                </div>
                <span className="text-white font-medium">{stats.nftCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#b0b0b0]" />
                  <span className="text-[#b0b0b0]">Member Since</span>
                </div>
                <span className="text-white font-medium">
                  {stats.memberSince ? stats.memberSince.toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Activity Stats */}
        <AnimatedCard className="mb-8 p-6" variant="glass">
          <div className="flex items-center space-x-3 mb-6">
            <Coins className="w-6 h-6 text-[#005eff]" />
            <h3 className="text-xl font-bold text-white">Activity Overview</h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-[#2a2a2a] rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                <div className="text-2xl font-bold text-[#005eff] mb-1">{stats.totalTransactions}</div>
                <div className="text-[#b0b0b0] text-sm">Total Transactions</div>
              </div>

              <div className="text-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                <div className="text-2xl font-bold text-[#ff4444] mb-1">{stats.totalSent}</div>
                <div className="text-[#b0b0b0] text-sm">PRIVIX Sent</div>
              </div>

              <div className="text-center p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]">
                <div className="text-2xl font-bold text-[#00ff88] mb-1">{stats.totalReceived}</div>
                <div className="text-[#b0b0b0] text-sm">PRIVIX Received</div>
              </div>
            </div>
          )}
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard className="p-6" variant="glass">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-[#005eff]" />
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!userProfile?.username && (
              <Link href="/mint">
                <GradientButton className="w-full" icon={<User className="w-4 h-4" />}>
                  Mint Username
                </GradientButton>
              </Link>
            )}

            <Link href="/send">
              <GradientButton variant="secondary" className="w-full" icon={<Coins className="w-4 h-4" />}>
                Send Money
              </GradientButton>
            </Link>

            <Link href="/nft">
              <GradientButton variant="secondary" className="w-full" icon={<ImageIcon className="w-4 h-4" />}>
                View NFTs
              </GradientButton>
            </Link>

            <GradientButton
              variant="danger"
              className="w-full"
              onClick={disconnect}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Disconnect
            </GradientButton>
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
