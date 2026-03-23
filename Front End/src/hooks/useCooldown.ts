import { useState, useEffect, useCallback, useRef } from 'react'
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startCountdown = (seconds: number) => {
    stopInterval()
    let remaining = seconds

    intervalRef.current = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        stopInterval()
        setCooldown({ remainingSeconds: 0, isOnCooldown: false })
      } else {
        setCooldown({ remainingSeconds: remaining, isOnCooldown: true })
      }
    }, 1000)
  }

  const fetchCooldown = useCallback(async () => {
    if (!provider || !address) {
      stopInterval()
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

      if (remainingSeconds > 0) {
        setCooldown({ remainingSeconds, isOnCooldown: true })
        startCountdown(remainingSeconds)
      } else {
        stopInterval()
        setCooldown({ remainingSeconds: 0, isOnCooldown: false })
      }
    } catch (err) {
      console.error('Failed to fetch cooldown:', err)
    }
  }, [provider, address])

  useEffect(() => {
    fetchCooldown()
    return () => stopInterval()
  }, [fetchCooldown])

  return { ...cooldown, refetch: fetchCooldown }
}