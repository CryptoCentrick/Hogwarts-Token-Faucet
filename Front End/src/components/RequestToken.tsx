import { useRequestToken } from '../hooks/useRequestToken'
import { useCooldown } from '../hooks/useCooldown'
import { CooldownTimer } from './CooldownTimer'
import { ethers } from 'ethers'

interface RequestTokenProps {
    signer: ethers.JsonRpcSigner | null
    provider: ethers.BrowserProvider | null
    address: string | null
    onSuccess: () => void
    description?: string
}

export function RequestToken({
    signer,
    provider,
    address,
    onSuccess,
    description,
}: RequestTokenProps) {
    const {
        requestToken,
        status,
        error: txError,
        txHash,
        reset,
    } = useRequestToken(signer)

    const {
        remainingSeconds,
        isOnCooldown,
        refetch: refetchCooldown,
    } = useCooldown(provider, address)

    const handleRequest = async () => {
        await requestToken()
        refetchCooldown()
        onSuccess()
    }

    const buttonDisabled = !signer || status === 'loading'

    return (
        <section className="hf-card">
            <div className="hf-cardHeader">
                <h2 className="hf-cardTitle">Faucet</h2>
            </div>

            <p className="hf-cardSubtitle">
                {description ?? 'Claim tokens from the faucet (cooldown applies).'}
            </p>

            {isOnCooldown ? (
                <CooldownTimer remainingSeconds={remainingSeconds} />
            ) : (
                <button
                    onClick={handleRequest}
                    disabled={buttonDisabled}
                    className="hf-button hf-button--success hf-button--block"
                >
                    {status === 'loading' ? 'Claiming...' : 'Claim Tokens'}
                </button>
            )}

            {status === 'success' && txHash && (
                <div className="hf-tx">
                    <p className="hf-txStatus hf-txStatus--success">
                        ✓ Tokens claimed successfully
                    </p>

                    <a
                        href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
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
                        ✗ {txError ?? 'Transaction failed'}
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
