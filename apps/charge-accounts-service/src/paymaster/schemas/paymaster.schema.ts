import * as mongoose from 'mongoose'

export const PaymasterInfoSchema = new mongoose.Schema(
  {
    paymasterAddress: { type: String, required: true },
    paymasterVersion: { type: String, required: true },
    entrypointAddress: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    sponsorId: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    environment: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

PaymasterInfoSchema.index({ paymasterVersion: 1, sponsorId: 1, environment: 1 }, { unique: true })
