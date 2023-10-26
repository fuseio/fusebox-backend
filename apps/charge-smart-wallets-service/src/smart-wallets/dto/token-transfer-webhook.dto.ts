export class TokenTransferWebhookDto {
  to: string

  from: string

  txHash: string

  value?: string

  tokenId?: number

  tokenType: string

  tokenAddress?: string

  tokenName?: string

  tokenSymbol?: string

  tokenDecimals?: string

  blockNumber: number
}
