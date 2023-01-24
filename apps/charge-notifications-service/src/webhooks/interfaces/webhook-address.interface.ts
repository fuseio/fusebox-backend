import { Document } from 'mongoose'

export interface WebhookAddress extends Document {
  readonly webhookId: string;
  readonly address: string;
}
