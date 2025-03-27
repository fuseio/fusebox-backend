import { Document } from 'mongoose'

export interface OperatorInvoice extends Document {
  readonly ownerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly txHash: string;
  readonly amountUsd: number;
}
