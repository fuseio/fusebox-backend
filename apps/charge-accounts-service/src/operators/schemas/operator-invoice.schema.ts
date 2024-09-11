import * as mongoose from 'mongoose'

export const OperatorInvoiceSchema = new mongoose.Schema(
  {
    operatorId: {
      type: String,
      required: true
    },
    paymentMethod: {
      id: { type: String, required: true },
      symbol: { type: String, required: true },
      tokenAddress: { type: String, required: true }
    },
    pricingPlan: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      priceInUsd: { type: Number, required: true }
    },
    transactionHash: { type: String, required: true, unique: true, index: true },
    subscriptionStartedAt: { type: Date, required: true },
    subscriptionEndedAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
)
