import { useAccount } from 'wagmi'
import { ConnectWallet } from './components/ConnectWallet'
import { VaultDashboard } from './components/VaultDashboard'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Rise Vault</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Beta
              </span>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isConnected ? (
          <VaultDashboard />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Rise Vault
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Deposit collateral and borrow rUSD stablecoins with competitive rates. 
              Connect your wallet to get started.
            </p>
            <ConnectWallet />
          </div>
        )}
      </main>
    </div>
  )
}

export default App