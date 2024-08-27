import { IsEthereumAddress, IsOptional } from 'class-validator'

import { ValidateDuration } from '@app/network-service/voltage-dex/dto/duration.dto'

export class TokenPriceDto {
  @IsEthereumAddress()
    tokenAddress: string

  @IsOptional()
  @ValidateDuration()
    duration?: any
}
