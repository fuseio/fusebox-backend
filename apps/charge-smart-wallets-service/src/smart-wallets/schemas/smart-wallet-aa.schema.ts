import * as mongoose from 'mongoose'

export const SmartWalletAASchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    smartWalletAddress: { type: String, required: true },
    isPaymasterFunded: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
)
