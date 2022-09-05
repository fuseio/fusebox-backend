import { IsEthereumAddress, IsNumber } from 'class-validator'

export class StakeDto {
  @IsEthereumAddress()
    accountAddress: string

  @IsNumber()
    tokenAmount: string

  @IsEthereumAddress()
    tokenAddress: string
}
