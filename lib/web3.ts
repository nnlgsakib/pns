// Add ethereum property to Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEther,
  formatEther,
  getContract,
  type Address,
  type Hash,
  type TransactionReceipt,
} from "viem"
import { PRIVIX_CHAIN, CONTRACTS } from "./config"
import { PRIVIX_CHAIN_CONFIG } from "./constants"

// Registry Contract ABI - matches your Registry.sol
const REGISTRY_ABI = [
  {
    inputs: [{ name: "username", type: "string" }],
    name: "isUsernameTaken",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUsernameByAddress",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getUsernameByTokenId",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "username", type: "string" }],
    name: "getUserInfo",
    outputs: [
      {
        components: [
          { name: "userAddress", type: "address" },
          { name: "username", type: "string" },
          { name: "tokenId", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "username", type: "string" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "registerUsername",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "username", type: "string" },
      { indexed: false, name: "tokenId", type: "uint256" },
    ],
    name: "UsernameRegistered",
    type: "event",
  },
] as const

// PrivixNFT Contract ABI - matches your PrivixNFT.sol
const NFT_ABI = [
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "username", type: "string" }],
    name: "mintUsername",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "length", type: "uint256" }],
    name: "getMintingPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ name: "username", type: "string" }],
    name: "isValidUsername",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "hasMinted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "username", type: "string" },
      { indexed: false, name: "tokenId", type: "uint256" },
    ],
    name: "UsernameMinted",
    type: "event",
  },
] as const

