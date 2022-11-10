import { Document } from 'mongoose'

export interface ApiKey extends Document {
  readonly ownerId: string;
  readonly appName: string;
  readonly publicKey: string;
  readonly secretHash: string;
  readonly secretPrefix: string;
  readonly secretLastFourChars: string;
}
