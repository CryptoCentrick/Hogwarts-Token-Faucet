import { ethers } from 'ethers'

export interface WalletState {
  address: string | null
  isConnected: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  userBalance: string
}

export type TxStatus = 'idle' | 'loading' | 'success' | 'error'

export interface CooldownState {
  remainingSeconds: number
  isOnCooldown: boolean
}