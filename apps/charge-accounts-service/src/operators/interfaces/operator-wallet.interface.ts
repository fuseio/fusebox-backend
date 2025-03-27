import { Document } from 'mongoose'

export interface OperatorWallet extends Document {
  readonly ownerId: string;
  readonly smartWalletAddress: string;
  readonly isActivated: boolean;
  readonly etherspotSmartWalletAddress?: string;
}
