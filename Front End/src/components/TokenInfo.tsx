import { useTokenInfo } from '../hooks/useTokenInfo'
import { ethers } from 'ethers'

interface TokenInfoProps {
  provider: ethers.BrowserProvider | null
  address: string | null
}

export function TokenInfo({ provider, address }: TokenInfoProps) {
  const { tokenInfo, isLoading, error } = useTokenInfo(provider, address)

  const formatTokenAmount = (value: string) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return value
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }

  const symbolSuffix = tokenInfo.symbol ? ` ${tokenInfo.symbol}` : ''

  const rows = [
    { label: 'Token Name', value: tokenInfo.name || '—' },
    { label: 'Symbol', value: tokenInfo.symbol || '—' },
    { label: 'Decimals', value: tokenInfo.decimals.toString() },
    {
      label: 'Total Supply',
      value: tokenInfo.totalSupply
        ? `${formatTokenAmount(tokenInfo.totalSupply)}${symbolSuffix}`
        : '—',
    },
    {
      label: 'Max Supply',
      value: tokenInfo.maxSupply
        ? `${formatTokenAmount(tokenInfo.maxSupply)}${symbolSuffix}`
        : '—',
    },
    {
      label: 'Your Balance',
      value: tokenInfo.userBalance
        ? `${formatTokenAmount(tokenInfo.userBalance)}${symbolSuffix}`
        : '—',
    },
  ]

  return (
    <section className="hf-card">
      <div className="hf-cardHeader">
        <h2 className="hf-cardTitle">Token Info</h2>
      </div>

      {isLoading && (
        <p className="hf-muted">Loading...</p>
      )}

      {error && (
        <p className="hf-error">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="hf-kvList">
          {rows.map(({ label, value }) => (
            <div key={label} className="hf-kvRow">
              <span className="hf-kvLabel">{label}</span>
              <span className="hf-kvValue">{value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
