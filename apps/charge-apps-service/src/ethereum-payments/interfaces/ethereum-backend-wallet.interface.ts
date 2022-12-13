import { Document } from 'mongoose'

export interface EthereumBackendWallet extends Document {
  readonly walletAddress: string;
  readonly childIndex: number;
  readonly walletType: string;
}
