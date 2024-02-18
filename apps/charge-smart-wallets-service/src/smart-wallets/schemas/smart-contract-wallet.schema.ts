import * as mongoose from 'mongoose'
const { String } = mongoose.Schema.Types

export const SmartContractWalletSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    ownerAddress: { type: String, required: true, index: true },
    smartWalletAddress: { type: String, required: true, index: true }
  },
  {
    timestamps: true
  }
)
