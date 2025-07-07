"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SUPPORTED_TOKENS } from "@/lib/constants"
import { GradientButton } from "./gradient-button"

import { TokenLogo } from "./token-logo"

interface CurrencySelectorModalProps {
  onSelect: (token: { address: string; symbol: string; isNative: boolean; logo?: string }) => void
  children: React.ReactNode
}

export function CurrencySelectorModal({ onSelect, children }: CurrencySelectorModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTokens = SUPPORTED_TOKENS.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (token: { address: string; symbol: string; isNative: boolean; logo?: string }) => {
    onSelect(token)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle>Select a currency</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Input
            placeholder="Search by name or symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 bg-[#2a2a2a] border-[#3a3a3a] text-white"
          />
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredTokens.map((token) => (
                <div
                  key={token.symbol}
                  onClick={() => handleSelect(token)}
                  className="flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-[#2a2a2a]"
                >
                  <TokenLogo logo={token.logo} symbol={token.symbol} />
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm text-[#b0b0b0]">{token.symbol}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
