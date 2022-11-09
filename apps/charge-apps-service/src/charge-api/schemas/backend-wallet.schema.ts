import * as mongoose from 'mongoose'

export enum walletTypes {
  PAYMENT_ACCOUNT = 'PAYMENT_ACCOUNT',
  PAYMENT_LINK = 'PAYMENT_LINK'
}

export const BackendWalletSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    walletAddress: { type: String, required: true },
    accountAddress: { type: String },
    ownerAddress: { type: String },
    walletType: { type: String, enum: walletTypes, required: true }
  },
  {
    timestamps: true
  }
)
