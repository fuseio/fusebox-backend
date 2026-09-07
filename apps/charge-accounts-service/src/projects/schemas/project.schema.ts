import * as mongoose from 'mongoose'

export const ProjectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

// findOne({ ownerId }) and find({ ownerId }) run on ordinary account paths with no index
// behind them.
ProjectSchema.index({ ownerId: 1 })
