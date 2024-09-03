import { IsEnum, IsEthereumAddress } from 'class-validator'

import { TimeFrame } from '@app/network-service/voltage-dex/interfaces'

export class TokenPriceChangeIntervalDto {
  @IsEthereumAddress()
    tokenAddress: string

  @IsEnum(TimeFrame)
    timeFrame: TimeFrame
}
