import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKit,
  useDisconnect,
} from '@reown/appkit/react'
import type { WalletState } from '../types'

export function useWallet() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const { open } = useAppKit()
  const { disconnect: appKitDisconnect } = useDisconnect()

  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    provider: null,
    signer: null,
  })

  useEffect(() => {
    const setupProvider = async () => {
      if (!isConnected || !walletProvider || !address) {
        setWalletState({
          address: null,
          isConnected: false,
          provider: null,
          signer: null,
        })
        return
      }
      try {
        const provider = new BrowserProvider(walletProvider as any)
        const signer = await provider.getSigner()
        setWalletState({
          address,
          isConnected: true,
          provider,
          signer,
        })
      } catch (err) {
        console.error('Failed to setup provider:', err)
      }
    }
    setupProvider()
  }, [isConnected, walletProvider, address])

  const connect = () => open()
  const disconnect = () => appKitDisconnect()

  return { ...walletState, connect, disconnect }
}