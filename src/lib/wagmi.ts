import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';

const avalanche = {
  id: 	11155931,
  name: 'Rise Testnet',
  iconBackground: '#fff',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.riselabs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.riselabs.xyz' },
  }
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Rise Vault',
  projectId: 'YOUR_PROJECT_ID',
  chains: [avalanche],
});

// Contract addresses
export const CONTRACTS = {
  RISE_VAULTS: '0x6155a1C59dba762646F8BE36Ee97FaC819fDD2b1' as const,
  // Add other contract addresses as needed
}

// Placeholder ABI - replace with your actual ABI
export const RISE_VAULTS_ABI = [
  // Add your contract ABI here
  {
    "inputs": [],
    "name": "openVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "depositCollateral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mintUSD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserCollateralizationRatio",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "vaults",
    "outputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "debt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Common token addresses (update with actual addresses)
export const TOKENS = {
  WETH: '0x4200000000000000000000000000000000000006',
  USDT: '0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849',
  WBTC: '0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55',
} as const