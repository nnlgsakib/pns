"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { AnimatedCard } from "@/components/ui/animated-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ImageIcon,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Hash,
} from "lucide-react"
import { PRIVIX_CHAIN } from "@/lib/config"

interface NFTData {
  tokenId: string
  username: string
  owner: string
  tokenURI?: string
  mintedAt: Date
  metadata?: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
}

export default function NFTPage() {
  const router = useRouter()
  const { isConnected, address, userProfile } = useWeb3()
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect")
      return
    }

    loadUserNFTs()
  }, [isConnected, address])

  const loadUserNFTs = async () => {
    if (!address) return

    setIsLoading(true)
    setError("")

    try {
      // Get user's NFT balance
      const balance = await web3Service.getUserNFTBalance(address)

      if (balance === 0) {
        setNfts([])
        setIsLoading(false)
        return
      }

      // If user has NFTs, get the details
      const nftData: NFTData[] = []

      // Get username from profile if available
      if (userProfile?.username) {
        const userInfo = await web3Service.getUserInfo(userProfile.username)

        nftData.push({
          tokenId: userInfo.tokenId,
          username: userProfile.username,
          owner: address,
          mintedAt: userProfile.memberSince || new Date(),
        })

        // Try to get token URI and metadata
        try {
          const tokenURI = await web3Service.getTokenURI(userInfo.tokenId)
          nftData[0].tokenURI = tokenURI

          // If it's a valid JSON URI, fetch metadata
          if (tokenURI.startsWith("data:application/json") || tokenURI.startsWith("http")) {
            // Handle metadata fetching here if needed
          }
        } catch (err) {
          console.log("Could not fetch token URI:", err)
        }
      }

      setNfts(nftData)
    } catch (err: any) {
      console.error("Failed to load NFTs:", err)
      setError("Failed to load your NFTs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTokenId(tokenId)
      setTimeout(() => setCopiedTokenId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openInExplorer = (tokenId: string) => {
    const explorerUrl = `${PRIVIX_CHAIN.blockExplorer}/token/${tokenId}`
    window.open(explorerUrl, "_blank")
  }

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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">My NFTs</h1>
              <p className="text-lg lg:text-xl text-[#b0b0b0]">Your unique username NFT collection</p>
            </div>

            {nfts.length === 0 && !isLoading && (
              <Link href="/mint">
                <GradientButton size="lg" icon={<Sparkles className="w-5 h-5" />}>
                  Mint Username
                </GradientButton>
              </Link>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <AnimatedCard key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-[#2a2a2a] rounded-xl mb-4"></div>
                  <div className="h-6 bg-[#2a2a2a] rounded mb-2"></div>
                  <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-8 bg-[#ff4444]/10 border-[#ff4444]/30 rounded-xl">
            <AlertCircle className="h-4 w-4 text-[#ff4444]" />
            <AlertDescription className="text-[#ff4444]">{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && nfts.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-[#005eff]/20 to-[#0041cc]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 lg:w-16 lg:h-16 text-[#005eff]" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">No NFTs Yet</h3>
            <p className="text-lg text-[#b0b0b0] mb-8 max-w-md mx-auto">
              You haven't minted any username NFTs yet. Get started by minting your first unique username!
            </p>
            <Link href="/mint">
              <GradientButton size="xl" icon={<Sparkles className="w-6 h-6" />}>
                Mint Your First Username
              </GradientButton>
            </Link>
          </div>
        )}

        {/* NFT Grid */}
        {!isLoading && nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <AnimatedCard key={nft.tokenId} className="overflow-hidden" variant="glass">
                {/* NFT Image/Preview */}
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-[#005eff] to-[#0041cc] flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                          {nft.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-bold text-white">{nft.username}.privix</h3>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Owned
                  </Badge>
                </div>

                {/* NFT Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">{nft.username}.privix</h4>
                    <Badge variant="outline" className="border-[#005eff]/30 text-[#005eff]">
                      Username NFT
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#b0b0b0] flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        Token ID
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono">#{nft.tokenId}</span>
                        <button
                          onClick={() => copyToClipboard(nft.tokenId, nft.tokenId)}
                          className="text-[#005eff] hover:text-[#3377ff] transition-colors"
                        >
                          {copiedTokenId === nft.tokenId ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#b0b0b0] flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Minted
                      </span>
                      <span className="text-white">{nft.mintedAt.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#b0b0b0]">Length</span>
                      <span className="text-white">{nft.username.length} characters</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <GradientButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openInExplorer(nft.tokenId)}
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      View on Explorer
                    </GradientButton>
                    <Link href="/send" className="flex-1">
                      <GradientButton size="sm" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
                        Use to Send
                      </GradientButton>
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {nfts.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard className="p-6 text-center" variant="glass">
              <div className="text-3xl font-bold text-[#005eff] mb-2">{nfts.length}</div>
              <div className="text-[#b0b0b0]">NFTs Owned</div>
            </AnimatedCard>

            <AnimatedCard className="p-6 text-center" variant="glass">
              <div className="text-3xl font-bold text-[#00ff88] mb-2">
                {nfts.reduce((min, nft) => Math.min(min, nft.username.length), Number.POSITIVE_INFINITY)}
              </div>
              <div className="text-[#b0b0b0]">Shortest Username</div>
            </AnimatedCard>

            <AnimatedCard className="p-6 text-center" variant="glass">
              <div className="text-3xl font-bold text-[#ffaa00] mb-2">
                {nfts[0]?.mintedAt.getFullYear() || new Date().getFullYear()}
              </div>
              <div className="text-[#b0b0b0]">Member Since</div>
            </AnimatedCard>
          </div>
        )}
      </div>
    </div>
  )
}
