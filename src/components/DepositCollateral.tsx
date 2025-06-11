import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'react-hot-toast'
import { ArrowDownCircle } from 'lucide-react'

import { CONTRACTS, RISE_VAULTS_ABI } from '../lib/wagmi'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

interface DepositCollateralProps {
  selectedToken: string
  onSuccess: () => void
}

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Token configuration with proper decimals
const TOKEN_CONFIG: Record<string, { symbol: string; decimals: number }> = {
  '0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849': { symbol: 'USDT', decimals: 8 },
  '0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55': { symbol: 'WBTC', decimals: 18 },
}

export function DepositCollateral({ selectedToken, onSuccess }: DepositCollateralProps) {
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'approve' | 'deposit'>('approve')
  
  const { address: userAddress } = useAccount()
  const tokenConfig = TOKEN_CONFIG[selectedToken] || { symbol: 'Token', decimals: 18 }

  // Read token balance
  const { data: balance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress!], // Use user's address, not token address
  })

  // Approve transaction
  const { 
    writeContract: writeApprove, 
    data: approveHash, 
    isPending: isApproving 
  } = useWriteContract()
  
  const { 
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
    error: approveError
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Deposit transaction
  const { 
    writeContract: writeDeposit, 
    data: depositHash, 
    isPending: isDepositing 
  } = useWriteContract()
  
  const { 
    isLoading: isDepositConfirming,
    isSuccess: isDepositSuccess,
    error: depositError
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  // Handle approve success
  useEffect(() => {
    if (isApproveSuccess && approveHash) {
      setStep('deposit')
      toast.success('Token approval confirmed!', { id: approveHash })
    }
  }, [isApproveSuccess, approveHash])

  // Handle approve error
  useEffect(() => {
    if (approveError && approveHash) {
      toast.error('Token approval failed!', { id: approveHash })
    }
  }, [approveError, approveHash])

  // Handle deposit success
  useEffect(() => {
    if (isDepositSuccess && depositHash) {
      setAmount('')
      setStep('approve')
      onSuccess()
      toast.success('Collateral deposited successfully!', { id: depositHash })
    }
  }, [isDepositSuccess, depositHash, onSuccess])

  // Handle deposit error
  useEffect(() => {
    if (depositError && depositHash) {
      toast.error('Collateral deposit failed!', { id: depositHash })
    }
  }, [depositError, depositHash])

  const handleApprove = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      const amountWei = parseUnits(amount, tokenConfig.decimals)
      writeApprove({
        address: selectedToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.RISE_VAULTS, amountWei],
      })
      toast.loading('Approving token...', { id: 'approve-loading' })
    } catch (error) {
      toast.error('Failed to approve token')
      console.error('Error approving token:', error)
    }
  }

  const handleDeposit = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      const amountWei = parseUnits(amount, tokenConfig.decimals)
      writeDeposit({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'depositCollateral',
        args: [selectedToken as `0x${string}`, amountWei],
      })
      toast.loading('Depositing collateral...', { id: 'deposit-loading' })
    } catch (error) {
      toast.error('Failed to deposit collateral')
      console.error('Error depositing collateral:', error)
    }
  }

  const setMaxAmount = () => {
    if (balance) {
      const maxAmount = formatUnits(balance, tokenConfig.decimals)
      setAmount(maxAmount)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <ArrowDownCircle className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Deposit Collateral
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({tokenConfig.symbol})
          </label>
          <div className="relative">
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pr-16"
            />
            {balance && (
              <button
                onClick={setMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                MAX
              </button>
            )}
          </div>
          {balance && (
            <p className="text-sm text-gray-500 mt-1">
              Balance: {formatUnits(balance, tokenConfig.decimals)} {tokenConfig.symbol}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {step === 'approve' ? (
            <Button
              onClick={handleApprove}
              disabled={!amount || isApproving || isApproveConfirming || !userAddress}
              className="flex-1"
              variant="primary"
            >
              {isApproving || isApproveConfirming 
                ? 'Approving...' 
                : `Approve ${tokenConfig.symbol}`}
            </Button>
          ) : (
            <Button
              onClick={handleDeposit}
              disabled={!amount || isDepositing || isDepositConfirming || !userAddress}
              className="flex-1"
              variant="primary"
            >
              {isDepositing || isDepositConfirming 
                ? 'Depositing...' 
                : 'Deposit Collateral'}
            </Button>
          )}
        </div>

        {step === 'deposit' && (
          <p className="text-sm text-green-600 text-center">
            ✓ Token approved. You can now deposit collateral.
          </p>
        )}

        {!userAddress && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to continue
          </p>
        )}
      </div>
    </Card>
  )
}