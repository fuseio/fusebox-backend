import { Document } from 'mongoose';

export interface ApiKey extends Document {
  readonly projectId: string;
  readonly publicKey: string;
  readonly testPublicKey: string;
  readonly secretHash: string;
  readonly testSecretHash: string;
}
