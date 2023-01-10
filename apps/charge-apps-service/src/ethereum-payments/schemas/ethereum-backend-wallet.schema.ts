import * as mongoose from 'mongoose'

export enum walletTypes {
  FUNDING_ACCOUNT = 'FUNDING_ACCOUNT',
  PAYMENT_ACCOUNT = 'PAYMENT_ACCOUNT',
  PAYMENT_LINK = 'PAYMENT_LINK'
}

export const EthereumBackendWalletSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    childIndex: { type: Number, required: true, unique: true },
    walletType: { type: String, enum: walletTypes, required: true }
  },
  {
    timestamps: true
  }
)
