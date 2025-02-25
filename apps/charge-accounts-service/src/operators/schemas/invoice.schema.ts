import * as mongoose from 'mongoose'

export const InvoiceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    txHash: { type: String, required: true }
  },
  {
    timestamps: true
  }
)
