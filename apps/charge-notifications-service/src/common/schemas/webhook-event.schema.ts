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
//
// Declared to match the index already present in production
// (success_1_retryAfter_-1_numberOfTries_1) rather than an equivalent of our own, so
// autoIndex recognises it and does not build a second one covering the same query --
// two overlapping indexes would double the write cost for no read benefit.
//
// Equality, sort, range: success is an equality prefix, retryAfter serves both the sort
// and its range bound so there is no in-memory sort, and numberOfTries filters within
// the index. Measured against a partial variant keyed only on the pending tail, the two
// plans are indistinguishable -- same IXSCAN, same 100 documents examined, no sort --
// and this one is already warm.
WebhookEventSchema.index({ success: 1, retryAfter: -1, numberOfTries: 1 })
