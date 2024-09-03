import * as mongoose from 'mongoose'

export const OperatorPricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    duration: { type: Number, required: true }
  },
  {
    timestamps: true
  }
)
