"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { GradientButton } from "@/components/ui/gradient-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Globe, Sparkles, TrendingUp, Clock, Users } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isConnected, connectWallet, isLoading } = useWeb3()
  const [stats, setStats] = useState({
    totalSupply: 0,
    isLoading: true,
    error: null as string | null,
  })

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true, error: null }))

        const totalSupply = await web3Service.getTotalSupply()

        setStats({
          totalSupply,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error("Failed to load stats:", error)
        setStats({
          totalSupply: 0,
          isLoading: false,
          error: "Failed to load blockchain data",
        })
      }
    }

    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async () => {
    // Always redirect to connect page instead of directly connecting
    router.push("/connect")
  }

  const features = [
    {
      icon: Shield,
      title: "Secure NFT Usernames",
      description: "Own your digital identity with blockchain-secured usernames that can never be taken away.",
      color: "from-[#005eff] to-[#0041cc]",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Send crypto using simple usernames instead of complex wallet addresses.",
      color: "from-[#00ff88] to-[#00cc66]",
    },
    {
      icon: Globe,
      title: "Universal Identity",
      description: "Use your Privix username across the entire Web3 ecosystem.",
      color: "from-[#ffaa00] to-[#ff8800]",
    },
  ]

  const steps = [
    {
      step: "01",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to get started",
      icon: Shield,
    },
    {
      step: "02",
      title: "Choose Username",
      description: "Pick your unique username (3-8 characters)",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Mint NFT",
      description: "Mint your username as an NFT on Privix Chain",
      icon: Zap,
    },
    {
      step: "04",
      title: "Start Using",
      description: "Send and receive crypto with your username",
      icon: Globe,
    },
  ]

  const pricing = [
    { length: "3 chars", price: "1000", popular: true, savings: "Premium" },
    { length: "4 chars", price: "700", popular: false, savings: "30% off" },
    { length: "5 chars", price: "600", popular: false, savings: "40% off" },
    { length: "6-8 chars", price: "100", popular: false, savings: "90% off" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#001a66] to-[#0a0a0a] py-16 lg:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005eff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0041cc] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#005eff] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-[#005eff]/20 text-[#005eff] border-[#005eff]/30 rounded-full px-4 py-2">
              🚀 Now Live on Privix Chain Testnet
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#005eff] to-white bg-clip-text text-transparent">
              Own Your Digital Identity
            </h1>

            <p className="text-xl md:text-2xl text-[#b0b0b0] mb-8 max-w-3xl mx-auto leading-relaxed">
              Mint unique usernames as NFTs and send crypto with ease. Your identity, your control, forever on the
              blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <GradientButton
                onClick={handleConnect}
                isLoading={isLoading}
                size="xl"
                className="text-lg px-8 py-4"
                icon={<ArrowRight className="w-6 h-6" />}
                iconPosition="right"
              >
                Get Started
              </GradientButton>

              <Link href="/mint">
                <GradientButton
                  variant="secondary"
                  size="xl"
                  className="text-lg px-8 py-4"
                  icon={<Sparkles className="w-6 h-6" />}
                >
                  Mint Username
                </GradientButton>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <AnimatedCard className="p-6 text-center" variant="glass">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-[#005eff] mr-2" />
                  <div className="text-3xl font-bold text-[#005eff]">
                    {stats.isLoading ? (
                      <div className="w-8 h-8 border-2 border-[#005eff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : stats.error ? (
                      "---"
                    ) : (
                      stats.totalSupply.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="text-sm text-[#b0b0b0]">Usernames Minted</div>
                {stats.error && <div className="text-xs text-[#ff4444] mt-1">Unable to load</div>}
              </AnimatedCard>

              <AnimatedCard className="p-6 text-center" variant="glass">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-[#00ff88] mr-2" />
                  <div className="text-3xl font-bold text-[#00ff88]">24/7</div>
                </div>
                <div className="text-sm text-[#b0b0b0]">Network Uptime</div>
              </AnimatedCard>

              <AnimatedCard className="p-6 text-center" variant="glass">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-[#ffaa00] mr-2" />
                  <div className="text-3xl font-bold text-[#ffaa00]">{"<1s"}</div>
                </div>
                <div className="text-sm text-[#b0b0b0]">Transaction Time</div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Why Choose Privix?</h2>
            <p className="text-xl text-[#b0b0b0] max-w-2xl mx-auto">
              Experience the future of digital identity with our cutting-edge Web3 platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={index} className="p-8 text-center" variant="glass">
                <div
                  className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                  <feature.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-[#b0b0b0] leading-relaxed">{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-[#b0b0b0] max-w-2xl mx-auto">
              Get your unique username in just four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <AnimatedCard className="p-6 lg:p-8 text-center h-full" variant="glass">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-[#005eff] to-[#0041cc] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-[#005eff] mb-4">{step.step}</div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-[#b0b0b0] text-sm lg:text-base leading-relaxed">{step.description}</p>
                </AnimatedCard>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#005eff]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-[#b0b0b0] max-w-2xl mx-auto">
              Choose the perfect username length for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((tier, index) => (
              <AnimatedCard
                key={index}
                className={`p-6 lg:p-8 text-center relative ${
                  tier.popular ? "border-[#005eff] border-2 scale-105" : ""
                }`}
                variant={tier.popular ? "glass" : "default"}
                glow={tier.popular}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#005eff] to-[#0041cc] text-white border-0 rounded-full px-3 py-1">
                    Most Popular
                  </Badge>
                )}
                <div className="text-lg font-semibold text-[#b0b0b0] mb-2">{tier.length}</div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {tier.price} <span className="text-lg text-[#b0b0b0]">PRIVIX</span>
                </div>
                <div className="text-sm text-[#00ff88] mb-4 font-medium">{tier.savings}</div>
                <Link href="/mint">
                  <GradientButton
                    variant={tier.popular ? "primary" : "secondary"}
                    className="w-full"
                    size="lg"
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    Mint Now
                  </GradientButton>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#005eff] to-[#0041cc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to Own Your Digital Identity?
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have already claimed their unique username on Privix Chain
          </p>

          <GradientButton
            onClick={handleConnect}
            isLoading={isLoading}
            size="xl"
            className="bg-white text-[#005eff] hover:bg-white/90 text-lg lg:text-xl px-8 py-4"
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
          >
            Connect Wallet & Start
          </GradientButton>
        </div>
      </section>
    </div>
  )
}
