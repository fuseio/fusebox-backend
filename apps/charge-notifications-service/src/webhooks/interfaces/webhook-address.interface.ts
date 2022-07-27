import { Document, Model } from 'mongoose'

export interface WebhookAddress extends Document {
  readonly webhookId: string;
  readonly address: string;
}

export interface WebhookAddressModel extends Model<WebhookAddress> {}
