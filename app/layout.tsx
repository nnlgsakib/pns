import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/hooks/useWeb3"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import ClickSpark from "@/components/ui/touchSpark"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Privix - Own Your Digital Identity",
  description: "Mint unique usernames as NFTs and send crypto with ease on the Privix blockchain.",
  keywords: "Web3, NFT, Username, Blockchain, Cryptocurrency, DeFi",
  authors: [{ name: "Privix Team" }],
  openGraph: {
    title: "Privix - Own Your Digital Identity",
    description: "Mint unique usernames as NFTs and send crypto with ease",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        <Web3Provider>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster />
          <ClickSpark 
            sparkColor='#fff'
  sparkSize={10}
  sparkRadius={15}
  sparkCount={8}
  duration={400}/>
        </Web3Provider>
      </body>
    </html>
  )
}
