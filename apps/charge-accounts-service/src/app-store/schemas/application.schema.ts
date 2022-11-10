import * as mongoose from 'mongoose'

export const ApplicationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appName: { type: String, required: true },
    isActivated: { type: Boolean, required: true }
  },
  {
    timestamps: true
  }
)
