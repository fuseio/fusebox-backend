import * as mongoose from 'mongoose'

export const ChargeBridgeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletAddress: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    chainId: { type: Number, required: true },
    tokenDecimals: { type: Number, required: true },
    isNative: { type: Boolean, required: true },
    paymentId: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    amount: { type: String, required: true },
    gasFee: { type: Number },
    totalAmount: { type: String, required: true }
  },
  {
    timestamps: true
  }
)
