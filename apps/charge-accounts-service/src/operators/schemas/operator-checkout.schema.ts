import * as mongoose from 'mongoose'

export const OperatorCheckoutSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: { type: String, required: true, unique: true, index: true },
    billingCycle: { type: String, required: true },
    url: { type: String },
    cancelUrl: { type: String },
    successUrl: { type: String },
    webhookUrl: { type: String },
    expiresAt: { type: Date },
    status: { type: String },
    paymentStatus: { type: String, required: true, index: true },
    amount: { type: Number }
  },
  {
    timestamps: true
  }
)
