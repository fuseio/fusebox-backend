import * as mongoose from 'mongoose'

export const OperatorPaymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    tokenAddress: { type: String },
    tokenDecimal: { type: Number }
  },
  {
    timestamps: true
  }
)
