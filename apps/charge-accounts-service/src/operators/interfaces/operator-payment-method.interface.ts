import { Document } from 'mongoose'

export interface OperatorPaymentMethod extends Document {
  readonly name: string;
  readonly tokenAddress: string;
  readonly tokenDecimal: number;
}
