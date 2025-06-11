import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'react-hot-toast'
import { parseEther, formatEther } from 'viem'
import { Wallet, TrendingUp, DollarSign, Shield } from 'lucide-react'

import { CONTRACTS, RISE_VAULTS_ABI, TOKENS } from '../lib/wagmi'
import { DepositCollateral } from './DepositCollateral'
import { BorrowrUSD } from './BorrowrUSD'
import { Card } from './ui/Card'

export function VaultDashboard() {
  const { address } = useAccount()
  const [hasVault, setHasVault] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>(TOKENS.ETH)

  // Read vault data
  const { data: vaultData, refetch: refetchVault } = useReadContract({
    address: CONTRACTS.RISE_VAULTS,
    abi: RISE_VAULTS_ABI,
    functionName: 'vaults',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  // Read collateralization ratio
  const { data: collateralizationRatio, refetch: refetchRatio } = useReadContract({
    address: CONTRACTS.RISE_VAULTS,
    abi: RISE_VAULTS_ABI,
    functionName: 'getUserCollateralizationRatio',
    args: [address!],
    query: {
      enabled: !!address && hasVault,
    },
  })

  // Open vault transaction
  const { writeContract: writeOpenVault, data: openVaultHash, isPending: isOpeningVault } = useWriteContract()
  
  const { isLoading: isOpenVaultConfirming } = useWaitForTransactionReceipt({
    hash: openVaultHash,
  })

  useEffect(() => {
    if (vaultData && vaultData[0] !== '0x0000000000000000000000000000000000000000') {
      setHasVault(true)
    }
  }, [vaultData])

  const handleOpenVault = async () => {
    try {
      writeOpenVault({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'openVault',
      })
      toast.success('Opening vault...')
    } catch (error) {
      toast.error('Failed to open vault')
      console.error('Error opening vault:', error)
    }
  }

  const refreshData = () => {
    refetchVault()
    refetchRatio()
  }

  if (!hasVault) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Create Your Vault
          </h2>
          <p className="text-gray-600 mb-8">
            You need to create a vault before you can deposit collateral and borrow rUSD.
          </p>
          <button
            onClick={handleOpenVault}
            disabled={isOpeningVault || isOpenVaultConfirming}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isOpeningVault || isOpenVaultConfirming ? 'Creating Vault...' : 'Create Vault'}
          </button>
        </Card>
      </div>
    )
  }

  const debt = vaultData ? formatEther(vaultData[1]) : '0'
  const ratio = collateralizationRatio ? Number(collateralizationRatio) / 100 : 0

  return (
    <div className="space-y-8">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debt</p>
              <p className="text-2xl font-bold text-gray-900">{debt} rUSD</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collateral Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{ratio.toFixed(2)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Status</p>
              <p className={`text-2xl font-bold ${ratio > 150 ? 'text-green-600' : 'text-red-600'}`}>
                {ratio > 150 ? 'Healthy' : 'At Risk'}
              </p>
            </div>
            <Shield className={`w-8 h-8 ${ratio > 150 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </Card>
      </div>

      {/* Token Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Collateral Token</h3>
        <div className="flex gap-4">
          {Object.entries(TOKENS).map(([symbol, address]) => (
            <button
              key={symbol}
              onClick={() => setSelectedToken(address)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedToken === address
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DepositCollateral 
          selectedToken={selectedToken} 
          onSuccess={refreshData}
        />
        <BorrowrUSD 
          currentDebt={debt}
          onSuccess={refreshData}
        />
      </div>
    </div>
  )
}