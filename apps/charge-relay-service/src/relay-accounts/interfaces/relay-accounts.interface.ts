import { Document } from 'mongoose'

export interface RelayAccount extends Document {
  readonly projectId: string;
  readonly encryptedPK: string;
  readonly publicKey: string;
  readonly nonce: number;
}
