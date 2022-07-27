import { Document } from 'mongoose'

export interface EventsScannerStatus extends Document {
  readonly filter: string;
  readonly blockNumber: number;
}
