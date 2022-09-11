import { IsEthereumAddress, IsString } from 'class-validator'

export class StakeDto {
  @IsEthereumAddress()
    accountAddress: string

  @IsString()
    tokenAmount: string

  @IsEthereumAddress()
    tokenAddress: string
}
