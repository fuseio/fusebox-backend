import { IsEthereumAddress, IsOptional } from 'class-validator'

import { ValidateDuration } from './duration.dto'

export class TokenPriceDto {
  @IsEthereumAddress()
    tokenAddress: string

  @IsOptional()
  @ValidateDuration()
    duration?: any
}
