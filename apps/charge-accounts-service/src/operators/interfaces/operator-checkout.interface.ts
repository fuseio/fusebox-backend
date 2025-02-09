import { Document } from 'mongoose'

export interface OperatorCheckout extends Document {
  readonly ownerId: string;
  readonly sessionId: string;
  readonly url: string;
  readonly cancelUrl: string;
  readonly successUrl: string;
  readonly webhookUrl: string;
  readonly expiresAt: Date;
  readonly status: string;
  readonly paymentStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
