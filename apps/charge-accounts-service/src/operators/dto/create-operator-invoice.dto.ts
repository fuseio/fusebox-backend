import { IsNumber, IsString } from 'class-validator'

export class CreateOperatorInvoiceDto {
  @IsString()
    transactionHash: string

  @IsString()
    paymentMethodId: string

  @IsString()
    pricingPlanId: string

  @IsNumber()
    monthAmount: number
}
