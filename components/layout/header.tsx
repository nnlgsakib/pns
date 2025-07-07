"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { GradientButton } from "@/components/ui/gradient-button"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, User, LogOut, Menu, X, Home, Coins, Send, ImageIcon, History } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isConnected, address, userProfile, connectWallet, disconnect, isLoading } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect to dashboard immediately after connection
  useEffect(() => {
    if (isConnected && address && pathname === "/") {
      router.push("/dashboard")
    }
  }, [isConnected, address, pathname, router])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    ...(userProfile?.hasMinted ? [] : [{ name: "Mint Username", href: "/mint", icon: Coins }]),
    { name: "Send Money", href: "/send", icon: Send },
    { name: "My NFTs", href: "/nft", icon: ImageIcon },
    { name: "History", href: "/history", icon: History },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#005eff] to-[#0041cc] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg lg:text-xl">P</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white">PNS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "text-[#005eff] bg-[#005eff]/10 border border-[#005eff]/20"
                      : "text-[#b0b0b0] hover:text-white hover:bg-[#1a1a1a]/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {!isConnected ? (
              <Link href="/connect">
                <GradientButton size="md" className="hidden sm:flex" icon={<Wallet className="w-4 h-4" />}>
                  Connect Wallet
                </GradientButton>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 text-white hover:bg-[#1a1a1a]/50 rounded-xl px-3 py-2 h-auto"
                  >
                    <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                      <AvatarFallback className="bg-gradient-to-r from-[#005eff] to-[#0041cc] text-white text-sm lg:text-base">
                        {userProfile?.username ? userProfile.username[0].toUpperCase() : address?.[2].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm lg:text-base font-medium">
                        {userProfile?.username ? `${userProfile.username}.privix` : formatAddress(address!)}
                      </div>
                      <div className="text-xs lg:text-sm text-[#b0b0b0]">
                        {Number.parseFloat(userProfile?.balance || "0").toFixed(4)} PRIVIX
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#1a1a1a]/95 border-[#2a2a2a]/50 backdrop-blur-md rounded-xl"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center text-white hover:bg-[#2a2a2a]/50 rounded-lg">
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={disconnect}
                    className="flex items-center text-white hover:bg-[#2a2a2a]/50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-[#1a1a1a]/50 rounded-xl p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#2a2a2a]/50">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                      pathname === item.href
                        ? "text-[#005eff] bg-[#005eff]/10 border border-[#005eff]/20"
                        : "text-[#b0b0b0] hover:text-white hover:bg-[#1a1a1a]/50",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {!isConnected && (
                <div className="pt-4">
                  <Link href="/connect">
                    <GradientButton size="lg" className="w-full" icon={<Wallet className="w-5 h-5" />}>
                      Connect Wallet
                    </GradientButton>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
