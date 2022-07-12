import * as mongoose from 'mongoose'

export const eventTypes = ['ALL', 'FUSE', 'ERC20', 'ERC721']

export const WebhookSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      immutable: true
    },
    webhookUrl: { type: String, required: true },
    watchAddresses: { type: [String] },
    eventType: { type: String, enum: eventTypes, default: 'ALL' }
  },
  {
    timestamps: true
  }
)
