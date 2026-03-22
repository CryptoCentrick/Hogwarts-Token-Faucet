import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { Contract } from 'ethers'
import type { TokenInfo } from '../types'
import { FAUCET_TOKEN_ABI } from '../constants/abi'
import { FAUCET_TOKEN_ADDRESS } from '../constants/address'
import { formatAmount } from '../utils/formatAmount'

export function useTokenInfo(
  provider: ethers.BrowserProvider | null,
  address: string | null
) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '0',
    maxSupply: '0',
    userBalance: '0',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokenInfo = useCallback(async () => {
    if (!provider) return

    try {
      setIsLoading(true)
      setError(null)

      const contract = new Contract(
        FAUCET_TOKEN_ADDRESS,
        FAUCET_TOKEN_ABI,
        provider
      )

      const [name, symbol, decimals, totalSupply, maxSupply] =
        await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
          contract.MAX_SUPPLY(),
        ])

      const userBalance = address
        ? await contract.balanceOf(address)
        : BigInt(0)

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: formatAmount(totalSupply),
        maxSupply: formatAmount(maxSupply),
        userBalance: formatAmount(userBalance),
      })
    } catch (err) {
      setError('Failed to fetch token info')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [provider, address])

  useEffect(() => {
    fetchTokenInfo()
  }, [fetchTokenInfo])

  return { tokenInfo, isLoading, error, refetch: fetchTokenInfo }
}