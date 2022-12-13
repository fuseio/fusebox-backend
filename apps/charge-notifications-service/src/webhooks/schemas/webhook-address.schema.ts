import * as mongoose from 'mongoose'
import { WebhookAddress } from '@app/notifications-service/webhooks/interfaces/webhook-address.interface'

export const WebhookAddressSchema = new mongoose.Schema<WebhookAddress>(
  {
    webhookId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Webhook',
      required: true,
      immutable: true
    },
    address: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

WebhookAddressSchema.index({ webhookId: 1, address: 1 }, { unique: true })
