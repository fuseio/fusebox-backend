import { Document } from 'mongoose'

export interface TransactionsScannerStatus extends Document {
  readonly filter: string;
  readonly blockNumber: number;
}
