export interface EventData extends Object {
  from: string,
  txHash: string,
  blockNumber: number,
  blockHash: string,
}
export interface TokenEventData extends EventData {
  to: string,
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
export interface UserOpEventData extends EventData {
  userOpHash: string;
  nonce: number;
  paymasterAndData?: string;
  success: boolean;
  actualGasCost: string;
  actualGasUsed: string;
}
