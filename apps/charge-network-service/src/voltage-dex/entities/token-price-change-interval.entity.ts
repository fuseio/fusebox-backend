import { ApiProperty } from '@nestjs/swagger'
import { TimeFrame } from '@app/network-service/voltage-dex/interfaces'

export class TokenPriceChangeInterval {
  @ApiProperty({
    required: true,
    example: 'ALL',
    description: 'The time frame to get the price change over.',
    enum: TimeFrame,
    enumName: 'TimeFrame'
  })
    timeFrame: TimeFrame

  @ApiProperty({
    required: true,
    example: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
    description: 'The token address.'
  })
    tokenAddress: string
}
