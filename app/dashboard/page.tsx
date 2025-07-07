"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Wallet,
  Send,
  ImageIcon,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
} from "lucide-react"

interface DashboardStats {
  totalSupply: number
  userBalance: string
  transactionCount: number
  isLoading: boolean
}

interface RecentActivity {
  id: string
  type: "mint" | "send" | "receive"
  amount?: string
  username?: string
  timestamp: Date
  status: "completed" | "pending"
}

export default function DashboardPage() {
  const router = useRouter()
  const { isConnected, address, userProfile, refreshProfile } = useWeb3()
  const [stats, setStats] = useState<DashboardStats>({
    totalSupply: 0,
    userBalance: "0",
    transactionCount: 0,
    isLoading: true,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    loadDashboardData()
  }, [isConnected, address])

  const loadDashboardData = async () => {
    if (!address) return

    try {
      setStats((prev) => ({ ...prev, isLoading: true }))

      const [totalSupply, balance] = await Promise.all([
        web3Service.getTotalSupply().catch(() => 0),
        web3Service.getBalance(address).catch(() => "0"),
      ])

      setStats({
        totalSupply,
        userBalance: balance,
        transactionCount: 0, // This would come from transaction history
        isLoading: false,
      })

      // Mock recent activity - in production, this would come from blockchain events
      setRecentActivity([
        {
          id: "1",
          type: "mint",
          username: userProfile?.username,
          timestamp: new Date(Date.now() - 86400000),
          status: "completed",
        },
      ])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setStats((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <ImageIcon className="w-4 h-4" />
      case "send":
        return <ArrowUpRight className="w-4 h-4" />
      case "receive":
        return <ArrowDownRight className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "mint":
        return "text-[#005eff]"
      case "send":
        return "text-[#ff4444]"
      case "receive":
        return "text-[#00ff88]"
      default:
        return "text-[#b0b0b0]"
    }
  }

  if (!isConnected) {
    return null // Will redirect to connect page
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back{userProfile?.username ? `, ${userProfile.username}` : ""}!
          </h1>
          <p className="text-[#b0b0b0]">Manage your digital identity and transactions</p>
        </div>

        {/* Profile Card */}
        <AnimatedCard className="mb-8 p-6 bg-gradient-to-r from-[#005eff]/10 to-[#0041cc]/10 border-[#005eff]/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-[#005eff] text-white text-xl">
                  {userProfile?.username ? userProfile.username[0].toUpperCase() : address?.[2].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {userProfile?.username ? `${userProfile.username}.privix` : "No Username"}
                </h2>
                <p className="text-[#b0b0b0]">{formatAddress(address!)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-[#00ff88]/20 text-[#00ff88]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  {userProfile?.memberSince && (
                    <Badge variant="outline" className="border-[#005eff]/30 text-[#005eff]">
                      Member since {userProfile.memberSince.getFullYear()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!userProfile?.username && (
                <Link href="/mint">
                  <GradientButton size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Mint Username
                  </GradientButton>
                </Link>
              )}
              <Link href="/profile">
                <GradientButton variant="secondary" size="sm">
                  View Profile
                </GradientButton>
              </Link>
            </div>
          </div>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b0b0b0] text-sm">Balance</p>
                <p className="text-2xl font-bold text-white">
                  {stats.isLoading ? "..." : `${Number.parseFloat(stats.userBalance).toFixed(4)}`}
                </p>
                <p className="text-xs text-[#b0b0b0]">PRIVIX</p>
              </div>
              <Wallet className="w-8 h-8 text-[#005eff]" />
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b0b0b0] text-sm">NFTs Owned</p>
                <p className="text-2xl font-bold text-white">{userProfile?.nftCount || 0}</p>
                <p className="text-xs text-[#b0b0b0]">Username NFTs</p>
              </div>
              <ImageIcon className="w-8 h-8 text-[#00ff88]" />
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b0b0b0] text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.transactionCount}</p>
                <p className="text-xs text-[#b0b0b0]">Total sent</p>
              </div>
              <Send className="w-8 h-8 text-[#ffaa00]" />
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b0b0b0] text-sm">Network</p>
                <p className="text-2xl font-bold text-white">
                  {stats.isLoading ? "..." : stats.totalSupply.toLocaleString()}
                </p>
                <p className="text-xs text-[#b0b0b0]">Total usernames</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#ff6b6b]" />
            </div>
          </AnimatedCard>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!userProfile?.hasMinted && (
                  <Link href="/mint" className="block">
                    <GradientButton className="w-full justify-start" variant="secondary">
                      <User className="w-4 h-4 mr-3" />
                      Mint Username
                    </GradientButton>
                  </Link>
                )}

                <Link href="/send" className="block">
                  <GradientButton className="w-full justify-start" variant="secondary">
                    <Send className="w-4 h-4 mr-3" />
                    Send Money
                  </GradientButton>
                </Link>

                <Link href="/nft" className="block">
                  <GradientButton className="w-full justify-start" variant="secondary">
                    <ImageIcon className="w-4 h-4 mr-3" />
                    View NFTs
                  </GradientButton>
                </Link>

                <Link href="/history" className="block">
                  <GradientButton className="w-full justify-start" variant="secondary">
                    <History className="w-4 h-4 mr-3" />
                    Transaction History
                  </GradientButton>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <Link href="/history">
                  <GradientButton variant="secondary" size="sm">
                    View All
                  </GradientButton>
                </Link>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full bg-[#0a0a0a] ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {activity.type === "mint" && `Minted username: ${activity.username}`}
                              {activity.type === "send" && `Sent ${activity.amount} PRIVIX`}
                              {activity.type === "receive" && `Received ${activity.amount} PRIVIX`}
                            </p>
                            <p className="text-[#b0b0b0] text-sm">{activity.timestamp.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge
                          variant={activity.status === "completed" ? "default" : "secondary"}
                          className={activity.status === "completed" ? "bg-[#00ff88]/20 text-[#00ff88]" : ""}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-[#b0b0b0] mx-auto mb-4" />
                    <p className="text-[#b0b0b0] mb-4">No recent activity</p>
                    <Link href="/mint">
                      <GradientButton size="sm">Get Started</GradientButton>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
