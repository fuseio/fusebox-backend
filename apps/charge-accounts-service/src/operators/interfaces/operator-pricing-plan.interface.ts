import { Document } from 'mongoose'

export interface OperatorPricingPlan extends Document {
  readonly name: string;
  readonly amount: number;
  readonly duration: number;
}
