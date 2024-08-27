import { ApiProperty } from '@nestjs/swagger'

export class DurationEntity {
  @ApiProperty({ example: { days: 7 }, description: 'The duration object to calculate the price change over the timeFrame duration should be passed as an object according to https://day.js.org/docs/en/durations/creating for example duration of {days: 1} means a duration of one day' })
    duration?: any
}
