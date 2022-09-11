import { IsString, IsEthereumAddress } from 'class-validator'

export class UnstakeDto {
  @IsEthereumAddress()
    accountAddress: string

  @IsString()
    tokenAmount: string

  @IsEthereumAddress()
    tokenAddress: string
}
