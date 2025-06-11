import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, RISE_VAULTS_ABI } from '../lib/wagmi'

export function useVaultContract() {
  const { address } = useAccount()

  // Read vault data
  const {
    data: vaultData,
    isLoading: isVaultLoading,
    refetch: refetchVault,
  } = useReadContract({
    address: CONTRACTS.RISE_VAULTS,
    abi: RISE_VAULTS_ABI,
    functionName: 'vaults',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read collateralization ratio
  const {
    data: collateralizationRatio,
    isLoading: isRatioLoading,
    refetch: refetchRatio,
  } = useReadContract({
    address: CONTRACTS.RISE_VAULTS,
    abi: RISE_VAULTS_ABI,
    functionName: 'getUserCollateralizationRatio',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!vaultData && vaultData[0] !== '0x0000000000000000000000000000000000000000',
    },
  })

  const hasVault = vaultData && vaultData[0] !== '0x0000000000000000000000000000000000000000'
  const debt = vaultData ? vaultData[1] : 0n
  const ratio = collateralizationRatio ? Number(collateralizationRatio) / 100 : 0

  const refetchAll = () => {
    refetchVault()
    refetchRatio()
  }

  return {
    vaultData,
    collateralizationRatio,
    hasVault,
    debt,
    ratio,
    isLoading: isVaultLoading || isRatioLoading,
    refetchAll,
  }
}