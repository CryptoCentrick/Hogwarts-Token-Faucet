import { useState, useEffect } from 'react'
import { ethers, Contract } from 'ethers'
import { useWallet } from './hooks/useWallet'
import { useTokenInfo } from './hooks/useTokenInfo'
import { useCooldown } from './hooks/useCooldown'
import { useRequestToken } from './hooks/useRequestToken'
import { useMint } from './hooks/useMint'
import { useTransfer } from './hooks/useTransfer'
import { CooldownTimer } from './components/CooldownTimer'
import { FAUCET_TOKEN_ABI } from './constants/abi'
import { FAUCET_TOKEN_ADDRESS, TOKEN_DISPLAY_NAME, TOKEN_DISPLAY_SYMBOL } from './constants/address'

type Page = 'home' | 'faucet' | 'portfolio' | 'admin'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const { address, isConnected, provider, signer, connect, disconnect } = useWallet()
  const { tokenInfo, refetch: refetchTokenInfo } = useTokenInfo(provider, address)
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)

  useEffect(() => {
    if (!provider) return
    const fetchOwner = async () => {
      try {
        const contract = new Contract(FAUCET_TOKEN_ADDRESS, FAUCET_TOKEN_ABI, provider)
        const owner = await contract.owner()
        setOwnerAddress(owner)
      } catch (err) {
        console.error('Failed to fetch owner:', err)
      }
    }
    fetchOwner()
  }, [provider])

  const isOwner =
    !!ownerAddress &&
    !!address &&
    ownerAddress.toLowerCase() === address.toLowerCase()

  const navItems: { label: string; key: Page }[] = [
    { label: 'Home', key: 'home' },
    { label: 'Faucet', key: 'faucet' },
    { label: 'Portfolio', key: 'portfolio' },
    ...(isOwner ? [{ label: 'Admin', key: 'admin' as Page }] : []),
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020617',
      fontFamily: "'Courier New', monospace",
      color: '#e2e8f0',
    }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1e293b',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0a1628',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <span style={{
            color: '#a78bfa',
            fontFamily: "'Courier New', monospace",
            fontSize: '1.1rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
          }}>
            ⚡ {TOKEN_DISPLAY_NAME}
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {navItems.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                background: page === key ? '#1e293b' : 'transparent',
                border: page === key ? '1px solid #334155' : '1px solid transparent',
                color: page === key ? '#a78bfa' : '#64748b',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}

          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#ef4444',
              boxShadow: isConnected ? '0 0 6px #22c55e' : 'none',
            }} />
            {isConnected && address ? (
              <>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#64748b',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                style={{
                  background: '#a78bfa',
                  border: 'none',
                  color: '#0f0a1e',
                  padding: '7px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: '0.05em',
                }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main style={{ paddingBottom: '80px' }}>
        {page === 'home' && (
          <HomePage
            isConnected={isConnected}
            onConnect={connect}
            onGoToFaucet={() => setPage('faucet')}
            onGoToPortfolio={() => setPage('portfolio')}
            tokenDisplayName={TOKEN_DISPLAY_NAME}
            tokenDisplaySymbol={TOKEN_DISPLAY_SYMBOL}
          />
        )}
        {page === 'faucet' && (
          <FaucetPage
            signer={signer}
            provider={provider}
            address={address}
            isConnected={isConnected}
            onConnect={connect}
            onSuccess={refetchTokenInfo}
            tokenDisplaySymbol={TOKEN_DISPLAY_SYMBOL}
          />
        )}
        {page === 'portfolio' && (
          <PortfolioPage
            address={address}
            signer={signer}
            isConnected={isConnected}
            onConnect={connect}
            tokenInfo={tokenInfo}
            onSuccess={refetchTokenInfo}
            tokenDisplaySymbol={TOKEN_DISPLAY_SYMBOL}
          />
        )}
        {page === 'admin' && isOwner && (
          <AdminPage
            signer={signer}
            isOwner={isOwner}
            ownerAddress={ownerAddress}
            onSuccess={refetchTokenInfo}
            tokenDisplaySymbol={TOKEN_DISPLAY_SYMBOL}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e293b',
        padding: '14px 32px',
        textAlign: 'center',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#0a1628',
        boxSizing: 'border-box',
      }}>
        <p style={{
          color: '#1e293b',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          margin: 0,
        }}>
          CONTRACT: {FAUCET_TOKEN_ADDRESS} · LISK SEPOLIA TESTNET
        </p>
      </footer>
    </div>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────────

function HomePage({
  isConnected,
  onConnect,
  onGoToFaucet,
  onGoToPortfolio,
  tokenDisplayName,
  tokenDisplaySymbol,
}: {
  isConnected: boolean
  onConnect: () => void
  onGoToFaucet: () => void
  onGoToPortfolio: () => void
  tokenDisplayName: string
  tokenDisplaySymbol: string
}) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '16px',
          filter: 'drop-shadow(0 0 20px #a78bfa)',
        }}>
          ⚡
        </div>
        <h1 style={{
          color: '#a78bfa',
          fontSize: '2.2rem',
          letterSpacing: '0.08em',
          margin: '0 0 12px 0',
          fontFamily: "'Courier New', monospace",
        }}>
          {tokenDisplayName}
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          margin: '0 0 8px 0',
          lineHeight: '1.7',
          maxWidth: '520px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          A testnet ERC20 token on Lisk Sepolia. Claim {tokenDisplaySymbol} from the
          faucet every 24 hours, transfer tokens to others, and explore
          on-chain interactions — all from your browser.
        </p>
        <p style={{
          color: '#334155',
          fontSize: '0.78rem',
          letterSpacing: '0.05em',
          margin: '0',
        }}>
          100 {tokenDisplaySymbol} per claim · 24hr cooldown · 10,000,000 max supply
        </p>

        {!isConnected && (
          <button
            onClick={onConnect}
            style={{
              marginTop: '32px',
              background: '#a78bfa',
              border: 'none',
              color: '#0f0a1e',
              padding: '14px 40px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
            }}
          >
            Connect Wallet to Begin
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {[
          {
            icon: '🪄',
            title: 'Faucet',
            desc: `Claim 100 ${tokenDisplaySymbol} every 24 hours. Cooldown is tracked per wallet.`,
            action: 'Go to Faucet',
            onClick: onGoToFaucet,
            color: '#22c55e',
          },
          {
            icon: '💼',
            title: 'Portfolio',
            desc: 'View your token balance and transfer tokens to any wallet.',
            action: 'View Portfolio',
            onClick: onGoToPortfolio,
            color: '#3b82f6',
          },
          {
            icon: '📊',
            title: 'Stats',
            desc: `${tokenDisplaySymbol} has a fixed max supply of 10,000,000 tokens on Lisk Sepolia testnet.`,
            action: null,
            onClick: null,
            color: '#a78bfa',
          },
        ].map(({ icon, title, desc, action, onClick, color }) => (
          <div
            key={title}
            style={{
              background: '#0f172a',
              border: `1px solid #1e293b`,
              borderTop: `2px solid ${color}`,
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
            <h3 style={{
              color: color,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 8px 0',
            }}>
              {title}
            </h3>
            <p style={{
              color: '#475569',
              fontSize: '0.78rem',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
            }}>
              {desc}
            </p>
            {action && onClick && (
              <button
                onClick={onClick}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color}`,
                  color: color,
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                {action} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FAUCET PAGE ─────────────────────────────────────────────────

function FaucetPage({
  signer,
  provider,
  address,
  isConnected,
  onConnect,
  onSuccess,
  tokenDisplaySymbol,
}: {
  signer: ethers.JsonRpcSigner | null
  provider: ethers.BrowserProvider | null
  address: string | null
  isConnected: boolean
  onConnect: () => void
  onSuccess: () => void
  tokenDisplaySymbol: string
}) {
  const { requestToken, status, error: txError, txHash, reset } = useRequestToken(signer)
  const { remainingSeconds, isOnCooldown, refetch: refetchCooldown } = useCooldown(provider, address)

  const handleRequest = async () => {
    await requestToken()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await refetchCooldown()
    await onSuccess()
  }

  const buttonDisabled = !signer || status === 'loading' || isOnCooldown

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
      <h2 style={{
        color: '#22c55e',
        fontSize: '0.85rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        margin: '0 0 4px 0',
      }}>
        Token Faucet
      </h2>
      <p style={{ color: '#334155', fontSize: '0.78rem', margin: '0 0 32px 0' }}>
        One claim per wallet every 24 hours
      </p>

      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '28px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          marginBottom: '24px',
        }}>
          <span style={{ color: '#22c55e', fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>
            100
          </span>
          <span style={{ color: '#64748b', fontSize: '1.2rem', letterSpacing: '0.1em' }}>
            {tokenDisplaySymbol}
          </span>
          <span style={{ color: '#334155', fontSize: '0.8rem', marginLeft: '4px' }}>
            per claim
          </span>
        </div>

        {!isConnected ? (
          <button
            onClick={onConnect}
            style={{
              background: '#a78bfa',
              border: 'none',
              color: '#0f0a1e',
              padding: '12px 28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.875rem',
              width: '100%',
              letterSpacing: '0.05em',
            }}
          >
            Connect Wallet First
          </button>
        ) : isOnCooldown ? (
          <div>
            <p style={{ color: '#475569', fontSize: '0.8rem', margin: '0 0 10px 0' }}>
              You already claimed. Come back in:
            </p>
            <CooldownTimer remainingSeconds={remainingSeconds} />
          </div>
        ) : (
          <button
            onClick={handleRequest}
            disabled={buttonDisabled}
            style={{
              background: buttonDisabled ? '#1e293b' : '#22c55e',
              border: 'none',
              color: buttonDisabled ? '#475569' : '#0f172a',
              padding: '12px 28px',
              borderRadius: '6px',
              cursor: buttonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.875rem',
              width: '100%',
              letterSpacing: '0.05em',
            }}
          >
            {status === 'loading' ? 'Claiming...' : `Claim 100 ${tokenDisplaySymbol}`}
          </button>
        )}

        {isConnected && address && (
          <p style={{ color: '#1e293b', fontSize: '0.72rem', margin: '12px 0 0 0', letterSpacing: '0.03em' }}>
            Wallet: {address.slice(0, 10)}...{address.slice(-6)}
          </p>
        )}

        {status === 'success' && txHash && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#052e16',
            border: '1px solid #166534',
            borderRadius: '6px',
          }}>
            <p style={{ color: '#22c55e', fontSize: '0.82rem', margin: '0 0 6px 0' }}>
              ✓ 100 {tokenDisplaySymbol} claimed successfully
            </p>

            <a
              href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#3b82f6', fontSize: '0.75rem' }}
            >
              View on Blockscout ↗
            </a>
            <button onClick={reset} style={{
              display: 'block', marginTop: '8px', background: 'transparent',
              border: '1px solid #166534', color: '#475569', padding: '3px 10px',
              borderRadius: '4px', cursor: 'pointer', fontFamily: "'Courier New', monospace",
              fontSize: '0.72rem',
            }}>
              Dismiss
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#1c0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '6px',
          }}>
            <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0 0 6px 0' }}>
              ✗ {txError ?? 'Transaction failed'}
            </p>
            <button onClick={reset} style={{
              background: 'transparent', border: '1px solid #7f1d1d',
              color: '#475569', padding: '3px 10px', borderRadius: '4px',
              cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: '0.72rem',
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────

function PortfolioPage({
  address,
  signer,
  isConnected,
  onConnect,
  tokenInfo,
  onSuccess,
  tokenDisplaySymbol,
}: {
  address: string | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  onConnect: () => void
  tokenInfo: {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    maxSupply: string
    userBalance: string
  }
  onSuccess: () => void
  tokenDisplaySymbol: string
}) {
  const { transfer, status, error: transferError, txHash, reset } = useTransfer(signer)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const handleTransfer = async () => {
    if (!to || !amount) return
    await transfer(to, amount)
    onSuccess()
    setTo('')
    setAmount('')
  }

  const buttonDisabled = !signer || !to || !amount || status === 'loading'

  const inputStyle: React.CSSProperties = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#e2e8f0',
    padding: '10px 12px',
    borderRadius: '6px',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const supplyPercent = tokenInfo.maxSupply && tokenInfo.totalSupply
    ? ((Number(tokenInfo.totalSupply) / Number(tokenInfo.maxSupply)) * 100).toFixed(2)
    : '0'

  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
      }}>
        <p style={{ color: '#475569', fontSize: '0.875rem' }}>
          Connect your wallet to view your portfolio
        </p>
        <button
          onClick={onConnect}
          style={{
            background: '#a78bfa',
            border: 'none',
            color: '#0f0a1e',
            padding: '10px 28px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '700',
            fontFamily: "'Courier New', monospace",
            fontSize: '0.875rem',
          }}
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h2 style={{
        color: '#3b82f6',
        fontSize: '0.85rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        margin: '0 0 4px 0',
      }}>
        Portfolio
      </h2>
      <p style={{ color: '#334155', fontSize: '0.78rem', margin: '0 0 32px 0' }}>
        {address?.slice(0, 10)}...{address?.slice(-6)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderTop: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '24px',
          gridColumn: '1 / -1',
        }}>
          <p style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            Your Balance
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ color: '#e2e8f0', fontSize: '2.5rem', fontWeight: '700', lineHeight: 1 }}>
              {Number(tokenInfo.userBalance).toLocaleString()}
            </span>
            <span style={{ color: '#64748b', fontSize: '1rem', letterSpacing: '0.1em' }}>
              {tokenDisplaySymbol}
            </span>
          </div>
        </div>

        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <p style={{ color: '#475569', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
            Supply Info
          </p>
          {[
            { label: 'Total Supply', value: `${Number(tokenInfo.totalSupply).toLocaleString()} ${tokenDisplaySymbol}` },
            { label: 'Max Supply', value: `10,000,000 ${tokenDisplaySymbol}` },
            { label: 'Minted', value: `${supplyPercent}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #0f172a',
            }}>
              <span style={{ color: '#475569', fontSize: '0.78rem' }}>{label}</span>
              <span style={{ color: '#a78bfa', fontSize: '0.78rem' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <p style={{ color: '#475569', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
            Transfer Tokens
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Recipient (0x...)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => setAmount(tokenInfo.userBalance)}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#64748b',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Max
              </button>
            </div>
            <button
              onClick={handleTransfer}
              disabled={buttonDisabled}
              style={{
                background: buttonDisabled ? '#1e293b' : '#3b82f6',
                border: 'none',
                color: buttonDisabled ? '#475569' : '#fff',
                padding: '10px',
                borderRadius: '6px',
                cursor: buttonDisabled ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Tokens'}
            </button>
          </div>

          {status === 'success' && txHash && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ color: '#22c55e', fontSize: '0.8rem', margin: '0 0 4px 0' }}>
                ✓ Transfer successful
              </p>

              <a
                href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#3b82f6', fontSize: '0.75rem' }}
              >
                View on Blockscout ↗
              </a>
              <button onClick={reset} style={{
                display: 'block', marginTop: '6px', background: 'transparent',
                border: '1px solid #334155', color: '#475569', padding: '3px 10px',
                borderRadius: '4px', cursor: 'pointer', fontFamily: "'Courier New', monospace",
                fontSize: '0.72rem',
              }}>
                Dismiss
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 6px 0' }}>
                ✗ {transferError ?? 'Transfer failed'}
              </p>
              <button onClick={reset} style={{
                background: 'transparent', border: '1px solid #7f1d1d',
                color: '#475569', padding: '3px 10px', borderRadius: '4px',
                cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: '0.72rem',
              }}>
                Try Again
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────

function AdminPage({
  signer,
  isOwner,
  ownerAddress,
  onSuccess,
  tokenDisplaySymbol,
}: {
  signer: ethers.JsonRpcSigner | null
  isOwner: boolean
  ownerAddress: string | null
  onSuccess: () => void
  tokenDisplaySymbol: string
}) {
  const { mint, status, error: mintError, txHash, reset } = useMint(signer)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const handleMint = async () => {
    if (!to || !amount) return
    await mint(to, amount)
    onSuccess()
    setTo('')
    setAmount('')
  }

  const buttonDisabled = !to || !amount || status === 'loading'

  const inputStyle: React.CSSProperties = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#e2e8f0',
    padding: '10px 12px',
    borderRadius: '6px',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  }

  if (!isOwner) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <p style={{ color: '#475569', fontSize: '0.875rem' }}>
          Access denied. Owner only.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '48px 24px' }}>
      <h2 style={{
        color: '#7c3aed',
        fontSize: '0.85rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        margin: '0 0 4px 0',
      }}>
        Admin Panel
      </h2>
      <p style={{ color: '#334155', fontSize: '0.78rem', margin: '0 0 4px 0' }}>
        Owner: {ownerAddress?.slice(0, 10)}...{ownerAddress?.slice(-6)}
      </p>
      <p style={{ color: '#1e293b', fontSize: '0.72rem', margin: '0 0 32px 0' }}>
        Minting is subject to the 10,000,000 {tokenDisplaySymbol} max supply
      </p>

      <div style={{
        background: '#0f172a',
        border: '1px solid #7c3aed',
        borderRadius: '10px',
        padding: '28px',
      }}>
        <p style={{
          color: '#7c3aed',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 20px 0',
        }}>
          Mint Tokens
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#475569', fontSize: '0.72rem', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              RECIPIENT ADDRESS
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ color: '#475569', fontSize: '0.72rem', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              AMOUNT ({tokenDisplaySymbol})
            </label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleMint}
            disabled={buttonDisabled}
            style={{
              background: buttonDisabled ? '#1e293b' : '#7c3aed',
              border: 'none',
              color: buttonDisabled ? '#475569' : '#fff',
              padding: '12px',
              borderRadius: '6px',
              cursor: buttonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              marginTop: '4px',
            }}
          >
            {status === 'loading' ? 'Minting...' : `Mint ${tokenDisplaySymbol}`}
          </button>
        </div>

        {status === 'success' && txHash && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#0d1117',
            border: '1px solid #1e1b4b',
            borderRadius: '6px',
          }}>
            <p style={{ color: '#22c55e', fontSize: '0.82rem', margin: '0 0 6px 0' }}>
              ✓ Tokens minted successfully
            </p>

            <a
              href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#3b82f6', fontSize: '0.75rem' }}
            >
              View on Blockscout ↗
            </a>
            <button onClick={reset} style={{
              display: 'block', marginTop: '8px', background: 'transparent',
              border: '1px solid #334155', color: '#475569', padding: '3px 10px',
              borderRadius: '4px', cursor: 'pointer', fontFamily: "'Courier New', monospace",
              fontSize: '0.72rem',
            }}>
              Dismiss
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#1c0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '6px',
          }}>
            <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0 0 6px 0' }}>
              ✗ {mintError ?? 'Mint failed'}
            </p>
            <button onClick={reset} style={{
              background: 'transparent', border: '1px solid #7f1d1d',
              color: '#475569', padding: '3px 10px', borderRadius: '4px',
              cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: '0.72rem',
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
