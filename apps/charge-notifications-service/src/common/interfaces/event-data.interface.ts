export interface EventData extends Object {
  to: string,
  from: string,
  txHash: string,
  tokenAddress: string,
  blockNumber: number,
  blockHash: string,
  tokenType: string,
  tokenName: string,
  tokenSymbol: string,
  value: string | null,
  tokenDecimals: number | null,
  tokenId: number | null,
  valueEth: string | null,
  isInternalTransaction: boolean
}
