import { Document } from 'mongoose'

export interface BackendWallet extends Document {
  readonly jobId: string;
  readonly walletAddress: string;
  readonly accountAddress: string;
  readonly ownerAddress: string;
  readonly walletType: string;
}
