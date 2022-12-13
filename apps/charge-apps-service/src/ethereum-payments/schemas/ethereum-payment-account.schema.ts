import * as mongoose from 'mongoose'

export const EthereumPaymentAccountSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    backendWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EthereumBackendWallet',
      required: true
    }
  },
  {
    timestamps: true
  }
)
