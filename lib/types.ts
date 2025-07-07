export interface UserProfile {
  address: string
  username?: string
  tokenId?: string
  balance: string
  nftCount: number
  memberSince?: Date
  hasMinted?: boolean
}

export interface Transaction {
  hash: string
  from: string
  fromUsername?: string
  to: string
  toUsername?: string
  amount: string
  token?: string
  isNative?: boolean
  timestamp: Date
  status: "pending" | "confirmed" | "failed"
  gasUsed?: string
  blockNumber?: number
}

export interface NFTMetadata {
  tokenId: string
  username: string
  image: string
  mintedAt: Date
  owner: string
  tokenURI?: string
}

export interface WalletProvider {
  name: string
  icon: string
  connector: string
  installed?: boolean
}

export interface MintingEvent {
  hash: string
  user: string
  username: string
  tokenId: string
  blockNumber: number
  timestamp: Date
}

export interface TransactionEvent {
  hash: string
  from: string
  fromUsername?: string
  to: string
  toUsername: string
  amount: string
  token: string
  isNative: boolean
  blockNumber: number
  timestamp: Date
}
