import * as mongoose from 'mongoose'

export const OperatorInvoiceSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OperatorWallet',
      required: true
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OperatorPaymentMethod',
      required: true
    },
    pricingPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OperatorPricingPlan',
      required: true
    },
    transactionHash: { type: String, required: true, unique: true, index: true },
    subscriptionStartedAt: { type: Date, required: true },
    subscriptionEndedAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
)
