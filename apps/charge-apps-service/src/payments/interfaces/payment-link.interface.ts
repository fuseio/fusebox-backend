import { Document } from 'mongoose'

export interface PaymentLink extends Document {
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
}
