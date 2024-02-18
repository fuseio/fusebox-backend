import { Document } from 'mongoose'

export interface SmartContractWallet extends Document {
  readonly ownerAddress: string;
  readonly smartWalletAddress: string;
  readonly apiKey: string;
}
