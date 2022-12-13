import { Document } from 'mongoose'

export interface EthereumPaymentAccount extends Document {
  readonly ownerId: string;
  readonly backendWalletId: string;
}
