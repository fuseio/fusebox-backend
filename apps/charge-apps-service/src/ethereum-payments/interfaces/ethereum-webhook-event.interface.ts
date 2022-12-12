import { Document } from 'mongoose'

export interface EthereumWebhookEvent extends Document {
  readonly to: string;
  readonly from: string;
  readonly value: string;
  readonly valueEth: string;
  readonly txHash: string;
  readonly blockNumber: number;
  readonly blockHash: string;
  readonly tokenType: string;
  readonly tokenAddress: string;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly tokenDecimals: string;
  readonly direction: string;
}
