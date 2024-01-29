import { Document } from 'mongoose'

export interface SmartWalletsAA extends Document {
  readonly ownerId: string;
  readonly smartWalletAddress: string;
  readonly isPaymasterFunded: boolean;
}
