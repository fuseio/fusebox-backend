import { Document } from 'mongoose'
import { OperatorPaymentMethodInterface } from '@app/accounts-service/operators/interfaces/operator-payment-method.interface'
import { OperatorPricingPlanInterface } from '@app/accounts-service/operators/interfaces/operator-pricing-plan.interface'

export interface OperatorInvoice extends Document {
  readonly operatorId: string;
  readonly paymentMethod: OperatorPaymentMethodInterface;
  readonly pricingPlan: OperatorPricingPlanInterface;
  readonly usdValue: number;
  readonly transactionHash: string;
  readonly subscriptionStartedAt: Date;
  readonly subscriptionEndedAt: Date;
}
