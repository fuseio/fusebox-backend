import { ApiProperty } from '@nestjs/swagger'

export class TokenHistoricalStatistics {
  @ApiProperty({
    required: true,
    example: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
    description: 'The token address.'
  })
    tokenAddress: string

  @ApiProperty({
    required: false,
    example: 30,
    default: 30,
    description: 'The number of days to return statistics for'
  })
    limit?: number
}
