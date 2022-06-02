import { Document } from 'mongoose'

export interface RelayAccount extends Document {
  readonly projectId: string;
  readonly address: string;
  readonly childIndex: number;
  readonly nonce: number;
}
