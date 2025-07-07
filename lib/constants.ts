// Constants file for Privix frontend
export const CONTRACTS = {
  REGISTRY: "0x9205AD94E08671ffE4969284DB20083Ef87D02E3",
  PRIVIX_NFT: "0x0b192a8f54b41B720e7F247df463C27C3E14C0fE",
  TRANSACTION_MANAGER: "0x715F312876F6F6aef5c3b986740c102E60309D71",
}

export const PRIVIX_CHAIN_CONFIG = {
  chainId: 96969696,
  chainIdHex: "0x5c7a3e0",
  name: "Privix Chain Testnet",
  currency: "PRIVIX",
  rpcUrl: "https://testnet-rpc.privixchain.xyz",
  wsUrl: "wss://testnet-rpc.privixchain.xyz/ws",
  blockExplorer: "https://explorer.privixchain.xyz",
}

export const USERNAME_PRICING = {
  3: "1000",
  4: "700",
  5: "600",
  6: "100",
  7: "100",
  8: "100",
}

export const SUPPORTED_TOKENS = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "PRIVIX",
    name: "Privix Token",
    decimals: 18,
    isNative: true,
  },
]

export const API_ENDPOINTS = {
  METADATA_BASE: "https://api.privixchain.xyz/metadata",
  EXPLORER_API: "https://api.explorer.privixchain.xyz",
}

export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  MAX_USERNAME_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
}
