import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { defineChain } from '@reown/appkit/networks'
import './index.css'
import App from './App.tsx'

// Define Lisk Sepolia as a custom network
const liskSepolia = defineChain({
  id: 4202,
  caipNetworkId: 'eip155:4202',
  chainNamespace: 'eip155',
  name: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.lisk.com',
    },
  },
  testnet: true,
})

// Replace with your actual project ID from cloud.reown.com
const projectId = '821222115f8e6c86918926f03323674b'

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [liskSepolia],
  defaultNetwork: liskSepolia,
  metadata: {
    name: 'Hogwarts Token Faucet',
    description: 'Claim HTKF tokens on Lisk Sepolia testnet',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
  projectId,
  features: {
    analytics: false,
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)