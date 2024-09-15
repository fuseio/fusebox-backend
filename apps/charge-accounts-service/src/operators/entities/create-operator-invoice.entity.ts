import { ApiProperty } from '@nestjs/swagger'

export class CreateOperatorInvoice {
  @ApiProperty({ example: '0x', description: 'The hash of the transaction' })
    transactionHash: string

  @ApiProperty({ example: '2233232', description: 'The id of the payment method' })
    paymentMethodId: string

  @ApiProperty({ example: '2233232', description: 'The id of the pricing plan' })
    pricingPlanId: string
}
