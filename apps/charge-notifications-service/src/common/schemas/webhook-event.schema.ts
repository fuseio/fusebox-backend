import * as mongoose from 'mongoose'

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
      type: String,
      required: true
    },
    responses: {
      type: [Object]
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
