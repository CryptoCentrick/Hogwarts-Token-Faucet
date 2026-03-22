import { useState, useCallback } from 'react'
import { ethers, Contract } from 'ethers'
import type { TxStatus } from '../types'
import { FAUCET_TOKEN_ABI } from '../constants/abi'
import { FAUCET_TOKEN_ADDRESS } from '../constants/address'

export function useMint(signer: ethers.JsonRpcSigner | null) {
  const [status, setStatus] = useState<TxStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const mint = useCallback(
    async (to: string, amount: string) => {
      if (!signer) return

      try {
        setStatus('loading')
        setError(null)

        const contract = new Contract(
          FAUCET_TOKEN_ADDRESS,
          FAUCET_TOKEN_ABI,
          signer
        )

        const parsedAmount = ethers.parseUnits(amount, 18)
        const tx = await contract.mint(to, parsedAmount)
        setTxHash(tx.hash)
        await tx.wait()

        setStatus('success')
      } catch (err: any) {
        setStatus('error')
        setError(err?.reason ?? err?.message ?? 'Mint failed')
      }
    },
    [signer]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setTxHash(null)
  }, [])

  return { mint, status, error, txHash, reset }
}