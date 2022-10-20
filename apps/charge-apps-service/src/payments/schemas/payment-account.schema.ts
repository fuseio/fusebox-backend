import * as mongoose from 'mongoose'

export const PaymentAccountSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    backendWalletId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BackendWallet',
      required: true
    }
  },
  {
    timestamps: true
  }
)
