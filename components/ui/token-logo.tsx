"use client"

import Image from "next/image"

interface TokenLogoProps {
  logo?: string
  symbol: string
  size?: number
}

export function TokenLogo({ logo, symbol, size = 32 }: TokenLogoProps) {
  if (logo) {
    return <Image src={logo} alt={`${symbol} logo`} width={size} height={size} />
  }

  const bgColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase()
    return "#" + "00000".substring(0, 6 - c.length) + c
  }

  return (
    <div
      style={{ backgroundColor: bgColor(symbol) }}
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
    >
      {symbol.slice(0, 2)}
    </div>
  )
}
