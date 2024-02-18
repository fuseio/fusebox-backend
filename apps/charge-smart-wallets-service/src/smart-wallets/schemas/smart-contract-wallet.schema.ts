import * as mongoose from 'mongoose'
const { String } = mongoose.Schema.Types

export const SmartContractWalletSchema = new mongoose.Schema(
  {
    apiKey: { type: String, required: true, index: true },
    ownerAddress: { type: String, required: true, index: true },
    smartWalletAddress: { type: String, required: true, index: true }
  },
  {
    timestamps: true
  }
)
