import { Document } from 'mongoose'

export interface EthereumFundingAccount extends Document {
  readonly ownerId: string;
  readonly backendWalletId: string;
}
