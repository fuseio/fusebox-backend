import { Document } from 'mongoose'

export interface ScannerStatus extends Document {
  readonly filter: string;
  readonly blockNumber: number;
}
