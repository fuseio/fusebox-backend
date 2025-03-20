import * as mongoose from 'mongoose'

export const OperatorInvoiceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    txHash: { type: String, required: true },
    amountUsd: { type: Number }
  },
  {
    timestamps: true
  }
)
