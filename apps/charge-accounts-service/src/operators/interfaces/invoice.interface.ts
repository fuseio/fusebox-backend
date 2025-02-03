import { Document } from 'mongoose'

export interface Invoice extends Document {
  readonly ownerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly txHash: string;
}
