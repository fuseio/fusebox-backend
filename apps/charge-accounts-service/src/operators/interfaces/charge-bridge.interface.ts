export interface ChargeBridge {
  walletAddress: string
  tokenAddress: string
  chainId: number
  tokenDecimals: number
  isNative: boolean
  paymentId: string
  startTime: number
  endTime: number
  amount: string
  gasFee: number
  totalAmount: string
}
