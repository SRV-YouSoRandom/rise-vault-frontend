import { useState, useEffect } from 'react'
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
  
  const { 
    isLoading: isBorrowConfirming,
    isSuccess: isBorrowSuccess,
    error: borrowError
  } = useWaitForTransactionReceipt({
    hash: borrowHash,
  })

  // Repay transaction
  const { 
    writeContract: writeRepay, 
    data: repayHash, 
    isPending: isRepaying 
  } = useWriteContract()
  
  const { 
    isLoading: isRepayConfirming,
    isSuccess: isRepaySuccess,
    error: repayError
  } = useWaitForTransactionReceipt({
    hash: repayHash,
  })

  // Handle borrow success
  useEffect(() => {
    if (isBorrowSuccess && borrowHash) {
      setAmount('')
      onSuccess()
      toast.success('rUSD borrowed successfully!', { id: borrowHash })
    }
  }, [isBorrowSuccess, borrowHash, onSuccess])

  // Handle borrow error
  useEffect(() => {
    if (borrowError && borrowHash) {
      toast.error('Failed to borrow rUSD!', { id: borrowHash })
    }
  }, [borrowError, borrowHash])

  // Handle repay success
  useEffect(() => {
    if (isRepaySuccess && repayHash) {
      setAmount('')
      onSuccess()
      toast.success('rUSD repaid successfully!', { id: repayHash })
    }
  }, [isRepaySuccess, repayHash, onSuccess])

  // Handle repay error
  useEffect(() => {
    if (repayError && repayHash) {
      toast.error('Failed to repay rUSD!', { id: repayHash })
    }
  }, [repayError, repayHash])

  const handleBorrow = async () => {
    if (!amount) {
      toast.error('Please enter an amount')
      return
    }

    try {
      // rUSD typically has 18 decimals like most stablecoins
      const amountWei = parseEther(amount)
      writeBorrow({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'mintUSD',
        args: [amountWei],
      })
      toast.loading('Borrowing rUSD...', { id: 'borrow-loading' })
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
      // rUSD typically has 18 decimals like most stablecoins
      const amountWei = parseEther(amount)
      writeRepay({
        address: CONTRACTS.RISE_VAULTS,
        abi: RISE_VAULTS_ABI,
        functionName: 'repayUSD',
        args: [amountWei],
      })
      toast.loading('Repaying rUSD...', { id: 'repay-loading' })
    } catch (error) {
      toast.error('Failed to repay rUSD')
      console.error('Error repaying rUSD:', error)
    }
  }

  const maxBorrowAmount = parseFloat(currentDebt) || 0
  
  const setMaxRepayAmount = () => {
    if (maxBorrowAmount > 0) {
      setAmount(currentDebt)
    }
  }

  const formatCurrentDebt = (debt: string) => {
    try {
      const debtNumber = parseFloat(debt)
      return debtNumber.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })
    } catch {
      return debt
    }
  }

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
          <div className="relative">
            <Input
              id="borrow-amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pr-16"
              step="0.000001"
              min="0"
            />
            {maxBorrowAmount > 0 && (
              <button
                onClick={setMaxRepayAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                MAX
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Current debt: {formatCurrentDebt(currentDebt)} rUSD
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

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Borrowing will mint new rUSD against your collateral</p>
          <p>• Repaying will burn rUSD and reduce your debt</p>
          <p>• Make sure you have sufficient collateral ratio</p>
        </div>
      </div>
    </Card>
  )
}