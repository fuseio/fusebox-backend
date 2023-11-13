import * as mongoose from 'mongoose'

export const ScannerStatusSchema = new mongoose.Schema(
  {
    filter: {
      type: String,
      required: true
    },
    blockNumber: {
      type: Number
    }
  },
  {
    timestamps: true
  }
)
