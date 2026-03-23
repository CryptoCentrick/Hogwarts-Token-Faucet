interface WalletConnectProps {
  address: string | null
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnect({
  address,
  isConnected,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '10px',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isConnected ? '#22c55e' : '#ef4444',
        boxShadow: isConnected ? '0 0 8px #22c55e' : 'none',
      }} />

      {isConnected && address ? (
        <>
          <span style={{
            fontFamily: "'Courier New', monospace",
            color: '#94a3b8',
            fontSize: '0.85rem',
          }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button onClick={onDisconnect} style={{
            background: 'transparent',
            border: '1px solid #334155',
            color: '#94a3b8',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: "'Courier New', monospace",
          }}>
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={onConnect} style={{
          background: '#22c55e',
          border: 'none',
          color: '#0f172a',
          padding: '8px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '0.875rem',
          fontFamily: "'Courier New', monospace",
          letterSpacing: '0.05em',
        }}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}