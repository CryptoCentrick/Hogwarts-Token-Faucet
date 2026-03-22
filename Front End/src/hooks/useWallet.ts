import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import type { WalletState } from '../types'

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    provider: null,
    signer: null,
  })

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask.')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setWalletState({
        address,
        isConnected: true,
        provider,
        signer,
      })
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      provider: null,
      signer: null,
    })
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        connect()
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [connect, disconnect])

  return { ...walletState, connect, disconnect }
}