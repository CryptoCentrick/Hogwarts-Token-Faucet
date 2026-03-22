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
    <div className="hf-wallet" aria-label="Wallet">
      <div
        className="hf-walletStatus"
        aria-label={isConnected ? 'Connected' : 'Disconnected'}
        data-connected={isConnected ? 'true' : 'false'}
      />

      {isConnected && address ? (
        <>
          <span className="hf-walletAddress">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            type="button"
            onClick={onDisconnect}
            className="hf-button hf-button--secondary"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="hf-button hf-button--primary"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
