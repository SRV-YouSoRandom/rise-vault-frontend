import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
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
] as const

export function DepositCollateral({ selectedToken, onSuccess }: DepositCollateralProps) {
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'approve' | 'deposit'>('approve')

  // Read token balance
  const { data: balance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [selectedToken as `0x${string}`], // This should be user's address
  })

  // Approve transaction
  const { 
    writeContract: writeApprove, 
    data: approveHash, 
    isPending: isApproving 
  } = useWriteContract()
  
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
    onSuccess: () => {
      setStep('deposit')
      toast.success('Approval confirmed!')
    }
  })

  // Deposit transaction
  const { 
    writeContract: writeDeposit, 
    data: depositHash, 
    isPending: isDepositing 
  } = useWriteContract()
  
  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
    onSuccess: () => {
      setAmount('')
      setStep('approve')
      onSuccess()
      toast.success('Collateral deposited successfully!')
    }
  })

  const handleApprove = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      const amountWei = parseEther(amount)
      writeApprove({
        address: selectedToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.RISE_VAULTS, amountWei],
      })
      toast.success('Approving token...')
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
      const amountWei = parseEther(amount)
      writeDeposit({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'depositCollateral',
        args: [selectedToken as `0x${string}`, amountWei],
      })
      toast.success('Depositing collateral...')
    } catch (error) {
      toast.error('Failed to deposit collateral')
      console.error('Error depositing collateral:', error)
    }
  }

  const tokenSymbol = Object.entries({
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
    '0xA0b86a33E6417aFE8D36C7cA1A81C1a8Cf43FeDf': 'USDC',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
  }).find(([address]) => address === selectedToken)?.[1] || 'Token'

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
            Amount ({tokenSymbol})
          </label>
          <Input
            id="deposit-amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
          {balance && (
            <p className="text-sm text-gray-500 mt-1">
              Balance: {formatEther(balance)} {tokenSymbol}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {step === 'approve' ? (
            <Button
              onClick={handleApprove}
              disabled={!amount || isApproving || isApproveConfirming}
              className="flex-1"
            >
              {isApproving || isApproveConfirming 
                ? 'Approving...' 
                : `Approve ${tokenSymbol}`}
            </Button>
          ) : (
            <Button
              onClick={handleDeposit}
              disabled={!amount || isDepositing || isDepositConfirming}
              className="flex-1"
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
      </div>
    </Card>
  )
}