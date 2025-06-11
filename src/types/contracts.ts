export interface VaultData {
  owner: string
  debt: bigint
  collateral: Record<string, bigint>
}

export interface TokenInfo {
  address: string
  symbol: string
  decimals: number
  name: string
}

export interface CollateralToken extends TokenInfo {
  minCollateralizationRatio: number
  price: bigint
}

export interface UserVaultStats {
  totalCollateralValue: bigint
  totalDebt: bigint
  collateralizationRatio: number
  healthFactor: number
  liquidationPrice: bigint
}

export interface TransactionStatus {
  hash?: string
  isPending: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error?: Error
}