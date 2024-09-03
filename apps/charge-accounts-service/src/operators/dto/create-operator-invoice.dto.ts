import { IsString, IsEthereumAddress } from 'class-validator'

export class CreateOperatorInvoiceDto {
  @IsEthereumAddress()
    transactionHash: string

  @IsString()
    paymentMethodId: string

  @IsString()
    pricingPlanId: string
}
