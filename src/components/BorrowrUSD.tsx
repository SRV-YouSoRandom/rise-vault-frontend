import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'react-hot-toast'
import { ArrowUpCircle } from 'lucide-react'

import { CONTRACTS, RISE_VAULTS_ABI } from '../lib/wagmi'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

interface BorrowrUSDProps {
  currentDebt: string
  onSuccess: () => void
}

export function BorrowrUSD({ currentDebt, onSuccess }: BorrowrUSDProps) {
  const [amount, setAmount] = useState('')

  // Borrow/Mint transaction
  const { 
    writeContract: writeBorrow, 
    data: borrowHash, 
    isPending: isBorrowing 
  } = useWriteContract()
  
  const { isLoading: isBorrowConfirming } = useWaitForTransactionReceipt({
    hash: borrowHash,
    onSuccess: () => {
      setAmount('')
      onSuccess()
      toast.success('rUSD borrowed successfully!')
    }
  })

  // Repay transaction
  const { 
    writeContract: writeRepay, 
    data: repayHash, 
    isPending: isRepaying 
  } = useWriteContract()
  
  const { isLoading: isRepayConfirming } = useWaitForTransactionReceipt({
    hash: repayHash,
    onSuccess: () => {
      setAmount('')
      onSuccess()
      toast.success('rUSD repaid successfully!')
    }
  })

  const handleBorrow = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      const amountWei = parseEther(amount)
      writeBorrow({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'mintUSD',
        args: [amountWei],
      })
      toast.success('Borrowing rUSD...')
    } catch (error) {
      toast.error('Failed to borrow rUSD')
      console.error('Error borrowing rUSD:', error)
    }
  }

  const handleRepay = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      const amountWei = parseEther(amount)
      writeRepay({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'repayUSD',
        args: [amountWei],
      })
      toast.success('Repaying rUSD...')
    } catch (error) {
      toast.error('Failed to repay rUSD')
      console.error('Error repaying rUSD:', error)
    }
  }

  const maxBorrowAmount = parseFloat(currentDebt) || 0

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <ArrowUpCircle className="w-6 h-6 text-green-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Borrow rUSD
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="borrow-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (rUSD)
          </label>
          <Input
            id="borrow-amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Current debt: {currentDebt} rUSD
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleBorrow}
            disabled={!amount || isBorrowing || isBorrowConfirming}
            variant="primary"
          >
            {isBorrowing || isBorrowConfirming 
              ? 'Borrowing...' 
              : 'Borrow rUSD'}
          </Button>

          <Button
            onClick={handleRepay}
            disabled={!amount || isRepaying || isRepayConfirming || maxBorrowAmount === 0}
            variant="secondary"
          >
            {isRepaying || isRepayConfirming 
              ? 'Repaying...' 
              : 'Repay rUSD'}
          </Button>
        </div>

        {maxBorrowAmount === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No debt to repay
          </p>
        )}
      </div>
    </Card>
  )
}