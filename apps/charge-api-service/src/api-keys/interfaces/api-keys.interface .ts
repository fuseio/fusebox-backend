import { Document } from 'mongoose'

export interface ApiKey extends Document {
  readonly projectId: string;
  readonly publicKey: string;
  readonly sandboxKey: string;
  readonly secretHash: string;
  readonly secretPrefix: string;
  readonly secretLastFourChars: string;
  readonly encryptedLegacyJwt: string;
  readonly legacyBackendAccount: string;
}