// TransactionManager Contract ABI - matches your TransactionManager.sol
const TRANSACTION_ABI = [
  {
    inputs: [
      { name: "toUsername", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    name: "sendETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "toUsername", type: "string" },
      { name: "tokenAddress", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "sendERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "fromUsername", type: "string" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "toUsername", type: "string" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "isNative", type: "bool" },
    ],
    name: "TransactionSent",
    type: "event",
  },
] as const

// Define the Privix chain
const privixChain = {
  id: PRIVIX_CHAIN.chainId,
  name: PRIVIX_CHAIN.name,
  network: "privix-testnet",
  nativeCurrency: {
    decimals: 18,
    name: PRIVIX_CHAIN.currency,
    symbol: PRIVIX_CHAIN.currency,
  },
  rpcUrls: {
    default: {
      http: [PRIVIX_CHAIN.rpcUrl],
      webSocket: [PRIVIX_CHAIN.wsUrl],
    },
    public: {
      http: [PRIVIX_CHAIN.rpcUrl],
      webSocket: [PRIVIX_CHAIN.wsUrl],
    },
  },
  blockExplorers: {
    default: { name: "Privix Explorer", url: PRIVIX_CHAIN.blockExplorer },
  },
} as const

export class Web3Service {
  private publicClient: any = null
  private walletClient: any = null
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initializePublicClient()
    }
  }

  private initializePublicClient() {
    try {
      this.publicClient = createPublicClient({
        chain: privixChain,
        transport: http(PRIVIX_CHAIN.rpcUrl),
      })
      this.isInitialized = true
      console.log("Public client initialized successfully")
    } catch (error) {
      console.error("Failed to initialize public client:", error)
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initializePublicClient()
    }
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      console.log("Attempting to connect wallet...")

      // Request account access
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Create wallet client
      this.walletClient = createWalletClient({
        chain: privixChain,
        transport: custom(window.ethereum),
      })

      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      if (Number.parseInt(chainId, 16) !== PRIVIX_CHAIN_CONFIG.chainId) {
        try {
          await this.switchToPrivixChain()
        } catch (error) {
          throw new Error(`Please switch to the ${PRIVIX_CHAIN_CONFIG.name} network in your wallet.`)
        }
      }

      const address = accounts[0]
      console.log("Wallet connected successfully:", address)
      return address
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }

  private async switchToPrivixChain() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PRIVIX_CHAIN.chainIdHex }],
      })
    } catch (switchError: any) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: PRIVIX_CHAIN.chainIdHex,
              chainName: PRIVIX_CHAIN.name,
              nativeCurrency: {
                name: PRIVIX_CHAIN.currency,
                symbol: PRIVIX_CHAIN.currency,
                decimals: 18,
              },
              rpcUrls: [PRIVIX_CHAIN.rpcUrl],
              blockExplorerUrls: [PRIVIX_CHAIN.blockExplorer],
            },
          ],
        })
      } else {
        throw switchError
      }
    }
  }

  // Public read-only methods
  async getTotalSupply(): Promise<number> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return 0
      }

      const supply = await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "totalSupply",
      })
      return Number(supply)
    } catch (error) {
      console.error("Failed to get total supply:", error)
      return 0
    }
  }

  async getMintingPrice(length: number): Promise<string> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available, using fallback prices")
        if (length === 3) return "1000"
        if (length === 4) return "700"
        if (length === 5) return "600"
        return "100"
      }

      const price = await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "getMintingPrice",
        args: [BigInt(length)],
      })
      return formatEther(price)
    } catch (error) {
      console.error("Failed to get minting price:", error)
      // Return fallback prices
      if (length === 3) return "1000"
      if (length === 4) return "700"
      if (length === 5) return "600"
      return "100"
    }
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return true
      }

      return await this.publicClient.readContract({
        address: CONTRACTS.REGISTRY as Address,
        abi: REGISTRY_ABI,
        functionName: "isUsernameTaken",
        args: [username],
      })
    } catch (error) {
      console.error("Failed to check username availability:", error)
      return true // Assume taken on error for safety
    }
  }

  async isValidUsername(username: string): Promise<boolean> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available, using client-side validation")
        if (username.length < 3 || username.length > 8) return false
        return /^[a-z0-9]+$/.test(username)
      }

      return await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "isValidUsername",
        args: [username],
      })
    } catch (error) {
      console.error("Failed to validate username:", error)
      // Client-side validation as fallback
      if (username.length < 3 || username.length > 8) return false
      return /^[a-z0-9]+$/.test(username)
    }
  }

  async hasMinted(address: string): Promise<boolean> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return false
      }

      return await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "hasMinted",
        args: [address as Address],
      })
    } catch (error) {
      console.error("Failed to check if user has minted:", error)
      return false
    }
  }

  // Methods that require wallet connection
  async mintUsername(username: string): Promise<{ hash: Hash; wait: () => Promise<TransactionReceipt> }> {
    if (!this.walletClient) throw new Error("Wallet not connected")

    try {
      // Get the price first
      const price = await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "getMintingPrice",
        args: [BigInt(username.length)],
      })

      // Get the account
      const [account] = await this.walletClient.getAddresses()

      // Send the transaction
      const hash = await this.walletClient.writeContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "mintUsername",
        args: [username],
        value: price,
        account,
      })

      return {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    } catch (error) {
      console.error("Failed to mint username:", error)
      throw error
    }
  }

  async getUsernameByAddress(address: string): Promise<string> {
    this.ensureInitialized()

    if (!this.publicClient) throw new Error("Public client not initialized")

    return await this.publicClient.readContract({
      address: CONTRACTS.REGISTRY as Address,
      abi: REGISTRY_ABI,
      functionName: "getUsernameByAddress",
      args: [address as Address],
    })
  }

  async getUserInfo(username: string): Promise<{ userAddress: string; username: string; tokenId: string }> {
    this.ensureInitialized()

    if (!this.publicClient) throw new Error("Public client not initialized")

    const userInfo = await this.publicClient.readContract({
      address: CONTRACTS.REGISTRY as Address,
      abi: REGISTRY_ABI,
      functionName: "getUserInfo",
      args: [username],
    })
    return {
      userAddress: userInfo.userAddress,
      username: userInfo.username,
      tokenId: userInfo.tokenId.toString(),
    }
  }

  async getBalance(address: string): Promise<string> {
    this.ensureInitialized()

    if (!this.publicClient) throw new Error("Public client not initialized")

    const balance = await this.publicClient.getBalance({
      address: address as Address,
    })

    return formatEther(balance)
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    this.ensureInitialized()

    if (!this.publicClient) throw new Error("Public client not initialized")

    const ERC20_ABI = [
      {
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const

    const balance = await this.publicClient.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [userAddress as Address],
    })

    return formatEther(balance)
  }

  async sendETH(toUsername: string, amount: string): Promise<{ hash: Hash; wait: () => Promise<TransactionReceipt> }> {
    if (!this.walletClient) throw new Error("Wallet not connected")

    try {
      const value = parseEther(amount)
      const [account] = await this.walletClient.getAddresses()

      const hash = await this.walletClient.writeContract({
        address: CONTRACTS.TRANSACTION_MANAGER as Address,
        abi: TRANSACTION_ABI,
        functionName: "sendETH",
        args: [toUsername, value],
        value,
        account,
      })

      return {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    } catch (error) {
      console.error("Failed to send ETH:", error)
      throw error
    }
  }

  async sendERC20(
    toUsername: string,
    tokenAddress: string,
    amount: string,
  ): Promise<{ hash: Hash; wait: () => Promise<TransactionReceipt> }> {
    if (!this.walletClient) throw new Error("Wallet not connected")

    try {
      const parsedAmount = parseEther(amount)
      const [account] = await this.walletClient.getAddresses()

      const hash = await this.walletClient.writeContract({
        address: CONTRACTS.TRANSACTION_MANAGER as Address,
        abi: TRANSACTION_ABI,
        functionName: "sendERC20",
        args: [toUsername, tokenAddress as Address, parsedAmount],
        account,
      })

      return {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    } catch (error) {
      console.error("Failed to send ERC20:", error)
      throw error
    }
  }

  async getTokenURI(tokenId: string): Promise<string> {
    this.ensureInitialized()

    if (!this.publicClient) throw new Error("Public client not initialized")

    return await this.publicClient.readContract({
      address: CONTRACTS.PRIVIX_NFT as Address,
      abi: NFT_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })
  }

  async getUserNFTBalance(address: string): Promise<number> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return 0
      }

      const balance = await this.publicClient.readContract({
        address: CONTRACTS.PRIVIX_NFT as Address,
        abi: NFT_ABI,
        functionName: "balanceOf",
        args: [address as Address],
      })
      return Number(balance)
    } catch (error) {
      console.error("Failed to get NFT balance:", error)
      return 0
    }
  }

  // Event listeners
  async getRecentTransactions(address: string, limit = 10): Promise<any[]> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return []
      }

      // Get recent TransactionSent events
      const logs = await this.publicClient.getLogs({
        address: CONTRACTS.TRANSACTION_MANAGER as Address,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: false, name: "fromUsername", type: "string" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "toUsername", type: "string" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "token", type: "address" },
            { indexed: false, name: "isNative", type: "bool" },
          ],
          name: "TransactionSent",
          type: "event",
        },
        fromBlock: "earliest",
        toBlock: "latest",
      })

      // Filter events related to this address and limit results
      const userEvents = logs
        .filter(
          (log: any) =>
            log.args?.from?.toLowerCase() === address.toLowerCase() ||
            log.args?.to?.toLowerCase() === address.toLowerCase(),
        )
        .slice(-limit)
        .reverse()

      return userEvents.map((log: any) => ({
        hash: log.transactionHash,
        from: log.args?.from,
        fromUsername: log.args?.fromUsername,
        to: log.args?.to,
        toUsername: log.args?.toUsername,
        amount: formatEther(log.args?.amount || BigInt(0)),
        token: log.args?.token,
        isNative: log.args?.isNative,
        blockNumber: log.blockNumber,
        timestamp: new Date(),
      }))
    } catch (error) {
      console.error("Failed to get recent transactions:", error)
      return []
    }
  }

  async getMintingEvents(address?: string, limit = 10): Promise<any[]> {
    try {
      this.ensureInitialized()

      if (!this.publicClient) {
        console.warn("Public client not available")
        return []
      }

      // Get recent UsernameMinted events
      const logs = await this.publicClient.getLogs({
        address: CONTRACTS.PRIVIX_NFT as Address,
        event: {
          anonymous: false,
          inputs: [
            { indexed: true, name: "user", type: "address" },
            { indexed: false, name: "username", type: "string" },
            { indexed: false, name: "tokenId", type: "uint256" },
          ],
          name: "UsernameMinted",
          type: "event",
        },
        args: address ? { user: address as Address } : undefined,
        fromBlock: "earliest",
        toBlock: "latest",
      })

      return logs
        .slice(-limit)
        .reverse()
        .map((log: any) => ({
          hash: log.transactionHash,
          user: log.args?.user,
          username: log.args?.username,
          tokenId: log.args?.tokenId?.toString(),
          blockNumber: log.blockNumber,
          timestamp: new Date(),
        }))
    } catch (error) {
      console.error("Failed to get minting events:", error)
      return []
    }
  }
}

