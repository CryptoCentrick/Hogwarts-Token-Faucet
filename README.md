# Hogwarts Token Faucet

An **ERC-20 token + faucet** project you can use to practise Web3 basics without risking real money.

This repo has two parts:

- `Token Faucet/` — the **Solidity smart contract** (built with **Foundry**) that creates the token and enforces the faucet rules.
- `Front End/` — the **React + TypeScript** website where you connect a wallet (via a modal) and use the faucet.

Right now, the front end is configured for **Lisk Sepolia Testnet** (chain id `4202`) using **Blockscout** as the explorer.

---

## What you can do

- **Connect your wallet** using a “Connect Wallet” modal
- **Browse pages** in the app: Home / Faucet / Portfolio / (Admin if you’re the owner)
- **See token details** (name, symbol, supply, your balance)
- **Claim tokens** from the faucet (limited by a cooldown so nobody can spam it)
- **Transfer tokens** to another address
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
   │ 2) ethers.js asks your wallet to sign a transaction
   ▼
Wallet (via AppKit)
   │
   │ 3) transaction goes to an EVM testnet (currently Lisk Sepolia)
   ▼
Blockchain (testnet)
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
- `Token Faucet/foundry.toml` — Foundry config (RPC endpoint + explorer verification key via env vars)
- `Token Faucet/.env` — local environment variables (gitignored)

### Front end (React)

- `Front End/src/main.tsx` — bootstraps the app + configures the wallet modal (AppKit) + networks
- `Front End/src/App.tsx` — the app UI (Home/Faucet/Portfolio/Admin pages)
- `Front End/src/constants/address.ts` — the contract address + display name/symbol used by the UI
- `Front End/src/constants/abi.ts` — the contract ABI (how the UI knows what functions exist)
- `Front End/src/hooks/*` — reusable logic for reading/writing to the contract
- `Front End/src/components/*` — UI building blocks (some are used by `App.tsx`, others are reusable/optional)

---

## Configuration you’ll probably edit

### 1) Contract address + UI name

In `Front End/src/constants/address.ts`:

- `FAUCET_TOKEN_ADDRESS` — the deployed contract address your UI talks to
- `TOKEN_DISPLAY_NAME` — the title shown in the app header
- `TOKEN_DISPLAY_SYMBOL` — the “pretty” symbol shown in UI labels

Important: the contract’s **real** symbol is read from-chain (`contract.symbol()`), but some UI text uses `TOKEN_DISPLAY_SYMBOL`. Keep them in sync if you don’t want confusion.

### 2) Wallet modal project id (AppKit / Reown)

In `Front End/src/main.tsx` there is a `projectId`.

- Replace it with your own from `https://cloud.reown.com`
- If you leave it wrong/blank, the wallet modal may not work properly

### 3) Network (currently Lisk Sepolia)

Also in `Front End/src/main.tsx` the app defines a custom network:

- Chain id: `4202`
- RPC: `https://rpc.sepolia-api.lisk.com`
- Explorer: `https://sepolia-blockscout.lisk.com`

If you deploy your contract to a different chain, update the network config and the contract address.

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
- An RPC URL for your target EVM network (example: Lisk Sepolia RPC)
- A wallet **private key** (test wallet only!)

### Environment variables (very important)

In `Token Faucet/.env` you’ll typically set:

- `SEPOLIA_RPC_URL` (this is just the name — you can point it to any EVM RPC you’re deploying to)
- `PRIVATE_KEY`
- `ETHERSCAN_API_KEY` (optional, only for verification; may differ depending on explorer)

> Security note: **never** share or commit real private keys. Use a fresh test wallet. (`Token Faucet/.gitignore` already ignores `.env`.)

### Build / test

From the repo root:

```powershell
cd "Token Faucet"
forge build
forge test
```

### Deploy (to your configured network)

This project includes a deploy script:

- `Token Faucet/script/FaucetToken.s.sol` (deploys `FaucetToken`)

Example:

```powershell
cd "Token Faucet"
forge script script/FaucetToken.s.sol:FaucetTokenScript --rpc-url $env:SEPOLIA_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
```

If you want automatic verification and you have an explorer API key configured, you can add `--verify` as well (you may need to adjust `Token Faucet/foundry.toml` depending on the explorer).

---

## Running the front end (React + Vite)

### Prerequisites

- Node.js + npm installed
- A wallet (MetaMask is fine) with test ETH for gas
- Lisk Sepolia is the default network in the front end config

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

## Front end walkthrough (pages)

The UI is a single-page React app with simple in-app navigation inside `Front End/src/App.tsx`.

### Home

- Shows the faucet name and a quick explanation
- Lets you connect your wallet
- Has buttons to jump to Faucet and Portfolio

### Faucet

- Calls `requestToken()` to claim tokens
- Uses `getRemainingCooldown(address)` to show a countdown timer
- Shows a transaction link on Blockscout after success

### Portfolio

- Shows your wallet balance and basic supply stats
- Includes a transfer form that calls ERC-20 `transfer(to, amount)`
- Shows a transaction link on Blockscout after success

### Admin (owner only)

- Only appears if your connected wallet matches `owner()` from the contract
- Lets the owner call `mint(to, amount)` (still capped by `MAX_SUPPLY`)
- Shows a transaction link on Blockscout after success

---

## How wallet connection works (front end)

The project uses **Reown AppKit** (wallet modal) with the **ethers adapter**.

- `Front End/src/main.tsx` creates the AppKit instance and declares the network(s).
- `Front End/src/hooks/useWallet.ts` exposes `address/isConnected/provider/signer` plus `connect()` and `disconnect()`.

That `signer` is what the faucet/transfer/mint code uses to send transactions.

---

## Troubleshooting (common “why isn’t it working?”)

- **Wallet modal won’t open / connect**
  - Check the `projectId` in `Front End/src/main.tsx` and replace it with your own from Reown.

- **Connected, but transactions fail**
  - Make sure you’re on the same network the app is configured for (default: Lisk Sepolia `4202`).
  - Make sure you have test ETH for gas.

- **Cooldown error**
  - The contract enforces a strict 24-hour timer between claims.

- **Admin page missing**
  - Only the contract owner can see/use Admin minting. Ownership is checked on-chain using `owner()`.

- **Max supply reached**
  - The contract refuses any mint/claim that would exceed `MAX_SUPPLY`.

- **UI shows weird data**
  - Check that `Front End/src/constants/address.ts` matches your deployed contract.

---

## Glossary (quick definitions)

- **Address**: like your account number on the blockchain (public).
- **Private key**: your secret password (never share).
- **Transaction**: a signed message that changes blockchain state (costs gas).
- **Gas**: the network fee you pay to run contract code.
- **Testnet**: a practice network that uses fake ETH and fake tokens.
- **ABI**: the “menu” of contract functions so the front end knows what it can call.

---

## Safety / good habits

- Use test wallets for learning projects.
- Don’t paste private keys into random websites or share them in screenshots.
- Always double-check the contract address before signing transactions.
