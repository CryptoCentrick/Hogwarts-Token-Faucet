import { useState } from 'react'
import { useMint } from '../hooks/useMint'
import { ethers } from 'ethers'

interface MintTokenProps {
  signer: ethers.JsonRpcSigner | null
  ownerAddress: string | null
  connectedAddress: string | null
  onSuccess: () => void
}

export function MintToken({ signer, ownerAddress, connectedAddress, onSuccess }: MintTokenProps) {
  const { mint, status, error, txHash, reset } = useMint(signer)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const isOwner =
    ownerAddress &&
    connectedAddress &&
    ownerAddress.toLowerCase() === connectedAddress.toLowerCase()

  if (!isOwner) return null

  const handleMint = async () => {
    if (!to || !amount) return
    await mint(to, amount)
    onSuccess()
  }

  return (
    <section className="hf-card hf-card--accent">
      <div className="hf-cardHeader hf-cardHeader--split">
        <h2 className="hf-cardTitle">Mint Tokens</h2>
        <span className="hf-badge">Owner only</span>
      </div>

      <div className="hf-stack">
        <input
          type="text"
          placeholder="Recipient address (0x...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="hf-input"
        />
        <input
          type="number"
          placeholder="Amount (e.g. 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="hf-input"
        />

        <button
          onClick={handleMint}
          disabled={!to || !amount || status === 'loading'}
          type="button"
          className="hf-button hf-button--primary hf-button--block"
        >
          {status === 'loading' ? 'Minting...' : 'Mint'}
        </button>
      </div>

      {status === 'success' && txHash && (
        <div className="hf-tx">
          <p className="hf-txStatus hf-txStatus--success">
            ✓ Minted successfully
          </p>
          
           <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="hf-link"
          >
            View on Etherscan ↗
          </a>
          <button
            onClick={reset}
            type="button"
            className="hf-button hf-button--ghost hf-button--sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="hf-tx">
          <p className="hf-txStatus hf-txStatus--error">
            ✗ {error ?? 'Mint failed'}
          </p>
          <button
            onClick={reset}
            type="button"
            className="hf-button hf-button--ghost hf-button--sm"
          >
            Try Again
          </button>
        </div>
      )}
    </section>
  )
}