export const web3Service = new Web3Service()

// Add the enhanced web3 service class to the existing file
export class EnhancedWeb3Service {
  private publicClient: any = null
  private walletClient: any = null
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initializePublicClient()
    }
  }

  private initializePublicClient() {
    try {
      this.publicClient = createPublicClient({
        chain: privixChain,
        transport: http(PRIVIX_CHAIN.rpcUrl),
      })
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize enhanced public client:", error)
    }
  }

  // Check if token needs approval
  async checkTokenApproval(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string,
  ): Promise<{ needsApproval: boolean; currentAllowance: string }> {
    if (!this.publicClient) throw new Error("Public client not initialized")

    try {
      const ERC20_ABI = [
        {
          inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
          ],
          name: "allowance",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [{ name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
      ] as const

      // Read decimals and allowance directly using publicClient.readContract
      const [decimals, allowance] = await Promise.all([
        this.publicClient.readContract({
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
        this.publicClient.readContract({
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [ownerAddress as Address, spenderAddress as Address],
        }),
      ])

      const requiredAmount = parseEther(amount)
      const needsApproval = allowance < requiredAmount

      return {
        needsApproval,
        currentAllowance: formatEther(allowance),
      }
    } catch (error) {
      console.error("Failed to check token approval:", error)
      return { needsApproval: true, currentAllowance: "0" }
    }
  }

  // Approve token spending
  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
  ): Promise<{ hash: Hash; wait: () => Promise<TransactionReceipt> }> {
    if (!this.walletClient) throw new Error("Wallet not connected")

    try {
      const ERC20_ABI = [
        {
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as const

      const approvalAmount = parseEther(amount)
      const [account] = await this.walletClient.getAddresses()

      const hash = await this.walletClient.writeContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spenderAddress as Address, approvalAmount],
        account,
      })

      return {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    } catch (error) {
      console.error("Failed to approve token:", error)
      throw error
    }
  }

  // Enhanced send function with approval logic
  async sendTokenWithApproval(
    toUsername: string,
    tokenAddress: string,
    amount: string,
    isNative = false,
  ): Promise<{
    approvalTx?: { hash: Hash; wait: () => Promise<TransactionReceipt> }
    sendTx: { hash: Hash; wait: () => Promise<TransactionReceipt> }
  }> {
    if (!this.walletClient) throw new Error("Wallet not connected")

    const [account] = await this.walletClient.getAddresses()
    let approvalTx: { hash: Hash; wait: () => Promise<TransactionReceipt> } | undefined

    // If it's not native token, check and handle approval
    if (!isNative) {
      const { needsApproval } = await this.checkTokenApproval(
        tokenAddress,
        account,
        CONTRACTS.TRANSACTION_MANAGER,
        amount,
      )

      if (needsApproval) {
        approvalTx = await this.approveToken(tokenAddress, CONTRACTS.TRANSACTION_MANAGER, amount)
        // Wait for approval to complete
        await approvalTx.wait()
      }
    }

    // Now send the transaction
    let sendTx: { hash: Hash; wait: () => Promise<TransactionReceipt> }

    if (isNative) {
      // Send native token (ETH/PRIVIX)
      const value = parseEther(amount)
      const hash = await this.walletClient.writeContract({
        address: CONTRACTS.TRANSACTION_MANAGER as Address,
        abi: TRANSACTION_ABI,
        functionName: "sendETH",
        args: [toUsername, value],
        value,
        account,
      })

      sendTx = {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    } else {
      // Send ERC20 token
      const tokenAmount = parseEther(amount)

      const hash = await this.walletClient.writeContract({
        address: CONTRACTS.TRANSACTION_MANAGER as Address,
        abi: TRANSACTION_ABI,
        functionName: "sendERC20",
        args: [toUsername, tokenAddress as Address, tokenAmount],
        account,
      })

      sendTx = {
        hash,
        wait: async () => {
          return await this.publicClient.waitForTransactionReceipt({ hash })
        },
      }
    }

    return { approvalTx, sendTx }
  }
}

// Export enhanced service instance
export const enhancedWeb3Service = new EnhancedWeb3Service()
