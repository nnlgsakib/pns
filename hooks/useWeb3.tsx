"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { web3Service } from "@/lib/web3"
import type { UserProfile } from "@/lib/types"

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnect: () => void
  refreshProfile: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const walletAddress = await web3Service.connectWallet()
      setAddress(walletAddress)
      setIsConnected(true)
      await loadUserProfile(walletAddress)

      // Store connection info
      localStorage.setItem("privix_connected", "true")
      localStorage.setItem("privix_address", walletAddress)
    } catch (err: any) {
      setError(err.message)
      console.error("Wallet connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setUserProfile(null)
    setError(null)

    // Clear stored connection info
    localStorage.removeItem("privix_connected")
    localStorage.removeItem("privix_address")
  }

  const loadUserProfile = async (walletAddress: string) => {
    try {
      const [username, balance, nftBalance, hasMinted] = await Promise.all([
        web3Service.getUsernameByAddress(walletAddress).catch(() => ""),
        web3Service.getBalance(walletAddress).catch(() => "0"),
        web3Service.getUserNFTBalance(walletAddress).catch(() => 0),
        web3Service.hasMinted(walletAddress).catch(() => false),
      ])

      setUserProfile({
        address: walletAddress,
        username: username || undefined,
        balance,
        nftCount: nftBalance,
        memberSince: username ? new Date() : undefined,
        hasMinted,
      })
    } catch (err) {
      console.error("Failed to load user profile:", err)
      // Set basic profile even if some data fails to load
      setUserProfile({
        address: walletAddress,
        balance: "0",
        nftCount: 0,
        hasMinted: false,
      })
    }
  }

  const refreshProfile = async () => {
    if (address) {
      await loadUserProfile(address)
    }
  }

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem("privix_connected")
      const storedAddress = localStorage.getItem("privix_address")

      if (wasConnected && storedAddress && window.ethereum) {
        try {
          // Check if still connected to the same account
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0 && accounts[0].toLowerCase() === storedAddress.toLowerCase()) {
            setAddress(storedAddress)
            setIsConnected(true)
            await loadUserProfile(storedAddress)
          } else {
            // Clear stale connection data
            disconnect()
          }
        } catch (err) {
          console.error("Auto-connect failed:", err)
          disconnect()
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== address) {
          // Account changed, reconnect
          setAddress(accounts[0])
          if (isConnected) {
            loadUserProfile(accounts[0])
          }
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address, isConnected])

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        address,
        userProfile,
        isLoading,
        error,
        connectWallet,
        disconnect,
        refreshProfile,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider")
  }
  return context
}
