import * as mongoose from 'mongoose'

export enum eventTypes {
  ALL = 'ALL',
  FUSE = 'FUSE',
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721'
}

export const WebhookSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, immutable: true },
    webhookUrl: { type: String, required: true },
    eventType: { type: String, enum: eventTypes, default: 'ALL' }
  },
  {
    timestamps: true
  }
)
