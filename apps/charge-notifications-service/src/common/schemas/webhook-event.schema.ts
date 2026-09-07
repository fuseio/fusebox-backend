import * as mongoose from 'mongoose'

export enum addressTypes {
  TOKEN = 'Token-Address',
  WALLET = 'Wallet-Address'
}

export const WebhookEventSchema = new mongoose.Schema(
  {
    webhook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Webhook',
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    eventData: {
      type: Object,
      required: true
    },
    direction: {
      type: String
    },
    responses: {
      type: [Object]
    },
    addressType: {
      type: String, enum: addressTypes, default: addressTypes.WALLET
    },
    numberOfTries: {
      type: Number,
      required: true,
      default: 0
    },
    retryAfter: {
      type: Date,
      required: true,
      default: Date.now
    },
    success: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// This collection had no indexes at all beyond _id, so both of its queries were
// collection scans over ~13M documents — one of them observed at 2.08 hours, which
// saturated MongoDB and starved every other query in the service, get_webhook included.

// Deduplication lookup in WebhooksService.addRelevantWebhookTokensEventsToQueue.
// All predicates are equality, so the most selective field leads.
WebhookEventSchema.index({
  'eventData.txHash': 1,
  webhook: 1,
  direction: 1,
  addressType: 1
})

// Broadcaster queue poll: find({ retryAfter: $lte, success: false, numberOfTries: $lt })
// sorted by retryAfter. It runs continuously in a loop, so it was the heavier of the two.
// Partial on success:false keeps the index to the small pending tail instead of every
// event ever delivered; the poll always filters on success:false, so it stays eligible.
// Follows equality-sort-range: retryAfter serves both the sort and its range bound.
WebhookEventSchema.index(
  { retryAfter: -1, numberOfTries: 1 },
  { partialFilterExpression: { success: false } }
)
