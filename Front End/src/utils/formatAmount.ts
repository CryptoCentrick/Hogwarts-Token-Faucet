import { ethers } from 'ethers'

export function formatAmount(value: bigint, decimals: number = 18): string {
  return ethers.formatUnits(value, decimals)
}