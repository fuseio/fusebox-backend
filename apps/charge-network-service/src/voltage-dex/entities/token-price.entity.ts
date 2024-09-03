import { ApiProperty } from '@nestjs/swagger'
import { Duration } from 'dayjs/plugin/duration'

export class TokenPrice {
  @ApiProperty({
    required: true,
    example: '0x1234567890123456789012345678901234567890',
    description: 'The token address.'
  })
    tokenAddress: string

  @ApiProperty({
    required: false,
    example: { days: 1 },
    default: { days: 1 },
    description: 'The duration object to calculate the price change over the timeFrame. duration should be passed as an object according to https://day.js.org/docs/en/durations/creating'
  })
    duration?: Duration
}
