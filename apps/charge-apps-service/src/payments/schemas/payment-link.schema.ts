import * as mongoose from 'mongoose'

export enum availableTokens {
  USDC = 'USDC',
  FUSE = 'FUSE'
}

export enum status {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  OVERPAID = 'OVERPAID',
  UNDERPAID = 'UNDERPAID',
  TOKEN_MISMATCH = 'TOKEN_MISMATCH'
}

export const PaymentLinkSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    tokenSymbol: { type: String, enum: availableTokens, required: true },
    tokenAddress: { type: String, required: true },
    amount: { type: String, required: true },
    backendWalletId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BackendWallet',
      required: true
    },
    status: { type: String, required: true, enum: status, default: 'PENDING'},
    receivedTokenSymbol: { type: String},
    receivedTokenAddress: { type: String},
    receivedAmount: { type: String }
  },
  {
    timestamps: true
  }
)
