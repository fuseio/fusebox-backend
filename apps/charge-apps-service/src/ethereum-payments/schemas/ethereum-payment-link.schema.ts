import * as mongoose from 'mongoose'

export enum status {
  NOT_PAID = 'Not Paid',
  SUCCESSFUL = 'Successful',
  OVERPAID = 'Overpaid',
  UNDERPAID = 'Underpaid',
  WRONG_TOKEN = 'Wrong Token'
}

export const EthereumPaymentLinkSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    tokenSymbol: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    amount: { type: Number, required: true },
    backendWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EthereumBackendWallet',
      required: true
    },
    status: { type: String, required: true, enum: status, default: status.NOT_PAID },
    receivedTokenSymbol: { type: String },
    receivedTokenAddress: { type: String },
    receivedAmount: { type: String },
    fromAddress: { type: String },
    txHash: { type: String },
    webhookEvent: { type: Object }
  },
  {
    timestamps: true
  }
)
