import * as mongoose from 'mongoose'
const { String } = mongoose.Schema.Types

export const SmartAccountUpgradeSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    version: { type: String },
    paddedVersion: { type: String },
    enabledModules: { type: Object },
    disabledModules: { type: Object },
    whitelist: { type: Array, of: String }
  },
  {
    timestamps: true
  }
)
