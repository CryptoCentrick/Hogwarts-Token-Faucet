# Hogwarts Token Faucet

An **ERC-20 token + faucet** project you can use to practise Web3 basics without risking real money.

This repo has two parts:

- `Token Faucet/` — the **Solidity smart contract** (built with **Foundry**) that creates the token and enforces the faucet rules.
- `Front End/` — the **React + TypeScript** website where you connect MetaMask and use the faucet.

---

## What you can do

- **Connect your wallet** (MetaMask) from the top-right corner of the site
- **See token details** (name, symbol, supply, your balance)
- **Claim tokens from the faucet** (limited by a cooldown so nobody can spam it)
- **Transfer tokens** to a friend
- **Mint tokens (owner only)** for testing/admin purposes

---

## How the whole system works (big picture)

```
You (Browser UI)
   │
   │ 1) You click buttons (Claim / Transfer / Mint)
   ▼
Front End (React + ethers.js)
   │
   │ 2) ethers.js asks MetaMask to sign a transaction
   ▼
MetaMask (your wallet)
   │
   │ 3) transaction goes to the Sepolia test network
   ▼
Sepolia (test Ethereum)
   │
   │ 4) runs the smart contract code
   ▼
FaucetToken.sol (the rules)
```

Two important words you’ll see a lot:

- **Provider**: a “read-only” connection to the blockchain (checking balances, reading data).
- **Signer**: the thing that can **sign transactions** (spend gas, change state).

---

## Repository map (where things live)

### Smart contract (Foundry)

- `Token Faucet/src/FaucetToken.sol` — the ERC-20 + faucet logic
- `Token Faucet/script/FaucetToken.s.sol` — deploy script (creates a new contract)
- `Token Faucet/test/FaucetToken.t.sol` — tests for faucet rules and minting
- `Token Faucet/foundry.toml` — Foundry config (Sepolia RPC + Etherscan key via env vars)

### Front end (React)

- `Front End/src/App.tsx` — the page layout (“Hogwarts Token Faucet” UI)
- `Front End/src/constants/address.ts` — the contract address the UI talks to
- `Front End/src/constants/abi.ts` — the contract ABI (how the UI knows what functions exist)
- `Front End/src/hooks/*` — reusable logic for reading/writing to the contract
- `Front End/src/components/*` — UI building blocks (TokenInfo, Faucet button, Transfer, etc.)

---

## The smart contract (Solidity) — what it does

The contract is named `FaucetToken` and it inherits:

- `ERC20` (from OpenZeppelin) — gives you the standard ERC-20 token behaviour
- `Ownable` (from OpenZeppelin) — gives an “owner” account special permissions

### Token identity

Inside `Token Faucet/src/FaucetToken.sol`:

- Token name: **Hogwarts Faucet Token**
- Token symbol: **HFTK**
- Decimals: **18** (standard ERC-20 default)

### Faucet rules (the “anti-spam” part)

The contract hard-codes these rules as constants:

| Rule | Value | What it means |
|------|-------|---------------|
| `MAX_SUPPLY` | 10,000,000 tokens | The token can never exceed this total supply |
| `FAUCET_AMOUNT` | 100 tokens | Every successful faucet claim gives you this amount |
| `FAUCET_COOLDOWN` | 1 day | You can only claim once every 24 hours |

### Important functions (plain-English)

- `requestToken()`
  - Checks your **cooldown**
  - Checks the **max supply cap**
  - Mints `FAUCET_AMOUNT` tokens to you
  - Stores the time of your claim in `lastFaucetClaim[address]`

- `getRemainingCooldown(address claimant) → uint256`
  - Returns **how many seconds** you must wait until you can claim again
  - Returns `0` if you can claim now

- `mint(address to, uint256 amount)` (**owner only**)
  - Lets the owner mint tokens (still cannot exceed `MAX_SUPPLY`)
  - Used for testing/admin scenarios

### Events (helpful for explorers & front ends)

- `TokensRequested(address claimant, uint256 amount)` — emitted when someone claims from the faucet
- `TokensMinted(address to, uint256 amount)` — emitted when the owner mints

---

## Running the smart contract project (Foundry)

### Prerequisites

- Foundry installed (`forge`, `cast`, `anvil`)
- A Sepolia RPC URL (Alchemy/Infura/etc.)
- A wallet **private key** (test wallet only!)

### Environment variables (very important)

In `Token Faucet/.env` you’ll typically set:

- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `ETHERSCAN_API_KEY` (optional, only for verification)

> Security note: **never** share or commit real private keys. Use a fresh test wallet. If you accidentally exposed a key, rotate it immediately.

### Build / test

From the repo root:

```powershell
cd "Token Faucet"
forge build
forge test
```

### Deploy to Sepolia

This project includes a deploy script:

- `Token Faucet/script/FaucetToken.s.sol` (deploys `FaucetToken`)

Example:

```powershell
cd "Token Faucet"
forge script script/FaucetToken.s.sol:FaucetTokenScript --rpc-url $env:SEPOLIA_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
```

If you want automatic verification and you have an Etherscan API key configured, you can add `--verify` as well.

---

## Running the front end (React + Vite)

### Prerequisites

- Node.js + npm installed
- MetaMask installed in your browser
- Sepolia ETH (for gas) in your test wallet

### Point the UI at your deployed contract

The front end reads the contract address from:

- `Front End/src/constants/address.ts`

If you deploy a new contract, **update that address**.

### Start the dev server

```powershell
cd "Front End"
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

---

## Front end walkthrough (what each card does)

### Connect wallet (top-right)

Uses `Front End/src/hooks/useWallet.ts` to:

- detect MetaMask (`window.ethereum`)
- request accounts
- create an ethers **provider** + **signer**

### Token Info

Reads:

- name / symbol / decimals
- total supply / max supply
- your wallet balance (if connected)

### Faucet (Claim Tokens)

Calls:

- `requestToken()` to claim
- `getRemainingCooldown(address)` to show the cooldown timer

### Transfer

Calls ERC-20 `transfer(to, amount)` from your connected wallet.

### Mint (Owner only)

Only shows up when the connected wallet address matches the contract `owner()`.

---

## Troubleshooting (common “why isn’t it working?”)

- **“MetaMask not detected”**
  - Install MetaMask, or open the site in a browser where MetaMask is enabled.

- **Buttons are disabled**
  - You probably aren’t connected. Click **Connect Wallet** first.

- **Wrong network warning**
  - Switch MetaMask to **Sepolia**.

- **Transaction fails with cooldown**
  - The contract enforces a strict 24-hour timer between claims.

- **Transaction fails with max supply**
  - The contract refuses any mint/claim that would exceed `MAX_SUPPLY`.

- **UI shows weird data**
  - Check that `Front End/src/constants/address.ts` matches your deployed contract.

---

## Glossary (quick definitions)

- **Address**: like your account number on the blockchain (public).
- **Private key**: your secret password (never share).
- **Transaction**: a signed message that changes blockchain state (costs gas).
- **Gas**: the network fee you pay to run contract code.
- **Testnet (Sepolia)**: a practice network that uses fake ETH and fake tokens.
- **ABI**: the “menu” of contract functions so the front end knows what it can call.

---

## Safety / good habits

- Use test wallets for learning projects.
- Don’t paste private keys into random websites or share them in screenshots.
- Always double-check the contract address before signing transactions.

