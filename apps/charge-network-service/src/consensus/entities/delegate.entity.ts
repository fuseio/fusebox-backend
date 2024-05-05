import { ApiProperty } from '@nestjs/swagger'

export class DelegatedAmounts {
  @ApiProperty({ example: '0x', description: 'Validator address' })
    validator: string

  @ApiProperty({ example: ['0x'], description: 'List of delegator addresses' })
    delegators: string[]
}
