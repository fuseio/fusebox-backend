import { Document } from 'mongoose'

export interface EthereumPaymentLink extends Document {
  readonly ownerId: string;
  readonly title: string;
  readonly description: string;
  readonly tokenSymbol: string;
  readonly tokenAddress: string;
  readonly amount: number;
  readonly backendWalletId: string;
  status: string;
  receivedTokenSymbol: string;
  receivedTokenAddress: string;
  receivedAmount: string;
  fromAddress: string;
  webhookEvent: any
  txHash: string;
  webhookUrl: string;
}
