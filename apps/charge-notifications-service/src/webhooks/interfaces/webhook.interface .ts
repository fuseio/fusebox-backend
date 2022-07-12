import { Document } from 'mongoose'

export interface Webhook extends Document {
  readonly projectId: string;
  readonly webhookUrl: string;
  readonly watchAddresses: string[];
  readonly eventType: string;
}
