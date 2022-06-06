import { Document } from 'mongoose'

export interface ApiKey extends Document {
  readonly projectId: string;
  readonly publicKey: string;
  readonly secretHash: string;
  readonly secretPrefix: string;
  readonly secretLastFourChars: string;
  readonly isTest: boolean;
}
