import { IsEthereumAddress, IsNumber, IsOptional } from 'class-validator'

export class TokenHistoricalStatisticsDto {
  @IsEthereumAddress()
    tokenAddress: string

  @IsNumber()
  @IsOptional()
    limit: number
}
