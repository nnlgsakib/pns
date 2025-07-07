"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ImageIcon,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Coins,
} from "lucide-react"
import { PRIVIX_CHAIN } from "@/lib/config"

interface Transaction {
  hash: string
  type: "send" | "receive" | "mint"
  from: string
  fromUsername?: string
  to: string
  toUsername?: string
  amount: string
  token: string
  isNative: boolean
  timestamp: Date
  status: "completed" | "pending" | "failed"
  blockNumber?: number
}

export default function HistoryPage() {
  const router = useRouter()
  const { isConnected, address, userProfile } = useWeb3()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    loadTransactionHistory()
  }, [isConnected, address])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType])

  const loadTransactionHistory = async () => {
    if (!address) return

    setIsLoading(true)

    try {
      // Get recent transactions
      const recentTxs = await web3Service.getRecentTransactions(address, 100)

      // Get minting events
      const mintingEvents = await web3Service.getMintingEvents(address, 10)

      // Combine and format transactions
      const allTransactions: Transaction[] = []

      // Add regular transactions
      recentTxs.forEach((tx) => {
        const isOutgoing = tx.from.toLowerCase() === address.toLowerCase()
        allTransactions.push({
          hash: tx.hash,
          type: isOutgoing ? "send" : "receive",
          from: tx.from,
          fromUsername: tx.fromUsername,
          to: tx.to,
          toUsername: tx.toUsername,
          amount: tx.amount,
          token: tx.token || "PRIVIX",
          isNative: tx.isNative,
          timestamp: tx.timestamp || new Date(),
          status: "completed",
          blockNumber: tx.blockNumber,
        })
      })

      // Add minting events
      mintingEvents.forEach((event) => {
        allTransactions.push({
          hash: event.hash,
          type: "mint",
          from: event.user,
          to: event.user,
          toUsername: event.username,
          amount: "0",
          token: "NFT",
          isNative: false,
          timestamp: event.timestamp || new Date(),
          status: "completed",
          blockNumber: event.blockNumber,
        })
      })

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      setTransactions(allTransactions)
    } catch (error) {
      console.error("Failed to load transaction history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(term) ||
          tx.fromUsername?.toLowerCase().includes(term) ||
          tx.toUsername?.toLowerCase().includes(term) ||
          tx.from.toLowerCase().includes(term) ||
          tx.to.toLowerCase().includes(term),
      )
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-5 h-5 text-[#ff4444]" />
      case "receive":
        return <ArrowDownRight className="w-5 h-5 text-[#00ff88]" />
      case "mint":
        return <ImageIcon className="w-5 h-5 text-[#005eff]" />
      default:
        return <History className="w-5 h-5 text-[#b0b0b0]" />
    }
  }

  const getTransactionTitle = (tx: Transaction) => {
    switch (tx.type) {
      case "send":
        return `Sent to ${tx.toUsername ? `${tx.toUsername}.privix` : `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}`
      case "receive":
        return `Received from ${tx.fromUsername ? `${tx.fromUsername}.privix` : `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}`
      case "mint":
        return `Minted ${tx.toUsername}.privix`
      default:
        return "Transaction"
    }
  }

  const openInExplorer = (hash: string) => {
    const explorerUrl = `${PRIVIX_CHAIN.blockExplorer}/tx/${hash}`
    window.open(explorerUrl, "_blank")
  }

  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">Transaction History</h1>
              <p className="text-lg lg:text-xl text-[#b0b0b0]">View all your transactions and activities</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatedCard className="mb-8 p-6" variant="glass">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0b0]" />
                <Input
                  placeholder="Search by hash, username, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a1a]/50 border-[#2a2a2a] text-white rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-[#b0b0b0]" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-[#1a1a1a]/50 border-[#2a2a2a] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] rounded-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="send">Sent</SelectItem>
                    <SelectItem value="receive">Received</SelectItem>
                    <SelectItem value="mint">Minted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <GradientButton
                variant="secondary"
                size="sm"
                onClick={loadTransactionHistory}
                isLoading={isLoading}
                icon={<History className="w-4 h-4" />}
              >
                Refresh
              </GradientButton>
            </div>
          </div>
        </AnimatedCard>

        {/* Transaction List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <AnimatedCard key={i} className="p-6">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#2a2a2a] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#2a2a2a] rounded mb-2"></div>
                    <div className="h-3 bg-[#2a2a2a] rounded w-3/4"></div>
                  </div>
                  <div className="h-6 bg-[#2a2a2a] rounded w-20"></div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-[#005eff]/20 to-[#0041cc]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <History className="w-12 h-12 lg:w-16 lg:h-16 text-[#005eff]" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">No Transactions Found</h3>
            <p className="text-lg text-[#b0b0b0] mb-8 max-w-md mx-auto">
              {searchTerm || filterType !== "all"
                ? "No transactions match your current filters."
                : "You haven't made any transactions yet. Start by minting a username or sending money!"}
            </p>
            {!searchTerm && filterType === "all" && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/mint">
                  <GradientButton size="lg" icon={<ImageIcon className="w-5 h-5" />}>
                    Mint Username
                  </GradientButton>
                </Link>
                <Link href="/send">
                  <GradientButton variant="secondary" size="lg" icon={<Coins className="w-5 h-5" />}>
                    Send Money
                  </GradientButton>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {paginatedTransactions.map((tx) => (
                <AnimatedCard key={tx.hash} className="p-6" variant="glass">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{getTransactionTitle(tx)}</h4>
                        <div className="flex items-center space-x-4 text-sm text-[#b0b0b0]">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{tx.timestamp.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Block #{tx.blockNumber || "---"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {tx.type !== "mint" && (
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${tx.type === "send" ? "text-[#ff4444]" : "text-[#00ff88]"}`}
                          >
                            {tx.type === "send" ? "-" : "+"}
                            {Number.parseFloat(tx.amount).toFixed(4)} {tx.token}
                          </div>
                        </div>
                      )}

                      <Badge
                        className={`${
                          tx.status === "completed"
                            ? "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30"
                            : tx.status === "pending"
                              ? "bg-[#ffaa00]/20 text-[#ffaa00] border-[#ffaa00]/30"
                              : "bg-[#ff4444]/20 text-[#ff4444] border-[#ff4444]/30"
                        }`}
                      >
                        {tx.status}
                      </Badge>

                      <GradientButton
                        variant="secondary"
                        size="sm"
                        onClick={() => openInExplorer(tx.hash)}
                        icon={<ExternalLink className="w-4 h-4" />}
                      >
                        View
                      </GradientButton>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </GradientButton>

                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>

                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </GradientButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
