import { ApiProperty } from '@nestjs/swagger'

export class WithdrawAmounts {
  @ApiProperty({ example: '0x', description: 'Validator address' })
    validator: string

  @ApiProperty({ example: '0', description: 'Amount to withdraw' })
    amount: string
}
