import * as mongoose from 'mongoose'

export enum eventTypes {
  ALL = 'ALL',
  FUSE = 'FUSE',
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721'
}

export const WebhookSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
    webhookUrl: { type: String, required: true },
    eventType: { type: String, enum: eventTypes, default: eventTypes.ALL }
  },
  {
    timestamps: true
  }
)

// getAllByProjectId does find({ projectId }) with nothing to serve it, so it scans the
// whole collection. Small today, but it shares a database with webhookevents and pays
// the same contention.
WebhookSchema.index({ projectId: 1 })
