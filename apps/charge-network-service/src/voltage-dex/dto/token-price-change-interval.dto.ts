import { IsEnum, IsEthereumAddress } from 'class-validator'

import { TimeFrame } from '../interfaces'

export class TokenPriceChangeIntervalDto {
  @IsEthereumAddress()
    tokenAddress: string

  @IsEnum(TimeFrame)
    timeFrame: TimeFrame
}
