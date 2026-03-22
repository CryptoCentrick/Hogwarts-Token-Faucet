import './App.css'
import { WalletConnect } from './components/WalletConnect'
import { TokenInfo } from './components/TokenInfo'
import { RequestToken } from './components/RequestToken'
import { TransferToken } from './components/TransferToken'
import { MintToken } from './components/MintToken'
import heroImg from './assets/hero.png'
import { useWallet } from './hooks/useWallet'
import { useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { FAUCET_TOKEN_ABI } from './constants/abi'
import { FAUCET_TOKEN_ADDRESS } from './constants/address'
import { formatAmount } from './utils/formatAmount'
import { formatTime } from './utils/formatTime'

function App() {
  const { address, isConnected, provider, signer, connect, disconnect } =
    useWallet()

  const [refreshNonce, setRefreshNonce] = useState(0)
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null)
  const [faucetAmount, setFaucetAmount] = useState<string | null>(null)
  const [faucetCooldownSeconds, setFaucetCooldownSeconds] = useState<
    number | null
  >(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFaucetDetails() {
      if (!provider) {
        setOwnerAddress(null)
        setTokenSymbol(null)
        setFaucetAmount(null)
        setFaucetCooldownSeconds(null)
        setChainId(null)
        setNetworkName(null)
        return
      }

      try {
        const contract = new Contract(
          FAUCET_TOKEN_ADDRESS,
          FAUCET_TOKEN_ABI,
          provider
        )

        const [network, owner, symbol, faucetAmountRaw, cooldownRaw] =
          await Promise.all([
            provider.getNetwork(),
            contract.owner(),
            contract.symbol(),
            contract.FAUCET_AMOUNT(),
            contract.FAUCET_COOLDOWN(),
          ])

        if (cancelled) return

        setOwnerAddress(owner)
        setTokenSymbol(symbol)
        setFaucetAmount(formatAmount(faucetAmountRaw))
        setFaucetCooldownSeconds(Number(cooldownRaw))
        setChainId(Number(network.chainId))
        setNetworkName(network.name ?? null)
      } catch (err) {
        console.error('Failed to fetch faucet details:', err)
      }
    }

    loadFaucetDetails()

    return () => {
      cancelled = true
    }
  }, [provider])

  const faucetRule = useMemo(() => {
    if (!faucetAmount || faucetCooldownSeconds == null) {
      return 'Connect wallet to load faucet details'
    }

    const amountNum = Number(faucetAmount)
    const amountLabel = Number.isFinite(amountNum)
      ? amountNum.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : faucetAmount
    const symbolSuffix = tokenSymbol ? ` ${tokenSymbol}` : ''
    return `Claim ${amountLabel}${symbolSuffix} every ${formatTime(
      faucetCooldownSeconds
    )}`
  }, [faucetAmount, faucetCooldownSeconds, tokenSymbol])

  const isWrongNetwork = chainId != null && chainId !== 11155111

  const onTxSuccess = () => {
    setRefreshNonce((n) => n + 1)
  }

  const contractHref = `https://sepolia.etherscan.io/address/${FAUCET_TOKEN_ADDRESS}`
  const contractLabel = `${FAUCET_TOKEN_ADDRESS.slice(
    0,
    6
  )}...${FAUCET_TOKEN_ADDRESS.slice(-4)}`

  return (
    <div className="hf-app">
      <div className="hf-shell">
        <header className="hf-header">
          <div className="hf-brand">
            <div className="hf-brandTitle">Hogwarts Token Faucet</div>
            <div className="hf-brandSubtitle">
              Get test tokens, then practise your spells on Sepolia
            </div>
          </div>

          <div className="hf-headerRight">
            <WalletConnect
              address={address}
              isConnected={isConnected}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>
        </header>

        <main className="hf-main">
          <section className="hf-heroCard">
            <div className="hf-heroText">
              <h1 className="hf-heroTitle">Hogwarts Token Faucet</h1>
              <p className="hf-heroLead">
                {isConnected
                  ? 'Request tokens, transfer to friends, and track your balance.'
                  : 'Connect your wallet to request tokens from the faucet.'}
              </p>

              <div className="hf-heroMeta">
                <div className="hf-metaItem">
                  <span className="hf-metaLabel">Token contract</span>
                  <a
                    className="hf-metaValue hf-link"
                    href={contractHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contractLabel}
                  </a>
                </div>
                <div className="hf-metaItem">
                  <span className="hf-metaLabel">Network</span>
                  <span className="hf-metaValue">
                    {networkName ? `${networkName} (${chainId ?? '—'})` : '—'}
                  </span>
                </div>
                <div className="hf-metaItem">
                  <span className="hf-metaLabel">Faucet rule</span>
                  <span className="hf-metaValue">{faucetRule}</span>
                </div>
              </div>

              {!isConnected && (
                <div className="hf-alert hf-alert--info">
                  Tip: click <strong>Connect Wallet</strong> (top right) to load
                  your balance and enable the faucet actions.
                </div>
              )}

              {isWrongNetwork && (
                <div className="hf-alert hf-alert--warning">
                  Wrong network detected. Switch to <strong>Sepolia</strong> to
                  use this faucet.
                </div>
              )}
            </div>

            <img
              className="hf-heroImage"
              src={heroImg}
              alt=""
              aria-hidden="true"
            />
          </section>

          <section className="hf-grid">
            <TokenInfo
              key={`token-info-${refreshNonce}`}
              provider={provider}
              address={address}
            />

            <RequestToken
              signer={signer}
              provider={provider}
              address={address}
              onSuccess={onTxSuccess}
              description={faucetRule}
            />

            <TransferToken signer={signer} onSuccess={onTxSuccess} />

            <MintToken
              signer={signer}
              ownerAddress={ownerAddress}
              connectedAddress={address}
              onSuccess={onTxSuccess}
            />
          </section>
        </main>

        <footer className="hf-footer">
          <span className="hf-footerText">
            Built for local testing • Always verify the contract address before
            signing transactions
          </span>
        </footer>
      </div>
    </div>
  )
}

export default App
