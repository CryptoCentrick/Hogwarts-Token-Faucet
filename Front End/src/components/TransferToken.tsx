import { useState } from 'react'
import { useTransfer } from '../hooks/useTransfer'
import { ethers } from 'ethers'

interface TransferTokenProps {
  signer: ethers.JsonRpcSigner | null
  onSuccess: () => void
}

export function TransferToken({ signer, onSuccess }: TransferTokenProps) {
  const { transfer, status, error, txHash, reset } = useTransfer(signer)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const handleTransfer = async () => {
    if (!to || !amount) return
    await transfer(to, amount)
    onSuccess()
  }

  return (
    <section className="hf-card">
      <div className="hf-cardHeader">
        <h2 className="hf-cardTitle">Transfer</h2>
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
          placeholder="Amount (e.g. 50)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="hf-input"
        />

        <button
          onClick={handleTransfer}
          disabled={!signer || !to || !amount || status === 'loading'}
          type="button"
          className="hf-button hf-button--info hf-button--block"
        >
          {status === 'loading' ? 'Sending...' : 'Send Tokens'}
        </button>
      </div>

      {status === 'success' && txHash && (
        <div className="hf-tx">
          <p className="hf-txStatus hf-txStatus--success">
            ✓ Transfer successful
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
            ✗ {error ?? 'Transfer failed'}
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
