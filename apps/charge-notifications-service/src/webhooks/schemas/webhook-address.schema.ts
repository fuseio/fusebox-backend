import * as mongoose from 'mongoose'

export const WebhookAddressSchema = new mongoose.Schema(
  {
    webhookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Webhook',
      required: true,
      immutable: true
    },
    address: { type: String, required: true },
    lowercaseAddress: { type: String, index: true }
  },
  {
    timestamps: true
  }
)

WebhookAddressSchema.index({ webhookId: 1, address: 1 }, { unique: true })

WebhookAddressSchema.pre('save', function (next) {
  this.lowercaseAddress = this.address.toLowerCase()
  next()
})
