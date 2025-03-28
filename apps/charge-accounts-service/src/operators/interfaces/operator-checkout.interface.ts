import { Document } from 'mongoose'

export interface OperatorCheckout extends Document {
  readonly ownerId: string;
  readonly sessionId: string;
  readonly billingCycle: string;
  readonly url: string;
  readonly cancelUrl: string;
  readonly successUrl: string;
  readonly webhookUrl: string;
  readonly expiresAt: Date;
  readonly status: string;
  readonly paymentStatus: string;
  readonly amount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
