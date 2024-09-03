import { Document } from 'mongoose'

export interface OperatorInvoice extends Document {
  readonly operatorId: string;
  readonly paymentMethodId: string;
  readonly pricingPlanId: string;
  readonly transactionHash: string;
  readonly subscriptionStartedAt: Date;
  readonly subscriptionEndedAt: Date;
}
