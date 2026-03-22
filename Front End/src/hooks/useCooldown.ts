import { useState, useEffect, useCallback } from 'react'
import { ethers, Contract } from 'ethers'
import type { CooldownState } from '../types'
import { FAUCET_TOKEN_ABI } from '../constants/abi'
import { FAUCET_TOKEN_ADDRESS } from '../constants/address'

export function useCooldown(
  provider: ethers.BrowserProvider | null,
  address: string | null
) {
  const [cooldown, setCooldown] = useState<CooldownState>({
    remainingSeconds: 0,
    isOnCooldown: false,
  })

  const fetchCooldown = useCallback(async () => {
    if (!provider || !address) {
      setCooldown({ remainingSeconds: 0, isOnCooldown: false })
      return
    }

    try {
      const contract = new Contract(
        FAUCET_TOKEN_ADDRESS,
        FAUCET_TOKEN_ABI,
        provider
      )

      const remaining = await contract.getRemainingCooldown(address)
      const remainingSeconds = Number(remaining)

      setCooldown({
        remainingSeconds,
        isOnCooldown: remainingSeconds > 0,
      })
    } catch (err) {
      console.error('Failed to fetch cooldown:', err)
    }
  }, [provider, address])

  useEffect(() => {
    fetchCooldown()
  }, [fetchCooldown])

  useEffect(() => {
    if (!cooldown.isOnCooldown) return

    const interval = setInterval(() => {
      setCooldown((prev) => {
        const newSeconds = prev.remainingSeconds - 1
        if (newSeconds <= 0) {
          clearInterval(interval)
          return { remainingSeconds: 0, isOnCooldown: false }
        }
        return { remainingSeconds: newSeconds, isOnCooldown: true }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldown.isOnCooldown])

  return { ...cooldown, refetch: fetchCooldown }
}