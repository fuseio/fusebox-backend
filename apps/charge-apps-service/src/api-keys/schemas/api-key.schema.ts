import * as mongoose from 'mongoose'

export const ApiKeySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appName: { type: String, required: true, index: true },
    publicKey: { type: String, required: true, index: true },
    secretHash: { type: String },
    secretPrefix: { type: String },
    secretLastFourChars: { type: String }
  },
  {
    timestamps: true
  }
)
