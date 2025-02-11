import * as mongoose from 'mongoose'

export const OperatorWalletSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    smartWalletAddress: { type: String, required: true, unique: true, index: true },
    isActivated: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
)
