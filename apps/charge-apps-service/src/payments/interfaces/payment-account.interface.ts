import { Document } from 'mongoose'

export interface PaymentAccount extends Document {
  readonly ownerId: string;
  readonly backendWalletId: string;
}
